import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const receiveSchema = z.object({
  action: z.literal("RECEIVE"),
  account: z.enum(["BANK", "WALLET", "POCKET_MONEY"]),
  bankId: z.string().cuid().optional(),
  walletId: z.string().cuid().optional(),
  paymentMethod: z.enum(["CASH", "BKASH", "NAGAD", "ROCKET", "BANK_TRANSFER", "CARD", "OTHER"]),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const parsed = receiveSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Choose where the payout was received" }, { status: 400 });
  const data = parsed.data;
  const earning = await prisma.freelanceEarning.findFirst({ where: { id: params.id, userId } });
  if (!earning) return NextResponse.json({ error: "Earning not found" }, { status: 404 });
  if (earning.status === "RECEIVED" || earning.transactionId) return NextResponse.json({ error: "This payout is already received" }, { status: 409 });
  if (data.account === "BANK" && !data.bankId) return NextResponse.json({ error: "Select a bank account" }, { status: 400 });
  if (data.account === "WALLET" && !data.walletId) return NextResponse.json({ error: "Select a wallet" }, { status: 400 });
  if (data.bankId && !await prisma.bank.findFirst({ where: { id: data.bankId, userId } })) return NextResponse.json({ error: "Bank account not found" }, { status: 400 });
  if (data.walletId && !await prisma.wallet.findFirst({ where: { id: data.walletId, userId } })) return NextResponse.json({ error: "Wallet not found" }, { status: 400 });

  const receivedAt = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({ data: { type: "INCOME", amount: earning.netAmountBdt, currency: "BDT", scope: "BUSINESS", paymentMethod: data.paymentMethod, account: data.account, bankId: data.account === "BANK" ? data.bankId : null, walletId: data.account === "WALLET" ? data.walletId : null, source: `${earning.platform} · ${earning.title}`, note: `Freelance payout. Gross ${earning.currency} ${earning.grossAmount}; fees ${earning.currency} ${Number(earning.platformFee) + Number(earning.otherFee)}.`, occurredAt: receivedAt, userId } });
    return tx.freelanceEarning.update({ where: { id: earning.id }, data: { status: "RECEIVED", receivedAt, transactionId: transaction.id } });
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const earning = await prisma.freelanceEarning.findFirst({ where: { id: params.id, userId: (session.user as any).id } });
  if (!earning) return NextResponse.json({ error: "Earning not found" }, { status: 404 });
  if (earning.transactionId) return NextResponse.json({ error: "Received earnings cannot be deleted; manage its linked transaction instead" }, { status: 409 });
  await prisma.freelanceEarning.delete({ where: { id: earning.id } });
  return new NextResponse(null, { status: 204 });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const billSchema = z.object({
  biller: z.string().trim().min(1).max(100),
  reference: z.string().trim().min(1).max(120),
  amount: z.number().positive(),
  account: z.enum(["BANK", "WALLET", "POCKET_MONEY"]),
  bankId: z.string().cuid().optional(),
  walletId: z.string().cuid().optional(),
  note: z.string().trim().max(500).optional(),
  occurredAt: z.string().datetime(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = billSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter valid bill payment details" }, { status: 400 });
  const data = parsed.data;
  const userId = (session.user as any).id;

  if (data.account === "BANK" && !data.bankId) return NextResponse.json({ error: "Choose a bank account" }, { status: 400 });
  if (data.account === "WALLET" && !data.walletId) return NextResponse.json({ error: "Choose a wallet" }, { status: 400 });
  if (data.bankId && !await prisma.bank.findFirst({ where: { id: data.bankId, userId } })) return NextResponse.json({ error: "Bank account not found" }, { status: 404 });
  if (data.walletId && !await prisma.wallet.findFirst({ where: { id: data.walletId, userId } })) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

  const accountWhere = data.account === "BANK" ? { bankId: data.bankId } : data.account === "WALLET" ? { walletId: data.walletId } : { account: "POCKET_MONEY" as const };
  const totals = await prisma.transaction.groupBy({ by: ["type"], where: { userId, ...accountWhere }, _sum: { amount: true } });
  const balance = totals.reduce((sum, entry) => sum + (entry.type === "INCOME" ? Number(entry._sum.amount ?? 0) : -Number(entry._sum.amount ?? 0)), 0);
  if (data.amount > balance) return NextResponse.json({ error: "This exceeds the available account balance" }, { status: 400 });

  const transaction = await prisma.transaction.create({ data: { type: "EXPENSE", amount: data.amount, source: `${data.biller} bill`, note: [data.reference, data.note].filter(Boolean).join(" - "), occurredAt: new Date(data.occurredAt), account: data.account, bankId: data.account === "BANK" ? data.bankId : undefined, walletId: data.account === "WALLET" ? data.walletId : undefined, paymentMethod: data.account === "POCKET_MONEY" ? "CASH" : data.account === "WALLET" ? "BKASH" : "BANK_TRANSFER", userId } });
  return NextResponse.json(transaction, { status: 201 });
}
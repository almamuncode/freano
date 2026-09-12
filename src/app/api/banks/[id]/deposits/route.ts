import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const depositSchema = z.object({
  amount: z.number().positive(),
  sourceType: z.enum(["POCKET_MONEY", "PERSON"]),
  personName: z.string().trim().min(1).max(120).optional(),
  note: z.string().trim().max(500).optional(),
  occurredAt: z.string().datetime(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = depositSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid deposit" }, { status: 400 });

  const userId = (session.user as any).id;
  const bank = await prisma.bank.findFirst({ where: { id: params.id, userId } });
  if (!bank) return NextResponse.json({ error: "Bank account not found" }, { status: 404 });

  if (parsed.data.sourceType === "PERSON" && !parsed.data.personName) return NextResponse.json({ error: "Enter the person's name" }, { status: 400 });
  if (parsed.data.sourceType === "POCKET_MONEY") {
    const totals = await prisma.transaction.groupBy({ by: ["type"], where: { userId, account: "POCKET_MONEY" }, _sum: { amount: true } });
    const pocketBalance = totals.reduce((total, item) => total + (item.type === "INCOME" ? Number(item._sum.amount ?? 0) : -Number(item._sum.amount ?? 0)), 0);
    if (parsed.data.amount > pocketBalance) return NextResponse.json({ error: "This exceeds your available pocket money" }, { status: 400 });
    const transferId = crypto.randomUUID();
    const records = await prisma.$transaction([
      prisma.transaction.create({ data: { type: "EXPENSE", amount: parsed.data.amount, source: `Deposit to ${bank.name}`, note: parsed.data.note || undefined, occurredAt: new Date(parsed.data.occurredAt), account: "POCKET_MONEY", paymentMethod: "CASH", transferId, userId } }),
      prisma.transaction.create({ data: { type: "INCOME", amount: parsed.data.amount, source: "Pocket money transfer", note: parsed.data.note || undefined, occurredAt: new Date(parsed.data.occurredAt), account: "BANK", bankId: bank.id, paymentMethod: "BANK_TRANSFER", transferId, isDeposit: true, userId } }),
    ]);
    return NextResponse.json(records, { status: 201 });
  }

  const deposit = await prisma.transaction.create({
    data: {
      type: "INCOME",
      amount: parsed.data.amount,
      source: `Deposit from ${parsed.data.personName}`,
      note: parsed.data.note || undefined,
      occurredAt: new Date(parsed.data.occurredAt),
      account: "BANK",
      bankId: bank.id,
      paymentMethod: "BANK_TRANSFER",
      isDeposit: true,
      userId,
    },
  });
  return NextResponse.json(deposit, { status: 201 });
}
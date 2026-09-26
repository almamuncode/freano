import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const transferSchema = z.object({
  amount: z.number().positive(),
  sourceType: z.enum(["BANK", "CASH", "PROJECT_FEE", "GIFT", "OTHER"]),
  bankId: z.string().cuid().optional(),
  occurredAt: z.string().datetime(),
  note: z.string().trim().max(500).optional(),
  clientRequestId: z.string().uuid().optional(),
});

const sourceLabels = {
  CASH: "Cash",
  PROJECT_FEE: "Project fee",
  GIFT: "Gift",
  OTHER: "Other income",
} as const;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = transferSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid transfer data" }, { status: 400 });

  const userId = (session.user as any).id;
  const data = parsed.data;
  if (data.clientRequestId) {
    const existing = await prisma.transaction.findUnique({
      where: { userId_clientRequestId: { userId, clientRequestId: data.clientRequestId } },
    });
    if (existing) return NextResponse.json(existing);
  }
  if (data.sourceType !== "BANK") {
    const transaction = await prisma.transaction.create({
      data: {
        type: "INCOME",
        amount: data.amount,
        source: sourceLabels[data.sourceType],
        note: data.note || undefined,
        occurredAt: new Date(data.occurredAt),
        account: "POCKET_MONEY",
        paymentMethod: data.sourceType === "CASH" ? "CASH" : "OTHER",
        userId,
        clientRequestId: data.clientRequestId,
      },
    });
    return NextResponse.json(transaction, { status: 201 });
  }

  if (!data.bankId) return NextResponse.json({ error: "Choose the bank account to withdraw from" }, { status: 400 });
  const bank = await prisma.bank.findFirst({ where: { id: data.bankId, userId } });
  if (!bank) return NextResponse.json({ error: "Bank account not found" }, { status: 400 });
  const bankTotals = await prisma.transaction.groupBy({ by: ["type"], where: { userId, bankId: bank.id }, _sum: { amount: true } });
  const bankBalance = bankTotals.reduce((total, entry) => total + (entry.type === "INCOME" ? Number(entry._sum.amount ?? 0) : -Number(entry._sum.amount ?? 0)), 0);
  if (data.amount > bankBalance) return NextResponse.json({ error: "This amount exceeds the available bank balance" }, { status: 400 });
  const transferId = crypto.randomUUID();

  const records = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        type: "EXPENSE",
        amount: data.amount,
        source: "Withdrawal to pocket money",
        note: data.note || undefined,
        occurredAt: new Date(data.occurredAt),
        account: "BANK",
        bankId: data.bankId,
        paymentMethod: "BANK_TRANSFER",
        transferId,
        userId,
        clientRequestId: data.clientRequestId,
      },
    }),
    prisma.transaction.create({
      data: {
        type: "INCOME",
        amount: data.amount,
        source: "Bank allocation",
        note: data.note || undefined,
        occurredAt: new Date(data.occurredAt),
        account: "POCKET_MONEY",
        paymentMethod: "BANK_TRANSFER",
        transferId,
        userId,
      },
    }),
  ]);

  return NextResponse.json(records, { status: 201 });
}

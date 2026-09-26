import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive(),
  currency: z.string().default("BDT"),
  scope: z.enum(["PERSONAL", "FAMILY", "BUSINESS"]).default("PERSONAL"),
  paymentMethod: z
    .enum(["CASH", "BKASH", "NAGAD", "ROCKET", "BANK_TRANSFER", "CARD", "OTHER"])
    .default("CASH"),
  account: z.enum(["BANK", "POCKET_MONEY", "WALLET"]).default("BANK"),
  bankId: z.string().cuid().optional(),
  walletId: z.string().cuid().optional(),
  source: z.string().min(1), // client/shop/family member name etc.
  note: z.string().optional(),
  occurredAt: z.string(), // ISO date-time string from the form (date + time combined)
  categoryId: z.string().optional(),
  clientRequestId: z.string().uuid().optional(),
});

// GET /api/transactions?type=EXPENSE&scope=FAMILY&from=2026-01-01&to=2026-01-31
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url || "http://localhost:3000/api/transactions");
  const type = searchParams.get("type");
  const scope = searchParams.get("scope");
  const account = searchParams.get("account");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: (session.user as any).id,
      ...(type ? { type: type as any } : {}),
      ...(scope ? { scope: scope as any } : {}),
      ...(account ? { account: account as any } : {}),
      ...(from || to
        ? {
            occurredAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: { category: true },
    orderBy: { occurredAt: "desc" },
  });

  return NextResponse.json(transactions);
}

// POST /api/transactions
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const userId = (session.user as any).id;

  if (data.clientRequestId) {
    const existing = await prisma.transaction.findUnique({
      where: { userId_clientRequestId: { userId, clientRequestId: data.clientRequestId } },
    });
    if (existing) return NextResponse.json(existing);
  }

  if (data.account === "BANK" && !data.bankId) {
    return NextResponse.json({ error: "Select the bank account for this transaction" }, { status: 400 });
  }
  if (data.account === "WALLET" && !data.walletId) {
    return NextResponse.json({ error: "Select the wallet for this transaction" }, { status: 400 });
  }

  if (data.bankId) {
    const bank = await prisma.bank.findFirst({ where: { id: data.bankId, userId } });
    if (!bank) return NextResponse.json({ error: "Bank account not found" }, { status: 400 });
  }
  if (data.walletId) {
    const wallet = await prisma.wallet.findFirst({ where: { id: data.walletId, userId } });
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      ...data,
      bankId: data.account === "BANK" ? data.bankId : undefined,
      walletId: data.account === "WALLET" ? data.walletId : undefined,
      occurredAt: new Date(data.occurredAt),
      userId,
    },
  });

  return NextResponse.json(transaction, { status: 201 });
}

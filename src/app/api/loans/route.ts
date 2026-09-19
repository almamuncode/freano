import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidBangladeshiPhone, normalizeBangladeshiPhone } from "@/lib/profile-validation";

const optionalCuid = z.preprocess((value) => value === "" ? undefined : value, z.string().cuid().optional());

const loanSchema = z.object({
  direction: z.enum(["LENT", "BORROWED"]),
  person: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  principal: z.number().positive(),
  interestRate: z.number().min(0).max(100).default(0),
  dueDate: z.string().optional(),
  note: z.string().trim().max(500).optional(),
  account: z.enum(["BANK", "WALLET", "POCKET_MONEY"]),
  bankId: optionalCuid,
  walletId: optionalCuid,
});

function accountData(account: "BANK" | "WALLET" | "POCKET_MONEY", bankId?: string, walletId?: string) {
  return { account, bankId: account === "BANK" ? bankId : undefined, walletId: account === "WALLET" ? walletId : undefined };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const loans = await prisma.loan.findMany({
    where: { userId: (session.user as any).id },
    include: { payments: { orderBy: { paidAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(loans);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = loanSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter valid loan details" }, { status: 400 });
  const data = parsed.data;
  const phone = normalizeBangladeshiPhone(data.phone);
  if (!isValidBangladeshiPhone(phone)) return NextResponse.json({ error: "Enter a valid Bangladeshi mobile number" }, { status: 400 });
  const userId = (session.user as any).id;
  if (data.account === "BANK" && (!data.bankId || !await prisma.bank.findFirst({ where: { id: data.bankId, userId } }))) return NextResponse.json({ error: "Choose a valid bank account" }, { status: 400 });
  if (data.account === "WALLET" && (!data.walletId || !await prisma.wallet.findFirst({ where: { id: data.walletId, userId } }))) return NextResponse.json({ error: "Choose a valid wallet" }, { status: 400 });

  const transactionAccount = accountData(data.account, data.bankId, data.walletId);
  if (data.direction === "LENT") {
    const totals = await prisma.transaction.groupBy({ by: ["type"], where: { userId, ...transactionAccount }, _sum: { amount: true } });
    const balance = totals.reduce((sum, entry) => sum + (entry.type === "INCOME" ? Number(entry._sum.amount ?? 0) : -Number(entry._sum.amount ?? 0)), 0);
    if (data.principal > balance) return NextResponse.json({ error: "This exceeds the available account balance" }, { status: 400 });
  }

  const loan = await prisma.$transaction(async (transaction) => {
    const createdLoan = await transaction.loan.create({
      data: {
        direction: data.direction,
        person: data.person,
        phone,
        principal: data.principal,
        interestRate: data.interestRate,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        note: data.note || null,
        userId,
      },
    });
    await transaction.transaction.create({
      data: {
        type: data.direction === "LENT" ? "EXPENSE" : "INCOME",
        amount: data.principal,
        source: `${data.direction === "LENT" ? "Loan given to" : "Loan received from"} ${data.person}`,
        note: data.note || undefined,
        occurredAt: new Date(),
        paymentMethod: data.account === "POCKET_MONEY" ? "CASH" : "BANK_TRANSFER",
        userId,
        ...transactionAccount,
      },
    });
    return createdLoan;
  });
  return NextResponse.json(loan, { status: 201 });
}
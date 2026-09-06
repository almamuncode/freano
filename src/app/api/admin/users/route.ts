import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: { select: { transactions: true } },
      transactions: {
        select: { type: true, amount: true },
      },
    },
  });

  // Compute each user's balance (income - expense) without exposing every raw transaction
  const withBalances = users.map((u) => {
    const income = u.transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = u.transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const { transactions, ...rest } = u;
    return { ...rest, transactionCount: u._count.transactions, balance: income - expense };
  });

  return NextResponse.json(withBalances);
}

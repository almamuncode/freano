import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SummaryCard from "@/components/SummaryCard";
import TransactionList from "@/components/TransactionList";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { occurredAt: "desc" },
    take: 10,
  });

  const totals = await prisma.transaction.groupBy({
    by: ["type"],
    where: { userId },
    _sum: { amount: true },
  });

  const income = Number(totals.find((t) => t.type === "INCOME")?._sum.amount ?? 0);
  const expense = Number(totals.find((t) => t.type === "EXPENSE")?._sum.amount ?? 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="Total Income" amount={income} colorClass="text-income" />
        <SummaryCard label="Total Expense" amount={expense} colorClass="text-expense" />
        <SummaryCard label="Balance" amount={income - expense} colorClass="text-brand" />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Recent Transactions</h2>
        <TransactionList
          transactions={transactions.map((t) => ({
            ...t,
            amount: Number(t.amount),
            occurredAt: t.occurredAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}

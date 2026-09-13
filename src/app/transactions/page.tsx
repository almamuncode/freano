import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TransactionList from "@/components/TransactionList";
import Link from "next/link";

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const transactions = await prisma.transaction.findMany({
    where: { userId: (session.user as any).id },
    include: { category: true },
    orderBy: { occurredAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brass">Money movement</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Transactions</h1>
          <p className="mt-1 text-sm text-ink/60">Record income and spending without leaving this workspace.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Link href="/transactions/add?type=INCOME" className="rounded-lg bg-income px-4 py-2 text-center text-sm font-semibold text-white">+ Income</Link>
          <Link href="/transactions/add?type=EXPENSE" className="rounded-lg bg-expense px-4 py-2 text-center text-sm font-semibold text-white">- Expense</Link>
          <Link href="/bills/pay" className="col-span-2 rounded-lg border border-[#e8d7aa] bg-[#fffcf5] px-4 py-2 text-center text-sm font-semibold text-brass sm:col-auto">Pay bill</Link>
        </div>
      </div>
      <TransactionList
        transactions={transactions.map((t) => ({
          ...t,
          amount: Number(t.amount),
          occurredAt: t.occurredAt.toISOString(),
        }))}
      />
    </div>
  );
}

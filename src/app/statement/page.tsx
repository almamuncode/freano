import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TransactionList from "@/components/TransactionList";
import StatementExport from "@/components/StatementExport";

export default async function StatementPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; scope?: string; type?: string; account?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const { from, to, scope, type, account } = searchParams;

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

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brass">Your records</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Statement</h1>
          <p className="mt-1 text-sm text-ink/60">Review, filter, and download your transaction history.</p>
        </div>
        <StatementExport transactions={transactions.map((t) => ({ ...t, amount: Number(t.amount), occurredAt: t.occurredAt.toISOString() }))} />
      </div>

      {/* Simple filter form - reads/writes URL query params, works without JS */}
      <form className="card-surface grid grid-cols-2 gap-3 p-4 sm:grid-cols-5">
        <input type="date" name="from" defaultValue={from} className="border rounded-lg px-2 py-1" />
        <input type="date" name="to" defaultValue={to} className="border rounded-lg px-2 py-1" />
        <select name="type" defaultValue={type ?? ""} className="border rounded-lg px-2 py-1">
          <option value="">All Types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
        <select name="scope" defaultValue={scope ?? ""} className="border rounded-lg px-2 py-1">
          <option value="">All Scopes</option>
          <option value="PERSONAL">Personal</option>
          <option value="FAMILY">Family</option>
          <option value="BUSINESS">Business</option>
        </select>
        <select name="account" defaultValue={account ?? ""} className="border rounded-lg px-2 py-1">
          <option value="">All accounts</option>
          <option value="BANK">Bank account</option>
          <option value="POCKET_MONEY">Pocket money</option>
        </select>
        <button className="col-span-2 sm:col-span-5 bg-brand text-white rounded-lg py-2">
          Filter
        </button>
      </form>

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

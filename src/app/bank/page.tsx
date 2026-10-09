import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import WorkspaceStat from "@/components/WorkspaceStat";
import BankForm from "@/components/BankForm";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BankPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;
  const banks = await prisma.bank.findMany({ where: { userId }, include: { transactions: { select: { type: true, amount: true } } }, orderBy: { createdAt: "asc" } });
  const balanceOf = (bank: typeof banks[number]) => bank.transactions.reduce((sum, transaction) => sum + (transaction.type === "INCOME" ? Number(transaction.amount) : -Number(transaction.amount)), 0);
  const totalIn = banks.flatMap((bank) => bank.transactions).filter((t) => t.type === "INCOME").reduce((sum, t) => sum + Number(t.amount), 0);
  const totalOut = banks.flatMap((bank) => bank.transactions).filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + Number(t.amount), 0);
  return <div className="space-y-5">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-3xl font-bold">Bank Accounts</h1><p className="mt-1 text-sm text-ink/60">Manage your bank accounts and track balances.</p></div><a href="#add-bank" className="btn-primary">+ Add account</a></div>
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <WorkspaceStat label="Total balance" value={formatMoney(totalIn - totalOut)} tone="blue" icon="▥" />
      <WorkspaceStat label="Bank accounts" value={String(banks.length)} icon="▣" />
      <WorkspaceStat label="Total in" value={formatMoney(totalIn)} tone="green" icon="↑" />
      <WorkspaceStat label="Total out" value={formatMoney(totalOut)} tone="pink" icon="↓" />
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{banks.map((bank) => <Link key={bank.id} href={`/bank/${bank.id}`} className="card-surface group p-5 transition hover:border-brand/40"><div className="flex items-center gap-3"><span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-xl text-sky-500">▥</span><div className="min-w-0"><p className="font-bold">{bank.name}</p><p className="mt-1 truncate text-xs text-ink/55">{bank.details || "Bank account"}</p></div></div><p className="mt-5 text-2xl font-bold tabular-nums">{formatMoney(balanceOf(bank))}</p><span className="mt-4 flex items-center justify-between rounded-lg bg-brand/5 px-3 py-2 text-xs font-medium text-brand">View transactions <span aria-hidden="true">→</span></span></Link>)}</div>
    {banks.length === 0 && <div className="card-surface p-8 text-center text-sm text-ink/60">Add your first bank account to start recording bank activity.</div>}
    <section id="add-bank" className="card-surface scroll-mt-24 p-5 sm:p-6"><h2 className="mb-4 text-lg font-bold">Add a bank account</h2><BankForm /></section>
  </div>;
}

function formatMoney(amount: number) { return `৳${new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(amount)}`; }
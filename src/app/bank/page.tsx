import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import BankForm from "@/components/BankForm";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BankPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;
  const banks = await prisma.bank.findMany({ where: { userId }, include: { transactions: { select: { type: true, amount: true } } }, orderBy: { createdAt: "asc" } });
  return <div className="space-y-5"><section className="card-surface p-6 sm:p-8"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-brass">Bank accounts</p><h1 className="mt-2 text-3xl font-bold text-ink">Your banks</h1><p className="mt-1 text-sm text-ink/60">Keep each bank balance separate while your dashboard shows the total.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{banks.map((bank) => { const balance = bank.transactions.reduce((total, transaction) => total + (transaction.type === "INCOME" ? Number(transaction.amount) : -Number(transaction.amount)), 0); return <Link key={bank.id} href={`/bank/${bank.id}`} className="rounded-lg border border-hairline bg-[#f8f6ff] p-4 transition hover:border-brand/40"><p className="font-bold text-ink">{bank.name}</p><p className="mt-1 truncate text-xs text-ink/55">{bank.details || "No account details added"}</p><p className="mt-4 text-2xl font-bold text-brand">{formatMoney(balance)}</p></Link>; })}</div>{banks.length === 0 && <p className="mt-5 text-sm text-ink/60">Add your first bank account to start recording bank activity.</p>}<div className="mt-6"><h2 className="mb-3 font-bold text-ink">Add a bank</h2><BankForm /></div></section></div>;
}

function formatMoney(amount: number) { return `৳${new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(amount)}`; }
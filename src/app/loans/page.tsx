import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LoanTracker from "@/components/LoanTracker";

export default async function LoansPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const loans = await prisma.loan.findMany({ where: { userId: (session.user as any).id }, include: { payments: true }, orderBy: { createdAt: "desc" } });
  const [banks, wallets] = await Promise.all([
    prisma.bank.findMany({ where: { userId: (session.user as any).id }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.wallet.findMany({ where: { userId: (session.user as any).id }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const lent = loans.filter((loan) => loan.direction === "LENT" && loan.status === "OPEN").reduce((sum, loan) => sum + Number(loan.principal), 0);
  const borrowed = loans.filter((loan) => loan.direction === "BORROWED" && loan.status === "OPEN").reduce((sum, loan) => sum + Number(loan.principal), 0);
  return <div className="space-y-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brass">Borrowing and lending</p><h1 className="mt-2 text-3xl font-bold text-ink">Loans</h1><p className="mt-1 text-sm text-ink/60">Know who owes you, who you owe, and what interest is involved.</p></div><Link href="/projects" className="text-sm font-semibold text-brand">Track unpaid projects -&gt;</Link></div><div className="grid gap-3 sm:grid-cols-2"><div className="card-surface p-4"><p className="text-xs font-semibold uppercase tracking-wider text-income">You lent</p><p className="mt-1 text-2xl font-bold text-ink">৳{lent.toLocaleString("en-BD")}</p></div><div className="card-surface p-4"><p className="text-xs font-semibold uppercase tracking-wider text-rust">You borrowed</p><p className="mt-1 text-2xl font-bold text-ink">৳{borrowed.toLocaleString("en-BD")}</p></div></div><LoanTracker banks={banks} wallets={wallets} initialLoans={loans.map((loan) => ({ ...loan, principal: Number(loan.principal), interestRate: Number(loan.interestRate), dueDate: loan.dueDate?.toISOString() ?? null, payments: loan.payments.map((payment) => ({ ...payment, amount: Number(payment.amount), paidAt: payment.paidAt.toISOString() })) }))} /></div>;
}
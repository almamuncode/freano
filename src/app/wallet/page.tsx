import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import CategoryIcon from "@/components/CategoryIcon";
import WalletForm from "@/components/WalletForm";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function WalletPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const wallets = await prisma.wallet.findMany({ where: { userId: (session.user as any).id }, include: { transactions: { select: { type: true, amount: true } } }, orderBy: { createdAt: "asc" } });
  return <div className="space-y-5"><section className="card-surface p-6 sm:p-8"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-brass">Digital wallets</p><h1 className="mt-2 text-3xl font-bold text-ink">Your wallets</h1><p className="mt-1 text-sm text-ink/60">Keep bKash, Rocket, Nagad, and other wallet balances separate.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{wallets.map((wallet) => { const balance = wallet.transactions.reduce((total, transaction) => total + (transaction.type === "INCOME" ? Number(transaction.amount) : -Number(transaction.amount)), 0); return <Link key={wallet.id} href={`/wallet/${wallet.id}`} className="rounded-lg border border-hairline bg-[#f8f6ff] p-4 transition hover:border-brand/40"><div className="flex items-center gap-3"><CategoryIcon name="wallet" variant="soft" /><p className="font-bold text-ink">{wallet.name}</p></div><p className="mt-1 truncate text-xs text-ink/55">{wallet.details || "No wallet details added"}</p><p className={`mt-4 text-2xl font-bold tabular-nums ${balance < 0 ? "text-expense" : "text-ink"}`}>{formatMoney(balance)}</p></Link>; })}</div>{wallets.length === 0 && <p className="mt-5 text-sm text-ink/60">Your wallet list is empty. Add bKash, Rocket, Nagad, or another wallet to begin.</p>}<div className="mt-6"><h2 className="mb-3 font-bold text-ink">Add a wallet</h2><WalletForm /></div></section></div>;
}

function formatMoney(amount: number) { return `৳${new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(amount)}`; }
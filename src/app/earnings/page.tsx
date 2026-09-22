import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EarningsWorkspace from "@/components/EarningsWorkspace";

export default async function EarningsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;
  const [earnings, banks, wallets] = await Promise.all([
    prisma.freelanceEarning.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.bank.findMany({ where: { userId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.wallet.findMany({ where: { userId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const pending = earnings.filter((item) => item.status !== "RECEIVED").reduce((sum, item) => sum + Number(item.netAmountBdt), 0);
  const fees = earnings.reduce((sum, item) => sum + (Number(item.platformFee) + Number(item.otherFee)) * Number(item.exchangeRate), 0);
  const received = earnings.filter((item) => item.status === "RECEIVED").reduce((sum, item) => sum + Number(item.netAmountBdt), 0);
  return <div className="space-y-6"><div><p className="page-kicker">Freelance income hub</p><h1 className="mt-2 text-3xl font-bold">Earnings</h1><p className="mt-1 text-sm text-ink/60">Track marketplace, creator-platform, and direct-client income from gross earning to final payout.</p></div><div className="grid gap-3 sm:grid-cols-3"><Metric label="Pending payouts" value={pending} tone="text-[#9a6c00]"/><Metric label="Received" value={received} tone="text-income"/><Metric label="Fees paid" value={fees} tone="text-rust"/></div><EarningsWorkspace initialEarnings={earnings.map((item) => ({ ...item, grossAmount: Number(item.grossAmount), platformFee: Number(item.platformFee), otherFee: Number(item.otherFee), exchangeRate: Number(item.exchangeRate), netAmountBdt: Number(item.netAmountBdt), expectedPayoutAt: item.expectedPayoutAt?.toISOString() ?? null, receivedAt: item.receivedAt?.toISOString() ?? null }))} banks={banks} wallets={wallets}/></div>;
}

function Metric({ label, value, tone }: { label: string; value: number; tone: string }) { return <div className="card-surface p-4"><p className="text-xs font-semibold uppercase tracking-wider text-ink/45">{label}</p><p className={`mt-2 text-2xl font-bold ${tone}`}>৳{new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(value)}</p></div>; }

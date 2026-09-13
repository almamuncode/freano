import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import BillPaymentForm from "@/components/BillPaymentForm";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PayBillPage({ searchParams }: { searchParams: { account?: string; bankId?: string; walletId?: string; returnTo?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;
  const [banks, wallets] = await Promise.all([prisma.bank.findMany({ where: { userId }, select: { id: true, name: true }, orderBy: { name: "asc" } }), prisma.wallet.findMany({ where: { userId }, select: { id: true, name: true }, orderBy: { name: "asc" } })]);
  const initialAccount = ["BANK", "WALLET", "POCKET_MONEY"].includes(searchParams.account ?? "") ? searchParams.account as "BANK" | "WALLET" | "POCKET_MONEY" : undefined;
  const returnTo = searchParams.returnTo && /^(\/bank\/[^/]+|\/wallet\/[^/]+|\/pocket-money)$/.test(searchParams.returnTo) ? searchParams.returnTo : undefined;
  return <div className="space-y-5"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-brass">Payments</p><h1 className="mt-2 text-3xl font-bold text-ink">Pay a bill</h1><p className="mt-1 text-sm text-ink/60">Record utility, internet, mobile, and other regular payments from the account you choose.</p></div><BillPaymentForm banks={banks} wallets={wallets} initialAccount={initialAccount} initialBankId={initialAccount === "BANK" ? searchParams.bankId : undefined} initialWalletId={initialAccount === "WALLET" ? searchParams.walletId : undefined} returnTo={returnTo} /></div>;
}
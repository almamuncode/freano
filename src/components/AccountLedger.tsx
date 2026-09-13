import Link from "next/link";
import TransactionList from "@/components/TransactionList";
import { Account, Transaction } from "@/types";

const accountInfo: Record<Account, { title: string; subtitle: string; addLabel: string }> = {
  BANK: { title: "Bank account", subtitle: "Deposits, withdrawals, and allocations from your bank.", addLabel: "Deposit" },
  SAVINGS: { title: "Personal savings", subtitle: "Funds you have set aside for yourself.", addLabel: "Add savings" },
  POCKET_MONEY: { title: "Pocket money", subtitle: "Your available day-to-day spending money.", addLabel: "Add funds" },
  WALLET: { title: "Wallet", subtitle: "Your digital wallet balance and activity.", addLabel: "Add funds" },
};

export default function AccountLedger({ account, balance, transactions, bank, wallet, action }: { account: Account; balance: number; transactions: Transaction[]; bank?: { id: string; name: string; details?: string | null }; wallet?: { id: string; name: string; details?: string | null }; action?: React.ReactNode }) {
  const info = accountInfo[account];
  const accountParam = bank ? `account=BANK&bankId=${bank.id}` : wallet ? `account=WALLET&walletId=${wallet.id}` : `account=${account}`;
  const returnPath = bank ? `/bank/${bank.id}` : wallet ? `/wallet/${wallet.id}` : account === "POCKET_MONEY" ? "/pocket-money" : undefined;
  const returnTo = returnPath ? `&returnTo=${encodeURIComponent(returnPath)}` : "";
  const money = `৳${new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(balance)}`;

  return (
    <div className="space-y-5">
      <section className="card-surface bg-[#20293A] p-6 text-white sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9fe3a3]">Account balance</p>
        <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><h1 className="account-balance-heading text-3xl font-bold">{bank?.name ?? wallet?.name ?? info.title}</h1><p className="mt-1 text-sm text-white/65">{bank?.details || wallet?.details || info.subtitle}</p></div><p className="text-4xl font-bold">{money}</p></div>
        {account !== "SAVINGS" && <Link href={`/bills/pay?${accountParam}${returnTo}`} className="mt-5 inline-flex rounded-lg bg-[#f5eddb] px-4 py-2.5 text-sm font-semibold text-brass">Pay bill</Link>}
        {account !== "BANK" && !action && <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md"><Link href={`/transactions/add?type=INCOME&${accountParam}${returnTo}`} className="rounded-lg bg-[#e7f4e8] px-4 py-3 text-center text-sm font-semibold text-sage">+ {info.addLabel}</Link><Link href={`/transactions/add?type=EXPENSE&${accountParam}${returnTo}`} className="rounded-lg bg-[#fae9e5] px-4 py-3 text-center text-sm font-semibold text-rust">- Record expense</Link></div>}
        {action}
      </section>
      <section><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold text-ink">{info.title} activity</h2><Link href={`/statement?${accountParam}`} className="text-sm font-semibold text-brand">View statement</Link></div><TransactionList transactions={transactions} /></section>
    </div>
  );
}
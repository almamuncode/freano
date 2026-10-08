"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createGuestStore, guestBalance, type GuestData } from "@/lib/guest-store";
import { WorkspaceContext, WorkspaceLink } from "./WorkspaceContext";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import BankForm from "./BankForm";
import WalletForm from "./WalletForm";
import AccountLedger from "./AccountLedger";
import AccountTransferPanel from "./AccountTransferPanel";
import AccountRemovalButton from "./AccountRemovalButton";
import BillPaymentForm from "./BillPaymentForm";
import LoanTracker from "./LoanTracker";
import ProjectTracker from "./ProjectTracker";
import EarningsWorkspace from "./EarningsWorkspace";
import StatementExport from "./StatementExport";
import DashboardChart from "./DashboardChart";
import BudgetHealthCard from "./BudgetHealthCard";

const sections = [
  ["/dashboard", "Dashboard"], ["/earnings", "Earnings"], ["/projects", "Projects"],
  ["/transactions", "Transactions"], ["/bank", "Banks"], ["/wallet", "Wallets"],
  ["/pocket-money", "Pocket money"], ["/loans", "Loans"], ["/statement", "Statement"],
] as const;
const money = (value: number) => `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

export default function GuestWorkspace() {
  const [store] = useState(createGuestStore);
  const [data, setData] = useState(store.snapshot);
  const [path, setPath] = useState("/dashboard");
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    const readHash = () => { try { setPath(decodeURIComponent(window.location.hash.slice(1)) || "/dashboard"); } catch { setPath("/dashboard"); } };
    readHash(); window.addEventListener("hashchange", readHash);
    // A restored browser history entry must not resurrect guest data.
    const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) { store.reset(); setData(store.snapshot()); setGeneration(n => n + 1); } };
    const onPageHide = () => { store.reset(); };
    window.addEventListener("pageshow", onPageShow); window.addEventListener("pagehide", onPageHide);
    return () => { window.removeEventListener("hashchange", readHash); window.removeEventListener("pageshow", onPageShow); window.removeEventListener("pagehide", onPageHide); store.reset(); };
  }, [store]);
  const workspace = useMemo(() => ({
    async request(url: string, init?: RequestInit) { const response = await store.request(url, init); if (response.ok) setData(store.snapshot()); return response; },
    push(next: string) { setPath(next); window.location.hash = encodeURIComponent(next); window.scrollTo({ top: 0 }); },
    refresh() { setData(store.snapshot()); },
  }), [store]);
  const url = new URL(path, "https://guest.freano.local");
  return <WorkspaceContext.Provider value={workspace}>
    <div className="space-y-6">
      <section className="card-surface flex flex-col justify-between gap-4 border-brand/30 p-5 sm:flex-row sm:items-center">
        <div><p className="page-kicker">Guest mode</p><h1 className="mt-1 text-xl font-bold">Try Freano without an account</h1><p className="mt-2 text-sm text-ink/60">Your data stays in this tab only. Closing, refreshing, or leaving this workspace clears it.</p></div>
        <div className="flex shrink-0 flex-wrap gap-3"><Link href="/register" className="btn-primary">Create account</Link><button className="rounded-xl border px-4 py-2 text-sm font-semibold" onClick={() => { if (window.confirm("Clear all guest data and start again?")) { store.reset(); setData(store.snapshot()); setGeneration(n => n + 1); workspace.push("/dashboard"); } }}>Reset demo</button></div>
      </section>
      <nav aria-label="Guest workspace" className="flex flex-wrap gap-2">{sections.map(([href, label]) => <WorkspaceLink key={href} href={href} className={`rounded-xl px-3 py-2 text-sm font-semibold ${url.pathname === href || url.pathname.startsWith(`${href}/`) ? "bg-brand text-white" : "border border-hairline bg-white text-ink"}`}>{label}</WorkspaceLink>)}</nav>
      <GuestView key={`${generation}:${path}`} data={data} url={url} />
    </div>
  </WorkspaceContext.Provider>;
}

function GuestView({ data, url }: { data: GuestData; url: URL }) {
  const { pathname, searchParams: query } = url;
  const transactions = [...data.transactions].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const options = { banks: data.banks, wallets: data.wallets };
  const account = query.get("account");
  const initialAccount: "BANK" | "WALLET" | "POCKET_MONEY" | undefined = account === "BANK" || account === "WALLET" || account === "POCKET_MONEY" ? account : undefined;
  const initial = { initialAccount, initialBankId: query.get("bankId") ?? undefined, initialWalletId: query.get("walletId") ?? undefined, returnTo: query.get("returnTo") ?? undefined };
  if (pathname === "/transactions/add" || pathname.startsWith("/transactions/edit/")) {
    const transaction = pathname.startsWith("/transactions/edit/") ? transactions.find(t => t.id === pathname.split("/").pop()) : undefined;
    if (pathname.startsWith("/transactions/edit/") && !transaction) return <p>Transaction not found.</p>;
    return <div className="space-y-4"><h2 className="text-2xl font-bold">{transaction ? "Edit transaction" : "Add transaction"}</h2><TransactionForm {...options} {...initial} transaction={transaction} initialType={query.get("type") === "INCOME" ? "INCOME" : "EXPENSE"} /></div>;
  }
  if (pathname === "/transactions") return <div className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-bold">Transactions</h2><div className="flex flex-wrap gap-3"><WorkspaceLink className="btn-primary" href="/transactions/add?type=INCOME">+ Income</WorkspaceLink><WorkspaceLink className="btn-primary" href="/transactions/add?type=EXPENSE">− Expense</WorkspaceLink><WorkspaceLink className="btn-primary" href="/bills/pay">Pay bill</WorkspaceLink></div></div><TransactionList transactions={transactions} /></div>;
  if (pathname === "/bills/pay") return <div className="space-y-4"><h2 className="text-2xl font-bold">Record bill payment</h2><BillPaymentForm {...options} {...initial} /></div>;
  if (pathname === "/loans") return <div className="space-y-5"><h2 className="text-2xl font-bold">Loan tracker</h2><LoanTracker initialLoans={data.loans} /></div>;
  if (pathname === "/projects") return <div className="space-y-5"><h2 className="text-2xl font-bold">Unpaid projects</h2><p className="card-surface p-4">Outstanding: <strong>{money(data.projects.reduce((sum, p) => sum + p.agreedAmount - p.paidAmount, 0))}</strong></p><ProjectTracker initialProjects={data.projects} /></div>;
  if (pathname === "/earnings") return <div className="space-y-5"><h2 className="text-2xl font-bold">Freelance earnings</h2><EarningsWorkspace {...options} initialEarnings={data.earnings} /></div>;
  if (pathname === "/bank" || pathname === "/wallet") {
    const isBank = pathname === "/bank";
    return <section className="card-surface space-y-5 p-6"><h2 className="text-2xl font-bold">{isBank ? "Bank accounts" : "Wallets"}</h2><div className="grid gap-3 sm:grid-cols-2">{(isBank ? data.banks : data.wallets).map(item => <WorkspaceLink key={item.id} href={`${pathname}/${item.id}`} className="rounded-xl border p-4"><p className="font-bold">{item.name}</p><p className="text-sm text-ink/60">{item.details}</p><p className="mt-3 text-xl font-bold text-brand">{money(guestBalance(data, isBank ? "BANK" : "WALLET", item.id))}</p></WorkspaceLink>)}</div><h3 className="font-bold">{isBank ? "Add a bank" : "Add a wallet"}</h3>{isBank ? <BankForm /> : <WalletForm />}</section>;
  }
  if (pathname.startsWith("/bank/") || pathname.startsWith("/wallet/") || pathname === "/pocket-money") {
    const kind = pathname.startsWith("/bank/") ? "BANK" : pathname.startsWith("/wallet/") ? "WALLET" : "POCKET_MONEY";
    const id = kind === "POCKET_MONEY" ? undefined : pathname.split("/")[2];
    const item = kind === "BANK" ? data.banks.find(b => b.id === id) : data.wallets.find(w => w.id === id);
    if (kind !== "POCKET_MONEY" && !item) return <p>Account not found. Add an account to begin.</p>;
    return <AccountLedger account={kind} bank={kind === "BANK" ? item : undefined} wallet={kind === "WALLET" ? item : undefined} balance={guestBalance(data, kind, id)} transactions={transactions.filter(t => t.account === kind && (!id || (kind === "BANK" ? t.bankId : t.walletId) === id))} action={<><AccountTransferPanel {...options} currentAccount={kind} currentId={id} /><WorkspaceLink href={`/transactions/add?type=EXPENSE&account=${kind}${id ? `&${kind === "BANK" ? "bankId" : "walletId"}=${id}` : ""}&returnTo=${encodeURIComponent(pathname)}`} className="mt-4 inline-flex rounded-xl bg-expense px-4 py-2 text-sm font-semibold text-white">Record expense</WorkspaceLink>{id && <AccountRemovalButton account={kind === "BANK" ? "bank" : "wallet"} id={id} returnTo={kind === "BANK" ? "/bank" : "/wallet"} />}</>} />;
  }
  if (pathname === "/statement") return <GuestStatement transactions={transactions} query={query} />;
  return <GuestDashboard data={data} />;
}

function GuestDashboard({ data }: { data: GuestData }) {
  const now = new Date();
  const monthly = data.transactions.filter(t => { const date = new Date(t.occurredAt); return !t.transferId && !t.isDeposit && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(); });
  const income = monthly.filter(t => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
  const expense = monthly.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);
  const chart = Array.from({ length: now.getDate() }, (_, i) => { const entries = monthly.filter(t => new Date(t.occurredAt).getDate() === i + 1); return { day: String(i + 1), date: new Date(now.getFullYear(), now.getMonth(), i + 1).toLocaleDateString("en-BD"), income: entries.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0), expense: entries.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0) }; });
  return <div className="space-y-5"><section className="rounded-3xl bg-gradient-to-br from-[#17231a] to-[#4b963b] p-6 text-white"><p className="text-sm text-white/70">Current balance · All accounts</p><p className="mt-4 text-4xl font-bold">{money(guestBalance(data))}</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{[["/bank", "Bank accounts", "BANK"], ["/wallet", "Wallets", "WALLET"], ["/pocket-money", "Pocket money", "POCKET_MONEY"]].map(([href, label, kind]) => <WorkspaceLink key={href} href={href} className="rounded-xl bg-white/10 p-4"><p className="text-sm text-white/70">{label}</p><p className="mt-1 text-xl font-semibold">{money(guestBalance(data, kind as "BANK" | "WALLET" | "POCKET_MONEY"))}</p></WorkspaceLink>)}</div></section>{data.transactions.length === 0 && <div className="card-surface p-5"><p className="font-semibold">Start with your own sample data</p><p className="mt-1 text-sm text-ink/60">Add a bank or wallet, record a deposit from another person, or receive a freelance payout. Then try expenses, transfers, and bill records.</p><WorkspaceLink href="/earnings" className="mt-3 inline-flex font-semibold text-brand">Add your first earning →</WorkspaceLink></div>}<div className="grid gap-5 lg:grid-cols-2"><section className="card-surface p-5"><h2 className="mb-4 font-bold">Monthly movement</h2><DashboardChart data={chart} /></section><BudgetHealthCard income={income} expenses={expense} dayOfMonth={now.getDate()} daysInMonth={new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()} /></div><div className="flex justify-between"><h2 className="text-lg font-bold">Recent transactions</h2><WorkspaceLink href="/transactions/add" className="font-semibold text-brand">+ Add transaction</WorkspaceLink></div><TransactionList transactions={[...data.transactions].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 6)} /></div>;
}

function GuestStatement({ transactions, query }: { transactions: GuestData["transactions"]; query: URLSearchParams }) {
  const [filters, setFilters] = useState({ from: query.get("from") ?? "", to: query.get("to") ?? "", type: query.get("type") ?? "", scope: query.get("scope") ?? "", account: query.get("account") ?? "" });
  const filtered = transactions.filter(t => (!filters.from || t.occurredAt.slice(0, 10) >= filters.from) && (!filters.to || t.occurredAt.slice(0, 10) <= filters.to) && (!filters.type || t.type === filters.type) && (!filters.scope || t.scope === filters.scope) && (!filters.account || t.account === filters.account) && (!query.get("bankId") || t.bankId === query.get("bankId")) && (!query.get("walletId") || t.walletId === query.get("walletId")));
  return <div className="space-y-5"><div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-bold">Statement</h2><StatementExport transactions={filtered} /></div><div className="card-surface grid gap-3 p-4 sm:grid-cols-5">{(["from", "to"] as const).map(name => <label key={name} className="text-sm">{name === "from" ? "From" : "To"}<input aria-label={name} type="date" value={filters[name]} onChange={e => setFilters(f => ({ ...f, [name]: e.target.value }))} className="mt-1 w-full rounded-lg border px-2 py-2" /></label>)}{([["type", ["INCOME", "EXPENSE"]], ["scope", ["PERSONAL", "FAMILY", "BUSINESS"]], ["account", ["BANK", "WALLET", "POCKET_MONEY"]]] as const).map(([name, values]) => <label key={name} className="text-sm capitalize">{name}<select value={filters[name]} onChange={e => setFilters(f => ({ ...f, [name]: e.target.value }))} className="mt-1 w-full rounded-lg border px-2 py-2"><option value="">All</option>{values.map(value => <option key={value}>{value}</option>)}</select></label>)}</div><TransactionList transactions={filtered} /></div>;
}

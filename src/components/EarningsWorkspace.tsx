"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Earning = { id: string; sourceType: string; platform: string; title: string; client?: string | null; grossAmount: number; platformFee: number; otherFee: number; currency: string; exchangeRate: number; netAmountBdt: number; status: "PENDING" | "AVAILABLE" | "RECEIVED"; expectedPayoutAt?: string | null; receivedAt?: string | null; note?: string | null };
type AccountOption = { id: string; name: string };
const marketplaces = ["Upwork", "Fiverr", "Toptal", "Freelancer.com", "PeoplePerHour", "Contra", "Guru", "99designs"];
const creatorPlatforms = ["YouTube", "Facebook", "Instagram", "TikTok", "Patreon", "Ko-fi", "Substack", "Twitch", "Affiliate marketing", "Brand deal"];
const money = (value: number) => `৳${new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(value)}`;

const initialForm = { sourceType: "MARKETPLACE", platform: "Upwork", title: "", client: "", grossAmount: "", platformFee: "", otherFee: "", currency: "USD", exchangeRate: "", status: "PENDING", expectedPayoutAt: "", note: "" };

export default function EarningsWorkspace({ initialEarnings, banks, wallets }: { initialEarnings: Earning[]; banks: AccountOption[]; wallets: AccountOption[] }) {
  const router = useRouter();
  const [earnings, setEarnings] = useState(initialEarnings); const [form, setForm] = useState(initialForm); const [message, setMessage] = useState(""); const [saving, setSaving] = useState(false);
  const [receivingId, setReceivingId] = useState<string | null>(null); const [account, setAccount] = useState("BANK"); const [bankId, setBankId] = useState(banks[0]?.id ?? ""); const [walletId, setWalletId] = useState(wallets[0]?.id ?? ""); const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const field = (name: string, value: string) => setForm((current) => ({ ...current, [name]: value }));
  const platformOptions = form.sourceType === "MARKETPLACE" ? marketplaces : form.sourceType === "CREATOR_PLATFORM" ? creatorPlatforms : [];
  const preview = useMemo(() => Math.max((Number(form.grossAmount) - Number(form.platformFee) - Number(form.otherFee)) * Number(form.exchangeRate), 0), [form]);

  async function save(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("");
    const response = await fetch("/api/earnings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, grossAmount: Number(form.grossAmount), platformFee: Number(form.platformFee || 0), otherFee: Number(form.otherFee || 0), exchangeRate: Number(form.exchangeRate), expectedPayoutAt: form.expectedPayoutAt || undefined }) });
    const data = await response.json(); setSaving(false);
    if (!response.ok) return setMessage(data.error ?? "Could not save earning");
    setEarnings((current) => [{ ...data, grossAmount: Number(data.grossAmount), platformFee: Number(data.platformFee), otherFee: Number(data.otherFee), exchangeRate: Number(data.exchangeRate), netAmountBdt: Number(data.netAmountBdt) }, ...current]); setForm(initialForm); setMessage("Earning saved."); router.refresh();
  }

  async function receive(id: string) {
    const response = await fetch(`/api/earnings/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "RECEIVE", account, bankId: account === "BANK" ? bankId : undefined, walletId: account === "WALLET" ? walletId : undefined, paymentMethod }) });
    const data = await response.json(); if (!response.ok) return setMessage(data.error ?? "Could not receive payout");
    setEarnings((current) => current.map((item) => item.id === id ? { ...item, status: "RECEIVED", receivedAt: data.receivedAt } : item)); setReceivingId(null); setMessage("Payout added to your account balance."); router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this earning record?")) return;
    const response = await fetch(`/api/earnings/${id}`, { method: "DELETE" }); if (!response.ok) { const data = await response.json(); return setMessage(data.error ?? "Could not delete earning"); }
    setEarnings((current) => current.filter((item) => item.id !== id));
  }

  return <div className="grid min-w-0 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
    <form onSubmit={save} className="earnings-form card-surface min-w-0 h-fit space-y-4 p-5 sm:p-6">
      <div><h2 className="text-lg font-bold">Add freelance earning</h2><p className="mt-1 text-sm text-ink/55">Track the gross amount now and receive it later.</p></div>
      <label className="block text-sm font-medium">Income source<select value={form.sourceType} onChange={(e) => { const value = e.target.value; setForm((current) => ({ ...current, sourceType: value, platform: value === "MARKETPLACE" ? "Upwork" : value === "CREATOR_PLATFORM" ? "YouTube" : "" })); }} className="mt-1 w-full"><option value="MARKETPLACE">Freelance marketplace</option><option value="CREATOR_PLATFORM">Creator platform</option><option value="DIRECT_CLIENT">Direct client</option><option value="OTHER">Other</option></select></label>
      <label className="block text-sm font-medium">Platform or source{platformOptions.length ? <select value={form.platform} onChange={(e) => field("platform", e.target.value)} className="mt-1 w-full">{platformOptions.map((name) => <option key={name}>{name}</option>)}</select> : <input required value={form.platform} onChange={(e) => field("platform", e.target.value)} className="mt-1 w-full" placeholder={form.sourceType === "DIRECT_CLIENT" ? "Direct client" : "Income source"}/>}</label>
      <label className="block text-sm font-medium">Project, gig, or content<input required value={form.title} onChange={(e) => field("title", e.target.value)} className="mt-1 w-full" placeholder="Website redesign"/></label>
      <label className="block text-sm font-medium">Client or channel <span className="font-normal text-ink/40">(optional)</span><input value={form.client} onChange={(e) => field("client", e.target.value)} className="mt-1 w-full" placeholder="Client or channel name"/></label>
      <div className="grid grid-cols-[1fr_100px] gap-3"><label className="block text-sm font-medium">Gross amount<input required type="number" min="0.01" step="0.01" value={form.grossAmount} onChange={(e) => field("grossAmount", e.target.value)} className="mt-1 w-full"/></label><label className="block text-sm font-medium">Currency<select value={form.currency} onChange={(e) => field("currency", e.target.value)} className="mt-1 w-full"><option>USD</option><option>EUR</option><option>GBP</option><option>BDT</option><option>CAD</option><option>AUD</option></select></label></div>
      <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-medium">Platform fee<input type="number" min="0" step="0.01" value={form.platformFee} onChange={(e) => field("platformFee", e.target.value)} className="mt-1 w-full" placeholder="0"/></label><label className="block text-sm font-medium">Other fees<input type="number" min="0" step="0.01" value={form.otherFee} onChange={(e) => field("otherFee", e.target.value)} className="mt-1 w-full" placeholder="0"/></label></div>
      <label className="block text-sm font-medium">BDT exchange rate<input required type="number" min="0.0001" step="0.0001" value={form.exchangeRate} onChange={(e) => field("exchangeRate", e.target.value)} className="mt-1 w-full" placeholder={form.currency === "BDT" ? "1" : "e.g. 122.50"}/></label>
      <div className="rounded-xl bg-[#eef8eb] p-3 dark:bg-white/5"><p className="text-xs text-ink/50">Expected net amount</p><p className="mt-1 text-xl font-bold text-brand">{money(preview)}</p></div>
      <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-medium">Status<select value={form.status} onChange={(e) => field("status", e.target.value)} className="mt-1 w-full"><option value="PENDING">Pending</option><option value="AVAILABLE">Available</option></select></label><label className="block text-sm font-medium">Expected payout<input type="date" value={form.expectedPayoutAt} onChange={(e) => field("expectedPayoutAt", e.target.value)} className="mt-1 w-full"/></label></div>
      {message && <p className="text-sm font-medium text-brand">{message}</p>}<button disabled={saving} className="btn-primary w-full">{saving ? "Saving…" : "Save earning"}</button>
    </form>
    <div className="space-y-3">{earnings.length === 0 ? <div className="card-surface p-10 text-center"><p className="font-semibold">No freelance earnings yet</p><p className="mt-1 text-sm text-ink/55">Your marketplace, creator, and direct-client income will appear here.</p></div> : earnings.map((earning) => <article key={earning.id} className="card-surface p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#eef8eb] px-2.5 py-1 text-[11px] font-bold text-sage dark:bg-white/10">{earning.platform}</span><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${earning.status === "RECEIVED" ? "bg-[#e8f7e3] text-sage" : earning.status === "AVAILABLE" ? "bg-[#fff7df] text-[#8b6812]" : "bg-gray-100 text-ink/55"}`}>{earning.status.toLowerCase()}</span></div><h3 className="mt-3 font-bold text-ink">{earning.title}</h3><p className="mt-1 text-xs text-ink/50">{earning.client || earning.sourceType.replace("_", " ").toLowerCase()}{earning.expectedPayoutAt ? ` · Expected ${new Date(earning.expectedPayoutAt).toLocaleDateString("en-BD")}` : ""}</p></div><div className="sm:text-right"><p className="text-xl font-bold text-ink">{money(earning.netAmountBdt)}</p><p className="text-xs text-ink/45">Net from {earning.currency} {earning.grossAmount.toLocaleString()}</p></div></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4"><p className="text-xs text-ink/50">Fees: {earning.currency} {(earning.platformFee + earning.otherFee).toLocaleString()}</p><div className="flex gap-3 text-sm font-semibold">{earning.status !== "RECEIVED" && <button type="button" onClick={() => setReceivingId(receivingId === earning.id ? null : earning.id)} className="text-brand">Receive payout</button>}{earning.status !== "RECEIVED" && <button type="button" onClick={() => remove(earning.id)} className="text-rust">Delete</button>}</div></div>{receivingId === earning.id && <div className="mt-4 grid gap-3 rounded-xl border border-brand/20 bg-[#f6faf4] p-4 dark:bg-white/5 sm:grid-cols-3"><select value={account} onChange={(e) => setAccount(e.target.value)}><option value="BANK">Bank account</option><option value="WALLET">Wallet</option><option value="POCKET_MONEY">Pocket money</option></select>{account === "BANK" ? <select value={bankId} onChange={(e) => setBankId(e.target.value)}><option value="">Select bank</option>{banks.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select> : account === "WALLET" ? <select value={walletId} onChange={(e) => setWalletId(e.target.value)}><option value="">Select wallet</option>{wallets.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select> : <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}><option value="CASH">Cash</option><option value="OTHER">Other</option></select>}<button type="button" onClick={() => receive(earning.id)} className="btn-primary">Add to balance</button></div>}</article>)}</div>
  </div>;
}

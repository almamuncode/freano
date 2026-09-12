"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FundingSource = "BANK" | "CASH" | "PROJECT_FEE" | "GIFT" | "OTHER";

const sources: { value: FundingSource; label: string }[] = [
  { value: "BANK", label: "Bank account" },
  { value: "CASH", label: "Cash" },
  { value: "PROJECT_FEE", label: "Project fee" },
  { value: "GIFT", label: "Gift" },
  { value: "OTHER", label: "Other income" },
];

export default function PocketFundingForm({ banks }: { banks: { id: string; name: string }[] }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [sourceType, setSourceType] = useState<FundingSource>("BANK");
  const [bankId, setBankId] = useState(banks[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/transfers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: Number(amount), sourceType, bankId: sourceType === "BANK" ? bankId : undefined, note: note || undefined, occurredAt: new Date().toISOString() }) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "Could not add pocket money");
      setAmount(""); setNote(""); router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not add pocket money");
    } finally { setSaving(false); }
  }

  return <form onSubmit={submit} className="mt-6 border-t border-white/15 pt-5"><div><h2 className="font-bold text-white">Add pocket money</h2><p className="mt-1 text-sm text-white/60">Choose where this cash came from.</p></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><div><label className="mb-1 block text-xs font-medium text-white/65">Amount</label><input required min="0.01" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/45" /></div><div><label className="mb-1 block text-xs font-medium text-white/65">Source</label><select value={sourceType} onChange={(event) => setSourceType(event.target.value as FundingSource)} className="w-full rounded-lg border border-white/20 bg-[#20293A] px-3 py-2 text-sm text-white">{sources.map((source) => <option key={source.value} value={source.value}>{source.label}</option>)}</select></div>{sourceType === "BANK" && <div className="sm:col-span-2"><label className="mb-1 block text-xs font-medium text-white/65">Withdraw from</label><select required value={bankId} onChange={(event) => setBankId(event.target.value)} className="w-full rounded-lg border border-white/20 bg-[#20293A] px-3 py-2 text-sm text-white" disabled={banks.length === 0}><option value="">{banks.length === 0 ? "Add a bank account first" : "Choose a bank"}</option>{banks.map((bank) => <option key={bank.id} value={bank.id}>{bank.name}</option>)}</select></div>}</div><div className="mt-3 flex flex-col gap-3 sm:flex-row"><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Note (optional)" className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/45" /><button disabled={saving || (sourceType === "BANK" && !bankId)} className="rounded-lg bg-[#e7f4e8] px-4 py-2 text-sm font-semibold text-sage disabled:opacity-60">{saving ? "Adding..." : "Add funds"}</button></div>{error && <p className="mt-2 text-sm text-[#f3aaa0]">{error}</p>}</form>;
}
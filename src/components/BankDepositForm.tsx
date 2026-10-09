"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { showToast } from "@/lib/toast";

export default function BankDepositForm({ bankId }: { bankId: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(""); setSaving(true);
    try {
      const response = await fetch(`/api/banks/${bankId}/deposits`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: Number(amount), source, note: note || undefined, occurredAt: new Date().toISOString() }) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "Could not record deposit");
      setAmount(""); setSource(""); setNote(""); showToast("Deposit added"); router.refresh();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Could not record deposit";
      setError(message); showToast(message, "error");
    } finally { setSaving(false); }
  }

  return <form onSubmit={submit} className="mt-6 border-t border-white/15 pt-5"><div><h2 className="font-bold text-white">Deposit to this bank</h2><p className="mt-1 text-sm text-white/60">Adds to this bank and your total balance, without counting as income.</p></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><input required min="0.01" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/45" /><input required value={source} onChange={(event) => setSource(event.target.value)} placeholder="Deposit source" className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/45" /></div><div className="mt-3 flex flex-col gap-3 sm:flex-row"><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Note (optional)" className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/45" /><button disabled={saving} className="rounded-lg bg-[#eee8ff] px-4 py-2 text-sm font-semibold text-sage disabled:opacity-60">{saving ? "Saving..." : "Deposit"}</button></div>{error && <p className="mt-2 text-sm text-[#f3aaa0]">{error}</p>}</form>;
}

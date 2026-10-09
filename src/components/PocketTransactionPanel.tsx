"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { showToast } from "@/lib/toast";

type Mode = "ADD" | "SPEND";
type Source = "BANK" | "CASH" | "PROJECT_FEE" | "GIFT" | "OTHER";

export default function PocketTransactionPanel({ banks }: { banks: { id: string; name: string }[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("ADD");
  const [sourceType, setSourceType] = useState<Source>("BANK");
  const [bankId, setBankId] = useState(banks[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [party, setParty] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const adding = mode === "ADD";

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setSaving(true);
    try {
      const response = adding
        ? await fetch("/api/transfers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: Number(amount), sourceType, bankId: sourceType === "BANK" ? bankId : undefined, note: note || undefined, occurredAt: new Date().toISOString() }) })
        : await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "EXPENSE", amount: Number(amount), source: party, note: note || undefined, account: "POCKET_MONEY", paymentMethod: "CASH", occurredAt: new Date().toISOString() }) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "Could not save pocket money activity");
      setAmount(""); setParty(""); setNote(""); showToast(adding ? "Funds added" : "Expense recorded"); router.refresh();
    } catch (requestError) { const message = requestError instanceof Error ? requestError.message : "Could not save pocket money activity"; setError(message); showToast(message, "error"); } finally { setSaving(false); }
  }

  return <section className="mt-6 border-t border-white/15 pt-5"><div className="flex gap-2"><button type="button" onClick={() => setMode("ADD")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${adding ? "bg-[#eee8ff] text-sage" : "bg-white/10 text-white/65"}`}>Add funds</button><button type="button" onClick={() => setMode("SPEND")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${!adding ? "bg-[#ffede3] text-rust" : "bg-white/10 text-white/65"}`}>Record expense</button></div><form onSubmit={submit} className="mt-4"><p className="text-sm text-white/60">{adding ? "Choose where the cash came from." : "Record spending paid from your pocket money."}</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><input required min="0.01" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/45" />{adding ? <select value={sourceType} onChange={(event) => setSourceType(event.target.value as Source)} className="rounded-lg border border-white/20 bg-[#20293A] px-3 py-2 text-sm text-white"><option value="BANK">Bank account</option><option value="CASH">Cash</option><option value="PROJECT_FEE">Project fee</option><option value="GIFT">Gift</option><option value="OTHER">Other income</option></select> : <input required value={party} onChange={(event) => setParty(event.target.value)} placeholder="Payee or purpose" className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/45" />}{adding && sourceType === "BANK" && <select required value={bankId} onChange={(event) => setBankId(event.target.value)} disabled={!banks.length} className="sm:col-span-2 rounded-lg border border-white/20 bg-[#20293A] px-3 py-2 text-sm text-white"><option value="">{banks.length ? "Choose a bank to withdraw from" : "Add a bank account first"}</option>{banks.map((bank) => <option key={bank.id} value={bank.id}>{bank.name}</option>)}</select>}</div><div className="mt-3 flex flex-col gap-3 sm:flex-row"><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Note (optional)" className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/45" /><button disabled={saving || (adding && sourceType === "BANK" && !bankId)} className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 ${adding ? "bg-[#eee8ff] text-sage" : "bg-[#ffede3] text-rust"}`}>{saving ? "Saving..." : adding ? "Add funds" : "Record expense"}</button></div>{error && <p className="mt-2 text-sm text-[#f3aaa0]">{error}</p>}</form></section>;
}

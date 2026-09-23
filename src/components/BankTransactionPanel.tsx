"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { showToast } from "@/lib/toast";

type Mode = "DEPOSIT" | "WITHDRAW";

export default function BankTransactionPanel({ bankId }: { bankId: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("DEPOSIT");
  const [amount, setAmount] = useState("");
  const [counterparty, setCounterparty] = useState<"POCKET_MONEY" | "PERSON">("POCKET_MONEY");
  const [personName, setPersonName] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isDeposit = mode === "DEPOSIT";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(""); setSaving(true);
    try {
      const endpoint = `/api/banks/${bankId}/${isDeposit ? "deposits" : "withdrawals"}`;
      const body = isDeposit ? { amount: Number(amount), sourceType: counterparty, personName: counterparty === "PERSON" ? personName : undefined, note: note || undefined, occurredAt: new Date().toISOString() } : { amount: Number(amount), destinationType: counterparty, personName: counterparty === "PERSON" ? personName : undefined, note: note || undefined, occurredAt: new Date().toISOString() };
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? `Could not record ${isDeposit ? "deposit" : "withdrawal"}`);
      setAmount(""); setPersonName(""); setNote(""); showToast(isDeposit ? "Deposit added" : "Withdrawal recorded"); router.refresh();
    } catch (requestError) { const message = requestError instanceof Error ? requestError.message : "Could not save transaction"; setError(message); showToast(message, "error"); } finally { setSaving(false); }
  }

  return <section className="mt-6 border-t border-white/15 pt-5"><div className="flex gap-2"><button type="button" onClick={() => { setMode("DEPOSIT"); setCounterparty("POCKET_MONEY"); }} className={`rounded-lg px-4 py-2 text-sm font-semibold ${isDeposit ? "bg-[#e7f4e8] text-sage" : "bg-white/10 text-white/65"}`}>Deposit</button><button type="button" onClick={() => { setMode("WITHDRAW"); setCounterparty("POCKET_MONEY"); }} className={`rounded-lg px-4 py-2 text-sm font-semibold ${!isDeposit ? "bg-[#fae9e5] text-rust" : "bg-white/10 text-white/65"}`}>Withdraw</button></div><form onSubmit={submit} className="mt-4"><p className="text-sm text-white/60">{isDeposit ? "Add money from Pocket money or another person without counting it as earned income." : "Move money to Pocket money or record a withdrawal for another person."}</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><input required min="0.01" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/45" /><select value={counterparty} onChange={(event) => setCounterparty(event.target.value as "POCKET_MONEY" | "PERSON")} className="rounded-lg border border-white/20 bg-[#20293A] px-3 py-2 text-sm text-white"><option value="POCKET_MONEY">{isDeposit ? "From Pocket money" : "To Pocket money"}</option><option value="PERSON">{isDeposit ? "From another person" : "To another person"}</option></select>{counterparty === "PERSON" && <input required value={personName} onChange={(event) => setPersonName(event.target.value)} placeholder="Person's name" className="sm:col-span-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/45" />}</div><div className="mt-3 flex flex-col gap-3 sm:flex-row"><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Note (optional)" className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/45" /><button disabled={saving} className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 ${isDeposit ? "bg-[#e7f4e8] text-sage" : "bg-[#fae9e5] text-rust"}`}>{saving ? "Saving..." : isDeposit ? "Deposit" : "Withdraw"}</button></div>{error && <p className="mt-2 text-sm text-[#f3aaa0]">{error}</p>}</form></section>;
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BankForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/banks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, details }) });
      const bank = await response.json();
      if (!response.ok) throw new Error(bank.error ?? "Could not add bank account");
      router.push(`/bank/${bank.id}`); router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not add bank account");
    } finally { setSaving(false); }
  }

  return <form onSubmit={submit} className="grid gap-3 border-t border-hairline pt-4 sm:grid-cols-[1fr_1.25fr_auto]"><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Bank name" className="rounded-lg border border-hairline bg-white px-3 py-2 text-sm text-ink" /><input value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Account number or note (optional)" className="rounded-lg border border-hairline bg-white px-3 py-2 text-sm text-ink" /><button disabled={saving} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Adding..." : "Add bank"}</button>{error && <p className="text-sm text-expense sm:col-span-3">{error}</p>}</form>;
}
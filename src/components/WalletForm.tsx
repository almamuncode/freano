"use client";

import { useWorkspace } from "@/components/WorkspaceContext";

import { useState } from "react";

export default function WalletForm() {
  const router = useWorkspace(); const [name, setName] = useState(""); const [details, setDetails] = useState(""); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); setSaving(true); setError(""); try { const response = await router.request("/api/wallets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, details }) }); const wallet = await response.json(); if (!response.ok) throw new Error(wallet.error ?? "Could not add wallet"); router.push(`/wallet/${wallet.id}`); router.refresh(); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Could not add wallet"); } finally { setSaving(false); } }
  return <form onSubmit={submit} className="grid gap-3 border-t border-hairline pt-4 sm:grid-cols-[1fr_1.25fr_auto]"><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Wallet name (e.g. bKash)" className="rounded-lg border border-hairline bg-white px-3 py-2 text-sm text-ink" /><input value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Number or note (optional)" className="rounded-lg border border-hairline bg-white px-3 py-2 text-sm text-ink" /><button disabled={saving} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Adding..." : "Add wallet"}</button>{error && <p className="text-sm text-expense sm:col-span-3">{error}</p>}</form>;
}
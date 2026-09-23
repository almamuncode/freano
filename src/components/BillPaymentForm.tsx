"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { showToast } from "@/lib/toast";

type Account = "BANK" | "WALLET" | "POCKET_MONEY";
type NamedAccount = { id: string; name: string };

const billers = ["Electricity - DESCO", "Electricity - DPDC", "Electricity - NESCO", "Electricity - Palli Bidyut", "Electricity - WZPDCL", "Gas - Titas", "Gas - Karnaphuli", "Water - WASA", "Internet broadband", "Mobile recharge", "Cable TV", "Education fee", "Insurance premium", "Government fee", "Other bill"];

export default function BillPaymentForm({ banks, wallets, initialAccount, initialBankId, initialWalletId, returnTo }: { banks: NamedAccount[]; wallets: NamedAccount[]; initialAccount?: Account; initialBankId?: string; initialWalletId?: string; returnTo?: string }) {
  const router = useRouter();
  const [biller, setBiller] = useState(billers[0]);
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState<Account>(initialAccount ?? "BANK");
  const [bankId, setBankId] = useState(initialBankId ?? "");
  const [walletId, setWalletId] = useState(initialWalletId ?? "");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = await fetch("/api/bills", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ biller, reference, amount: Number(amount), account, bankId: account === "BANK" ? bankId : undefined, walletId: account === "WALLET" ? walletId : undefined, note: note || undefined, occurredAt: new Date().toISOString() }) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "Could not pay this bill");
      showToast("Bill payment recorded"); router.push(returnTo ?? "/transactions"); router.refresh();
    } catch (requestError) { const message = requestError instanceof Error ? requestError.message : "Could not pay this bill"; setError(message); showToast(message, "error"); } finally { setSaving(false); }
  }

  return <form onSubmit={submit} className="card-surface max-w-lg space-y-4 p-5 sm:p-6"><div><label className="mb-1 block text-sm font-medium text-ink">Bill type</label><select value={biller} onChange={(event) => setBiller(event.target.value)} className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm">{billers.map((item) => <option key={item}>{item}</option>)}</select></div><div><label className="mb-1 block text-sm font-medium text-ink">Customer or bill number</label><input required value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Account or customer number" className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm" /></div><div><label className="mb-1 block text-sm font-medium text-ink">Amount (BDT)</label><input required min="0.01" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm" /></div><div><label className="mb-1 block text-sm font-medium text-ink">Pay from</label><select value={account} onChange={(event) => setAccount(event.target.value as Account)} className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm"><option value="BANK">Bank account</option><option value="WALLET">Wallet</option><option value="POCKET_MONEY">Pocket money</option></select></div>{account === "BANK" && <div><label className="mb-1 block text-sm font-medium text-ink">Bank account</label><select required value={bankId} onChange={(event) => setBankId(event.target.value)} disabled={!banks.length} className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm"><option value="">{banks.length ? "Select a bank account" : "Add a bank account first"}</option>{banks.map((bank) => <option key={bank.id} value={bank.id}>{bank.name}</option>)}</select></div>}{account === "WALLET" && <div><label className="mb-1 block text-sm font-medium text-ink">Wallet</label><select required value={walletId} onChange={(event) => setWalletId(event.target.value)} disabled={!wallets.length} className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm"><option value="">{wallets.length ? "Select a wallet" : "Add a wallet first"}</option>{wallets.map((wallet) => <option key={wallet.id} value={wallet.id}>{wallet.name}</option>)}</select></div>}<div><label className="mb-1 block text-sm font-medium text-ink">Note</label><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note" className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm" /></div><button disabled={saving || (account === "BANK" && !bankId) || (account === "WALLET" && !walletId)} className="w-full rounded-lg bg-expense px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Paying..." : "Pay bill"}</button>{error && <p className="text-sm text-expense">{error}</p>}</form>;
}

"use client";

import { useWorkspace } from "@/components/WorkspaceContext";

import { useState } from "react";
import { showToast } from "@/lib/toast";

type Account = "BANK" | "WALLET" | "POCKET_MONEY";
type NamedAccount = { id: string; name: string };
type Counterparty = Account | "PERSON";

const labels: Record<Account, string> = { BANK: "Bank account", WALLET: "Wallet", POCKET_MONEY: "Pocket money" };

export default function AccountTransferPanel({ currentAccount, currentId, banks, wallets }: { currentAccount: Account; currentId?: string; banks: NamedAccount[]; wallets: NamedAccount[] }) {
  const router = useWorkspace();
  const [mode, setMode] = useState<"DEPOSIT" | "WITHDRAW">("DEPOSIT");
  const [counterparty, setCounterparty] = useState<Counterparty>(currentAccount === "BANK" ? "POCKET_MONEY" : "BANK");
  const [counterpartyId, setCounterpartyId] = useState("");
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isDeposit = mode === "DEPOSIT";
  const options = counterparty === "BANK" ? banks.filter((bank) => bank.id !== currentId) : counterparty === "WALLET" ? wallets.filter((wallet) => wallet.id !== currentId) : [];
  const sourceAccount = isDeposit ? counterparty : currentAccount;
  const destinationAccount = isDeposit ? currentAccount : counterparty;
  const sourceId = isDeposit ? counterpartyId || undefined : currentId;
  const destinationId = isDeposit ? currentId : counterpartyId || undefined;

  function changeMode(value: "DEPOSIT" | "WITHDRAW") { setMode(value); setCounterparty("POCKET_MONEY"); setCounterpartyId(""); setPersonName(""); }
  function changeCounterparty(value: Counterparty) { setCounterparty(value); setCounterpartyId(""); setPersonName(""); }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = await router.request("/api/account-transfers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: Number(amount), fromAccount: sourceAccount, toAccount: destinationAccount, fromId: sourceId, toId: destinationId, personName: counterparty === "PERSON" ? personName : undefined, note: note || undefined, occurredAt: new Date().toISOString() }) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? `Could not record ${isDeposit ? "deposit" : "withdrawal"}`);
      setAmount(""); setNote(""); setPersonName(""); showToast(isDeposit ? "Deposit added" : "Withdrawal recorded"); router.refresh();
    } catch (requestError) { const message = requestError instanceof Error ? requestError.message : `Could not record ${isDeposit ? "deposit" : "withdrawal"}`; setError(message); showToast(message, "error"); } finally { setSaving(false); }
  }

  return <section className="mt-6 border-t border-white/15 pt-5"><div className="flex gap-2"><button type="button" onClick={() => changeMode("DEPOSIT")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${isDeposit ? "bg-[#eee8ff] text-sage" : "bg-white/10 text-white/65"}`}>Deposit</button><button type="button" onClick={() => changeMode("WITHDRAW")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${!isDeposit ? "bg-[#ffede3] text-rust" : "bg-white/10 text-white/65"}`}>Withdraw</button></div><form onSubmit={submit} className="mt-4"><p className="text-sm text-white/60">{isDeposit ? "Deposit from pocket money, another account, or another person." : "Withdraw to pocket money, another account, or another person."}</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><input required min="0.01" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/45" /><select value={counterparty} onChange={(event) => changeCounterparty(event.target.value as Counterparty)} className="rounded-lg border border-white/20 bg-[#20293A] px-3 py-2 text-sm text-white">{(["BANK", "WALLET", "POCKET_MONEY"] as Account[]).filter((account) => account !== currentAccount).map((account) => <option key={account} value={account}>{isDeposit ? `From ${labels[account]}` : `To ${labels[account]}`}</option>)}<option value="PERSON">{isDeposit ? "From another person" : "To another person"}</option></select>{counterparty === "PERSON" ? <input required value={personName} onChange={(event) => setPersonName(event.target.value)} placeholder="Person's name" className="sm:col-span-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/45" /> : counterparty !== "POCKET_MONEY" && <select required value={counterpartyId} onChange={(event) => setCounterpartyId(event.target.value)} disabled={!options.length} className="sm:col-span-2 rounded-lg border border-white/20 bg-[#20293A] px-3 py-2 text-sm text-white"><option value="">{options.length ? `Choose ${labels[counterparty].toLowerCase()}` : `Add a ${labels[counterparty].toLowerCase()} first`}</option>{options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select>}</div><div className="mt-3 flex flex-col gap-3 sm:flex-row"><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Note (optional)" className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/45" /><button disabled={saving || (counterparty === "PERSON" ? !personName : counterparty !== "POCKET_MONEY" && !counterpartyId)} className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 ${isDeposit ? "bg-[#eee8ff] text-sage" : "bg-[#ffede3] text-rust"}`}>{saving ? "Saving..." : isDeposit ? "Deposit" : "Withdraw"}</button></div>{error && <p className="mt-2 text-sm text-[#f3aaa0]">{error}</p>}</form></section>;
}

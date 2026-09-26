"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Transaction } from "@/types";
import { showToast } from "@/lib/toast";
import { queueTransaction } from "@/lib/offline-transactions";

const PAYMENT_METHODS = ["CASH", "BKASH", "NAGAD", "ROCKET", "BANK_TRANSFER", "CARD", "OTHER"];
const SCOPES = ["PERSONAL", "FAMILY", "BUSINESS"];
const ACCOUNTS = ["BANK", "WALLET", "POCKET_MONEY"];
const POCKET_SOURCES = ["BANK", "CASH", "PROJECT_FEE", "GIFT", "OTHER"];

function getLocalDate(occurredAt?: string) {
  return occurredAt ? new Date(occurredAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
}

function getLocalTime(occurredAt?: string) {
  return occurredAt ? new Date(occurredAt).toTimeString().slice(0, 5) : new Date().toTimeString().slice(0, 5);
}

export default function TransactionForm({
  userId,
  transaction,
  initialType,
  initialAccount,
  initialBankId,
  initialWalletId,
  returnTo,
  banks,
  wallets,
}: {
  userId?: string;
  transaction?: Transaction;
  initialType?: "INCOME" | "EXPENSE";
  initialAccount?: "BANK" | "WALLET" | "POCKET_MONEY";
  initialBankId?: string;
  initialWalletId?: string;
  returnTo?: string;
  banks: { id: string; name: string }[];
  wallets: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [type, setType] = useState<"INCOME" | "EXPENSE">(transaction?.type ?? initialType ?? "EXPENSE");
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : "");
  const [source, setSource] = useState(transaction?.source ?? "");
  const [scope, setScope] = useState<string>(transaction?.scope ?? "PERSONAL");
  const [paymentMethod, setPaymentMethod] = useState<string>(transaction?.paymentMethod ?? "CASH");
  const [account, setAccount] = useState<string>(transaction?.account ?? initialAccount ?? "BANK");
  const [bankId, setBankId] = useState(transaction?.bankId ?? initialBankId ?? "");
  const [walletId, setWalletId] = useState(transaction?.walletId ?? initialWalletId ?? "");
  const [pocketSource, setPocketSource] = useState("CASH");
  const [note, setNote] = useState(transaction?.note ?? "");
  const [date, setDate] = useState(() => getLocalDate(transaction?.occurredAt));
  const [time, setTime] = useState(() => getLocalTime(transaction?.occurredAt));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function saveTransaction(e: React.FormEvent, addAnother = false) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const occurredAt = new Date(`${date}T${time}:00`).toISOString();

    const usePocketFunding = !transaction && type === "INCOME" && account === "POCKET_MONEY";
    const clientRequestId = crypto.randomUUID();
    const endpoint = usePocketFunding ? "/api/transfers" as const : "/api/transactions" as const;
    const body = usePocketFunding ? {
      amount: parseFloat(amount), sourceType: pocketSource, bankId: pocketSource === "BANK" ? bankId : undefined, note: note || undefined, occurredAt, clientRequestId,
    } : {
      type,
      amount: parseFloat(amount),
      source,
      scope,
      paymentMethod,
      account,
      bankId: account === "BANK" ? bankId : undefined,
      walletId: account === "WALLET" ? walletId : undefined,
      note: note || undefined,
      occurredAt,
      clientRequestId,
    };

    try {
      if (!transaction && !navigator.onLine) throw new TypeError("Offline");
      const res = await fetch(transaction ? `/api/transactions/${transaction.id}` : endpoint, {
        method: transaction ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message = typeof data?.error === "string" ? data.error : "Failed to save transaction";
        setError(message);
        showToast(message, "error");
        return;
      }

      showToast(transaction ? "Transaction updated" : "Transaction added");

      if (transaction || !addAnother) {
        router.push(returnTo ?? "/transactions");
        router.refresh();
      } else {
        setAmount("");
        setSource("");
        setNote("");
        setError("Saved. Ready for the next transaction.");
      }
    } catch (requestError) {
      if (!transaction && userId && (requestError instanceof TypeError || !navigator.onLine)) {
        await queueTransaction({ ownerId: userId, endpoint, body, label: source || (usePocketFunding ? "Pocket money" : "Transaction"), amount: Number(amount), type, occurredAt });
        setAmount("");
        setSource("");
        setNote("");
        setError("Saved offline. It will sync automatically when your connection returns.");
        showToast("Transaction saved offline");
      } else {
        setError("Something went wrong. Please try again.");
        showToast("Could not save transaction", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(event) => saveTransaction(event)} className="form-card min-w-0 w-full max-w-md">
      {/* Income vs Expense toggle */}
      <div className="flex rounded-lg overflow-hidden border">
        <button
          type="button"
          onClick={() => setType("INCOME")}
          className={`flex-1 py-2 font-medium ${
            type === "INCOME" ? "bg-income text-white" : "bg-gray-100 text-gray-500"
          }`}
        >
          Income
        </button>
        <button
          type="button"
          onClick={() => setType("EXPENSE")}
          className={`flex-1 py-2 font-medium ${
            type === "EXPENSE" ? "bg-expense text-white" : "bg-gray-100 text-gray-500"
          }`}
        >
          Expense
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Amount (BDT)</label>
        <input
          type="number"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {type === "INCOME" ? "Source (client, project...)" : "Payee (shop, family member...)"}
        </label>
        <input
          type="text"
          required
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          placeholder={type === "INCOME" ? "e.g. Fiverr client - logo design" : "e.g. Local market"}
        />
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="min-w-0 max-w-full w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div className="min-w-0">
          <label className="block text-sm font-medium mb-1">Time</label>
          <input
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="min-w-0 max-w-full w-full border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Account</label>
        <select value={account} onChange={(e) => setAccount(e.target.value)} className="w-full border rounded-lg px-3 py-2">
          {ACCOUNTS.map((item) => <option key={item} value={item}>{item === "POCKET_MONEY" ? "Pocket money" : item === "WALLET" ? "Wallet" : "Bank account"}</option>)}
        </select>
      </div>

      {account === "BANK" && (
        <div>
          <div className="mb-1 flex items-center justify-between gap-3"><label className="block text-sm font-medium">Bank account</label><Link href="/bank" className="text-xs font-semibold text-brand hover:underline">Manage banks</Link></div>
          <select required value={bankId} onChange={(e) => setBankId(e.target.value)} disabled={banks.length === 0} className="w-full border rounded-lg px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-50">
            <option value="">{banks.length ? "Select a bank account" : "Add a bank account first"}</option>
            {banks.map((bank) => <option key={bank.id} value={bank.id}>{bank.name}</option>)}
          </select>
          {banks.length === 0 && <p className="mt-1 text-xs text-expense">Add a bank account before recording a bank transaction.</p>}
        </div>
      )}

      {account === "WALLET" && (
        <div>
          <div className="mb-1 flex items-center justify-between gap-3"><label className="block text-sm font-medium">Wallet</label><Link href="/wallet" className="text-xs font-semibold text-brand hover:underline">Manage wallets</Link></div>
          <select required value={walletId} onChange={(e) => setWalletId(e.target.value)} disabled={wallets.length === 0} className="w-full border rounded-lg px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-50">
            <option value="">{wallets.length ? "Select a wallet" : "Add a wallet first"}</option>
            {wallets.map((wallet) => <option key={wallet.id} value={wallet.id}>{wallet.name}</option>)}
          </select>
          {wallets.length === 0 && <p className="mt-1 text-xs text-expense">Add a wallet before recording a wallet transaction.</p>}
        </div>
      )}

      {!transaction && type === "INCOME" && account === "POCKET_MONEY" && <div><label className="block text-sm font-medium mb-1">Money comes from</label><select value={pocketSource} onChange={(e) => setPocketSource(e.target.value)} className="w-full border rounded-lg px-3 py-2">{POCKET_SOURCES.map((item) => <option key={item} value={item}>{item === "BANK" ? "Bank account" : item === "PROJECT_FEE" ? "Project fee" : item === "OTHER" ? "Other income" : item.charAt(0) + item.slice(1).toLowerCase()}</option>)}</select>{pocketSource === "BANK" && <select required value={bankId} onChange={(e) => setBankId(e.target.value)} disabled={banks.length === 0} className="mt-3 w-full border rounded-lg px-3 py-2 disabled:bg-gray-50"><option value="">{banks.length ? "Select the bank to withdraw from" : "Add a bank account first"}</option>{banks.map((bank) => <option key={bank.id} value={bank.id}>{bank.name}</option>)}</select>}</div>}

      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Scope</label>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            {SCOPES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            {PAYMENT_METHODS.map((p) => (
              <option key={p} value={p}>
                {p.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Note (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          rows={2}
        />
      </div>

      {error && <p className="text-expense text-sm">{error}</p>}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          disabled={loading || (account === "BANK" && !bankId) || (account === "WALLET" && !walletId) || (type === "INCOME" && account === "POCKET_MONEY" && pocketSource === "BANK" && !bankId)}
          className="flex-1 rounded-lg bg-brand py-2 font-medium text-white disabled:opacity-60"
        >
          {loading ? (transaction ? "Updating..." : "Saving...") : transaction ? "Update Transaction" : "Save Transaction"}
        </button>
        {!transaction && (
          <button
            type="button"
            disabled={loading || (account === "BANK" && !bankId) || (account === "WALLET" && !walletId) || (type === "INCOME" && account === "POCKET_MONEY" && pocketSource === "BANK" && !bankId)}
            onClick={(event) => saveTransaction(event, true)}
            className="flex-1 rounded-lg border border-brand px-3 py-2 font-medium text-brand disabled:opacity-60"
          >
            Save &amp; add another
          </button>
        )}
      </div>
    </form>
  );
}

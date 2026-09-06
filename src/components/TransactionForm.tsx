"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PAYMENT_METHODS = ["CASH", "BKASH", "NAGAD", "ROCKET", "BANK_TRANSFER", "CARD", "OTHER"];
const SCOPES = ["PERSONAL", "FAMILY", "BUSINESS"];

export default function TransactionForm() {
  const router = useRouter();
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [scope, setScope] = useState("PERSONAL");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const occurredAt = new Date(`${date}T${time}:00`).toISOString();

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount: parseFloat(amount),
          source,
          scope,
          paymentMethod,
          note: note || undefined,
          occurredAt,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.toString() ?? "Failed to save transaction");
        return;
      }

      router.push("/transactions");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4 max-w-md">
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <input
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand text-white py-2 rounded-lg font-medium disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Transaction"}
      </button>
    </form>
  );
}

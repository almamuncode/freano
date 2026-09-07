"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Transaction } from "@/types";

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-BD", { style: "currency", currency }).format(amount);
}

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const router = useRouter();
  const [visibleTransactions, setVisibleTransactions] = useState(transactions);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setVisibleTransactions(transactions);
  }, [transactions]);

  if (visibleTransactions.length === 0) {
    return <p className="text-gray-500 text-center py-8">No transactions yet.</p>;
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this transaction? This cannot be undone.")) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to delete transaction");
      }
      setVisibleTransactions((current) => current.filter((transaction) => transaction.id !== id));
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Failed to delete transaction");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow divide-y">
      {visibleTransactions.map((t) => (
        <div key={t.id} className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="font-medium">
              {t.category?.icon ?? (t.type === "INCOME" ? "💰" : "💸")} {t.source}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(t.occurredAt).toLocaleString("en-BD", {
                dateStyle: "medium",
                timeStyle: "short",
              })}{" "}
              · {t.scope.charAt(0) + t.scope.slice(1).toLowerCase()} · {t.paymentMethod.replace("_", " ")}
            </p>
            {t.note && <p className="text-xs text-gray-400">{t.note}</p>}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span
              className={`font-semibold ${t.type === "INCOME" ? "text-income" : "text-expense"}`}
            >
              {t.type === "INCOME" ? "+" : "-"}
              {formatMoney(t.amount, t.currency)}
            </span>
            <div className="flex items-center gap-3 text-xs">
              <Link href={`/transactions/edit/${t.id}`} className="font-medium text-brand hover:underline">
                Edit
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(t.id)}
                disabled={deletingId === t.id}
                className="font-medium text-expense hover:underline disabled:cursor-wait disabled:opacity-50"
              >
                {deletingId === t.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

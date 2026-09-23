"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Transaction } from "@/types";
import { showToast } from "@/lib/toast";

function formatMoney(amount: number, currency: string) {
  return `${currency === "BDT" ? "৳" : `${currency} `}${new Intl.NumberFormat("en-BD", { maximumFractionDigits: 2 }).format(amount)}`;
}

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const router = useRouter();
  const [visibleTransactions, setVisibleTransactions] = useState(transactions);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setVisibleTransactions(transactions);
  }, [transactions]);

  if (visibleTransactions.length === 0) {
    return <div className="card-surface px-6 py-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-xl text-brand">✦</div><p className="mt-4 font-semibold text-ink">Your activity will appear here</p><p className="mt-1 text-sm text-ink/55">Add an income or expense to begin your financial timeline.</p></div>;
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
      showToast("Transaction deleted");
      router.refresh();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to delete transaction", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="card-surface divide-y divide-hairline overflow-hidden">
      {visibleTransactions.map((t) => (
        <div key={t.id} className="flex min-w-0 items-start justify-between gap-2 px-3 py-4 transition hover:bg-brand/[0.025] min-[380px]:gap-3 min-[380px]:px-4 sm:items-center sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base ${t.type === "INCOME" ? "bg-income/10 text-income" : "bg-expense/10 text-expense"}`}>{t.category?.icon ?? (t.isDeposit ? "↳" : t.type === "INCOME" ? "+" : "−")}</span>
            <div className="min-w-0"><p className="truncate font-semibold text-ink">
              {t.isDeposit ? "Deposit: " : ""}{t.source}
            </p>
            <p className="truncate text-xs text-ink/55">
              {new Date(t.occurredAt).toLocaleString("en-BD", {
                dateStyle: "medium",
                timeStyle: "short",
              })}{" "}
              · {t.account === "POCKET_MONEY" ? "Pocket money" : t.account === "SAVINGS" ? "Personal savings" : "Bank"} · {t.scope.charAt(0) + t.scope.slice(1).toLowerCase()} · {t.paymentMethod.replace("_", " ")}
            </p>
            {t.note && <p className="truncate text-xs text-ink/40">{t.note}</p>}</div>
          </div>
          <div className="flex max-w-[40%] shrink-0 flex-col items-end gap-2 sm:max-w-none">
            <span
              className={`break-all text-right text-sm font-bold sm:text-base ${t.type === "INCOME" ? "text-income" : "text-expense"}`}
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

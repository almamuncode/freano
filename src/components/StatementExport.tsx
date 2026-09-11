"use client";

import { useState } from "react";
import type { Transaction } from "@/types";

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export default function StatementExport({ transactions }: { transactions: Transaction[] }) {
  const [exporting, setExporting] = useState(false);

  function exportCsv() {
    setExporting(true);
    const rows = [
      ["Date", "Type", "Description", "Amount", "Currency", "Scope", "Payment method", "Note"],
      ...transactions.map((transaction) => [
        new Date(transaction.occurredAt).toLocaleString("en-BD"),
        transaction.type === "INCOME" ? "Income" : "Expense",
        transaction.source,
        String(transaction.amount),
        transaction.currency,
        transaction.scope,
        transaction.paymentMethod.replaceAll("_", " "),
        transaction.note ?? "",
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `freano-statement-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  return (
    <button
      type="button"
      onClick={exportCsv}
      disabled={exporting || transactions.length === 0}
      className="rounded-lg border border-brand/30 px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {exporting ? "Preparing..." : "Export CSV"}
    </button>
  );
}

import { Transaction } from "@/types";

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-BD", { style: "currency", currency }).format(amount);
}

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return <p className="text-gray-500 text-center py-8">No transactions yet.</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow divide-y">
      {transactions.map((t) => (
        <div key={t.id} className="flex items-center justify-between px-4 py-3">
          <div>
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
          <span
            className={`font-semibold ${t.type === "INCOME" ? "text-income" : "text-expense"}`}
          >
            {t.type === "INCOME" ? "+" : "-"}
            {formatMoney(t.amount, t.currency)}
          </span>
        </div>
      ))}
    </div>
  );
}

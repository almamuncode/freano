type BudgetHealthCardProps = {
  income: number;
  expenses: number;
  dayOfMonth: number;
  daysInMonth: number;
};

function formatMoney(amount: number) {
  return `৳${new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(amount)}`;
}

export default function BudgetHealthCard({ income, expenses, dayOfMonth, daysInMonth }: BudgetHealthCardProps) {
  const remaining = Math.max(income - expenses, 0);
  const daysRemaining = Math.max(daysInMonth - dayOfMonth + 1, 1);
  const usedPercentage = income > 0 ? Math.min((expenses / income) * 100, 100) : 0;
  const monthProgress = Math.min((dayOfMonth / daysInMonth) * 100, 100);
  const safePerDay = remaining / daysRemaining;
  const isAheadOfPace = usedPercentage > monthProgress + 5;
  const hasIncome = income > 0;

  return (
    <section className="card-surface overflow-hidden p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="page-kicker">Monthly budget health</p>
          <h2 className="mt-2 text-lg font-bold text-ink">Know what is safe to spend</h2>
          <p className="mt-1 text-sm text-ink/60">Based on income received this month.</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${!hasIncome ? "bg-gray-100 text-ink/55" : isAheadOfPace ? "bg-[#fff0ed] text-rust" : "bg-[#edf8e9] text-sage"}`}>
          {!hasIncome ? "Add income" : isAheadOfPace ? "Watch spending" : "On track"}
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div><p className="text-xs text-ink/55">Remaining this month</p><p className="mt-1 text-3xl font-bold tracking-tight text-ink">{formatMoney(remaining)}</p></div>
        <p className="text-right text-xs text-ink/50">{Math.round(usedPercentage)}% used</p>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#e9eee8] dark:bg-white/10">
        <div className={`h-full rounded-full transition-all ${isAheadOfPace ? "bg-expense" : "bg-gradient-to-r from-[#4e9c3f] to-[#83dc5d]"}`} style={{ width: `${usedPercentage}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-ink/45"><span>Spent {formatMoney(expenses)}</span><span>Income {formatMoney(income)}</span></div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-hairline pt-5">
        <div className="rounded-xl bg-[#f4f8f2] p-3 dark:bg-white/5"><p className="text-xs text-ink/50">Safe per day</p><p className="mt-1 text-lg font-bold text-brand">{formatMoney(safePerDay)}</p></div>
        <div className="rounded-xl bg-[#f4f8f2] p-3 dark:bg-white/5"><p className="text-xs text-ink/50">Days remaining</p><p className="mt-1 text-lg font-bold text-ink">{daysRemaining}</p></div>
      </div>
    </section>
  );
}

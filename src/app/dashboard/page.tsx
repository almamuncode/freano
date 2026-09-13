import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TransactionList from "@/components/TransactionList";
import DashboardChart from "@/components/DashboardChart";
import QuickCalculator from "@/components/QuickCalculator";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [user, transactions, monthTransactions, loans, projects, accountTotals] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, image: true } }),
    prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { occurredAt: "desc" },
      take: 6,
    }),
    prisma.transaction.findMany({
      where: { userId, transferId: null, isDeposit: false, occurredAt: { gte: monthStart, lt: monthEnd } },
      orderBy: { occurredAt: "asc" },
      select: { type: true, amount: true, occurredAt: true },
    }),
    prisma.loan.findMany({ where: { userId, status: "OPEN" }, include: { payments: true } }),
    prisma.project.findMany({ where: { userId, status: { not: "PAID" } } }),
    prisma.transaction.groupBy({ by: ["account", "type"], where: { userId }, _sum: { amount: true } }),
  ]);

  const monthIncome = monthTransactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + Number(t.amount), 0);
  const monthExpense = monthTransactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + Number(t.amount), 0);
  const monthlyTotalsByDay = new Map<number, { income: number; expense: number }>();
  for (const transaction of monthTransactions) {
    const day = transaction.occurredAt.getDate();
    const totals = monthlyTotalsByDay.get(day) ?? { income: 0, expense: 0 };
    totals[transaction.type === "INCOME" ? "income" : "expense"] += Number(transaction.amount);
    monthlyTotalsByDay.set(day, totals);
  }
  const chartData = Array.from({ length: now.getDate() }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), index + 1);
    const totals = monthlyTotalsByDay.get(index + 1) ?? { income: 0, expense: 0 };
    return {
      day: String(index + 1),
      income: totals.income,
      expense: totals.expense,
      date: date.toLocaleDateString("en-BD", { day: "numeric", month: "short" }),
    };
  });

  const accountBalance = (account: "BANK" | "SAVINGS" | "POCKET_MONEY" | "WALLET") => accountTotals
    .filter((total) => total.account === account)
    .reduce((sum, total) => sum + (total.type === "INCOME" ? Number(total._sum.amount ?? 0) : -Number(total._sum.amount ?? 0)), 0);
  const bankBalance = accountBalance("BANK");
  const pocketMoneyBalance = accountBalance("POCKET_MONEY");
  const walletBalance = accountBalance("WALLET");
  const totalBalance = accountTotals.reduce((sum, total) => sum + (total.type === "INCOME" ? Number(total._sum.amount ?? 0) : -Number(total._sum.amount ?? 0)), 0);
  const lentOutstanding = loans.filter((loan) => loan.direction === "LENT").reduce((sum, loan) => sum + Math.max(Number(loan.principal) * (1 + Number(loan.interestRate) / 100) - loan.payments.reduce((paid, payment) => paid + Number(payment.amount), 0), 0), 0);
  const borrowedOutstanding = loans.filter((loan) => loan.direction === "BORROWED").reduce((sum, loan) => sum + Math.max(Number(loan.principal) * (1 + Number(loan.interestRate) / 100) - loan.payments.reduce((paid, payment) => paid + Number(payment.amount), 0), 0), 0);
  const projectOutstanding = projects.reduce((sum, project) => sum + Math.max(Number(project.agreedAmount) - Number(project.paidAmount), 0), 0);

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brass">Your financial home</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Good to see you, {user?.name?.split(" ")[0] ?? "there"}.</h1>
          <p className="mt-1 text-sm text-ink/60">Here is your money at a glance.</p>
        </div>
        <p className="text-sm font-medium text-ink/55">{now.toLocaleDateString("en-BD", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.9fr]">
        <section className="card-surface overflow-hidden bg-[#20293A] p-6 text-white sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-brand-light text-lg font-bold">
                {user?.image ? <img src={user.image} alt="" className="h-full w-full object-cover" /> : (user?.name ?? "U").slice(0, 1).toUpperCase()}
              </div>
              <div><p className="text-sm text-white/60">Current balance</p><p className="text-xs text-white/45">All time</p></div>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">Bangladeshi Taka</span>
          </div>
          <p className="mt-8 text-4xl font-bold tracking-tight sm:text-5xl">{formatMoney(totalBalance)}</p>
          <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
            <div><p className="text-xs text-white/50">This month income</p><p className="mt-1 text-lg font-semibold text-[#9fe3a3]">+{formatMoney(monthIncome)}</p></div>
            <div><p className="text-xs text-white/50">This month expense</p><p className="mt-1 text-lg font-semibold text-[#f3aaa0]">-{formatMoney(monthExpense)}</p></div>
          </div>
          <div className="mt-5 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
            <a href="/bank" className="border-l border-white/20 pl-3 transition hover:border-[#9fe3a3]"><p className="text-xs text-white/50">Bank accounts</p><p className="mt-1 text-base font-semibold text-white">{formatMoney(bankBalance)}</p></a>
            <a href="/pocket-money" className="border-l border-white/20 pl-3 transition hover:border-[#9fe3a3]"><p className="text-xs text-white/50">Pocket money</p><p className="mt-1 text-base font-semibold text-white">{formatMoney(pocketMoneyBalance)}</p></a>
            <a href="/wallet" className="border-l border-white/20 pl-3 transition hover:border-[#9fe3a3]"><p className="text-xs text-white/50">Wallets</p><p className="mt-1 text-base font-semibold text-white">{formatMoney(walletBalance)}</p></a>
          </div>
        </section>

        <section className="card-surface p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">Financial control center</p>
          <h2 className="mt-3 text-2xl font-bold text-ink">Stay in control of your finances</h2>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <a href="/transactions/add?type=INCOME" className="rounded-xl bg-[#e7f4e8] p-5 text-sage transition hover:-translate-y-0.5"><span className="block text-xs font-semibold uppercase tracking-wider">Income</span><span className="mt-3 block text-lg font-bold">Add income +</span></a>
            <a href="/transactions/add?type=EXPENSE" className="rounded-xl bg-[#fae9e5] p-5 text-rust transition hover:-translate-y-0.5"><span className="block text-xs font-semibold uppercase tracking-wider">Expense</span><span className="mt-3 block text-lg font-bold">Add expense -</span></a>
          </div>
          <a href="/bills/pay" className="mt-4 flex items-center justify-between rounded-xl border border-[#e8d7aa] bg-[#fffcf5] px-5 py-4 text-brass transition hover:border-brass/50"><span><span className="block text-xs font-semibold uppercase tracking-wider">Payments</span><span className="mt-1 block font-bold">Pay a bill</span></span><span aria-hidden="true">-&gt;</span></a>
          <a href="/statement" className="mt-3 flex items-center justify-between rounded-xl bg-[#f5eddb] px-4 py-3 font-semibold text-brass">View full statement <span aria-hidden="true">-&gt;</span></a>
        </section>
      </div>

      <section className="card-surface p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-brass">Beyond your balance</p><h2 className="mt-2 text-xl font-bold text-ink">Money still in motion</h2><p className="mt-1 text-sm text-ink/60">Track obligations and expected income before they become surprises.</p></div><div className="flex gap-3 text-sm"><a href="/loans" className="font-semibold text-brand">Loans -&gt;</a><a href="/projects" className="font-semibold text-brand">Projects -&gt;</a></div></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3"><a href="/loans" className="rounded-xl border border-hairline bg-[#f8fbf8] p-4 transition hover:-translate-y-0.5"><p className="text-xs font-semibold uppercase tracking-wider text-income">People owe you</p><p className="mt-2 text-2xl font-bold text-ink">{formatMoney(lentOutstanding)}</p><p className="mt-1 text-xs text-ink/55">Open loans you gave</p></a><a href="/loans" className="rounded-xl border border-hairline bg-[#fff9f7] p-4 transition hover:-translate-y-0.5"><p className="text-xs font-semibold uppercase tracking-wider text-rust">You owe people</p><p className="mt-2 text-2xl font-bold text-ink">{formatMoney(borrowedOutstanding)}</p><p className="mt-1 text-xs text-ink/55">Open loans you took</p></a><a href="/projects" className="rounded-xl border border-hairline bg-[#fffcf5] p-4 transition hover:-translate-y-0.5"><p className="text-xs font-semibold uppercase tracking-wider text-brass">Project receivables</p><p className="mt-2 text-2xl font-bold text-ink">{formatMoney(projectOutstanding)}</p><p className="mt-1 text-xs text-ink/55">Payment still outstanding</p></a></div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.9fr]">
        <section className="card-surface p-5 sm:p-6">
          <div className="mb-5 flex items-end justify-between"><div><h2 className="text-lg font-bold text-ink">Monthly movement</h2><p className="mt-1 text-sm text-ink/55">Income and expenses in {now.toLocaleDateString("en-BD", { month: "long" })}</p></div><div className="flex gap-3 text-xs text-ink/60"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-income" />Income</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-expense" />Expense</span></div></div>
          <DashboardChart data={chartData} />
        </section>
        <section className="card-surface p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Monthly rhythm</p><h2 className="mt-2 text-lg font-bold text-ink">Make the next decision clearly</h2><p className="mt-1 text-sm text-ink/60">Use your current month numbers as a simple planning guide.</p></div><span className="text-2xl text-brand" aria-hidden="true">◌</span></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl border border-hairline p-3"><p className="text-xs text-ink/55">Net this month</p><p className={`mt-1 text-lg font-bold ${monthIncome - monthExpense >= 0 ? "text-brand" : "text-ink"}`}>{formatMoney(monthIncome - monthExpense)}</p></div><div className="rounded-xl border border-hairline p-3"><p className="text-xs text-ink/55">Transactions</p><p className="mt-1 text-lg font-bold text-ink">{monthTransactions.length}</p></div></div><QuickCalculator /></section>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold text-ink">Recent transactions</h2><a href="/transactions" className="text-sm font-semibold text-brand hover:text-brand-dark">View all</a></div>
        <TransactionList
          transactions={transactions.map((t) => ({
            ...t,
            amount: Number(t.amount),
            occurredAt: t.occurredAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}

function formatMoney(amount: number) {
  return `৳${new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(amount)}`;
}

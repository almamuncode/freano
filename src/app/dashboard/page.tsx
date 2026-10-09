import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TransactionList from "@/components/TransactionList";
import DashboardChart from "@/components/DashboardChart";
import BudgetHealthCard from "@/components/BudgetHealthCard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const [user, transactions, monthTransactions, projects, earnings, accountTotals] = await Promise.all([
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
    prisma.project.findMany({ where: { userId, status: { not: "PAID" } } }),
    prisma.freelanceEarning.findMany({
      where: { userId, status: { not: "RECEIVED" } },
      select: { id: true, platform: true, title: true, netAmountBdt: true, expectedPayoutAt: true, status: true },
      orderBy: { createdAt: "desc" },
    }),
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
  const projectOutstanding = projects.reduce((sum, project) => sum + Math.max(Number(project.agreedAmount) - Number(project.paidAmount), 0), 0);
  const pendingPayouts = earnings.reduce((sum, earning) => sum + Number(earning.netAmountBdt), 0);
  const upcomingEarnings = [...earnings]
    .sort((a, b) => {
      if (!a.expectedPayoutAt) return 1;
      if (!b.expectedPayoutAt) return -1;
      return a.expectedPayoutAt.getTime() - b.expectedPayoutAt.getTime();
    })
    .slice(0, 4);

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="page-kicker">Financial overview</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Good {now.getHours() < 12 ? "morning" : now.getHours() < 18 ? "afternoon" : "evening"}, {user?.name?.split(" ")[0] ?? "there"}.</h1>
          <p className="mt-1 text-sm text-ink/60">Here&apos;s a clear view of your money today.</p>
        </div>
        <p className="text-sm font-medium text-ink/55">{now.toLocaleDateString("en-BD", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      <section className="relative overflow-hidden rounded-2xl border border-[#7348ef] bg-[linear-gradient(125deg,#3610c4_0%,#5016eb_56%,#7028ff_100%)] p-6 text-white shadow-xl shadow-[#5428df]/20 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full border-[38px] border-[#bfaaff]/10" />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-[#ff8038] text-lg font-bold text-[#ffffff] shadow-lg shadow-black/20">
                {user?.image ? <img src={user.image} alt="" className="h-full w-full object-cover" /> : (user?.name ?? "U").slice(0, 1).toUpperCase()}
              </div>
              <div><p className="text-sm font-medium text-white/70">Current balance</p><p className="mt-0.5 text-xs text-white/45">Across every account</p></div>
            </div>
            <span className="rounded-full border border-white/15 bg-black/10 px-3 py-1 text-[11px] font-medium text-white/80">BDT • All accounts</span>
          </div>
          <p className="mt-5 break-words text-3xl font-bold tracking-tight tabular-nums min-[380px]:text-4xl sm:text-5xl">{formatMoney(totalBalance)}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur"><p className="text-xs text-white/60">This month income</p><p className="mt-1 text-lg font-semibold text-[#e0d5ff]">+{formatMoney(monthIncome)}</p></div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur"><p className="text-xs text-white/60">This month expense</p><p className="mt-1 text-lg font-semibold text-[#ffd5bd]">-{formatMoney(monthExpense)}</p></div>
          </div>
          <div className="mt-5 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
            <a href="/bank" className="group rounded-xl border border-white/10 bg-black/10 p-3 transition hover:border-[#c8b6ff] hover:bg-white/10"><p className="text-xs text-white/50">Bank accounts</p><p className="mt-1 flex items-center justify-between gap-2 text-base font-semibold text-white"><span>{formatMoney(bankBalance)}</span><span className="text-white/40 transition-transform group-hover:translate-x-0.5" aria-hidden="true">-&gt;</span></p></a>
            <a href="/pocket-money" className="group rounded-xl border border-white/10 bg-black/10 p-3 transition hover:border-[#c8b6ff] hover:bg-white/10"><p className="text-xs text-white/50">Pocket money</p><p className="mt-1 flex items-center justify-between gap-2 text-base font-semibold text-white"><span>{formatMoney(pocketMoneyBalance)}</span><span className="text-white/40 transition-transform group-hover:translate-x-0.5" aria-hidden="true">-&gt;</span></p></a>
            <a href="/wallet" className="group rounded-xl border border-white/10 bg-black/10 p-3 transition hover:border-[#c8b6ff] hover:bg-white/10"><p className="text-xs text-white/50">Wallets</p><p className="mt-1 flex items-center justify-between gap-2 text-base font-semibold text-white"><span>{formatMoney(walletBalance)}</span><span className="text-white/40 transition-transform group-hover:translate-x-0.5" aria-hidden="true">-&gt;</span></p></a>
          </div>
      </section>

      <div className="grid min-w-0 gap-3 sm:grid-cols-3">
        <a href="/earnings" className="card-surface min-w-0 p-4 transition hover:-translate-y-0.5"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eee8ff] text-xl text-brand" aria-hidden="true">↗</div><p className="text-xs font-semibold uppercase tracking-wider text-brand">Pending payouts</p><p className="mt-2 break-words text-2xl font-bold">{formatMoney(pendingPayouts)}</p><p className="mt-1 text-xs text-ink/50">Marketplace and creator income →</p></a>
        <a href="/projects" className="card-surface min-w-0 p-4 transition hover:-translate-y-0.5"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff0df] text-xl text-rust" aria-hidden="true">▣</div><p className="text-xs font-semibold uppercase tracking-wider text-rust">Client receivables</p><p className="mt-2 break-words text-2xl font-bold">{formatMoney(projectOutstanding)}</p><p className="mt-1 text-xs text-ink/50">Unpaid project work →</p></a>
        <a href="/transactions/add?type=EXPENSE" className="card-surface p-4 transition hover:-translate-y-0.5"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ffede3] text-xl text-rust" aria-hidden="true">+</div><p className="text-xs font-semibold uppercase tracking-wider text-rust">Quick action</p><p className="mt-2 text-lg font-bold">Add an expense</p><p className="mt-1 text-xs text-ink/50">Keep this month accurate →</p></a>
      </div>

      <div className="grid min-w-0 gap-5 lg:items-start lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="min-w-0 space-y-5">
        <section className="card-surface p-5 sm:p-6">
          <div className="mb-5 flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-end"><div className="min-w-0"><h2 className="text-lg font-bold text-ink">Monthly movement</h2><p className="mt-1 text-sm text-ink/55">Income and expenses in {now.toLocaleDateString("en-BD", { month: "long" })}</p></div><div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-ink/60"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#601bff]" />Income</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#ff914d]" />Expense</span><span className={`max-w-full truncate rounded-full px-2.5 py-1 font-bold ${monthIncome - monthExpense >= 0 ? "bg-[#f0eaff] text-sage" : "bg-[#fff0e6] text-rust"}`}>Net {formatMoney(monthIncome - monthExpense)}</span></div></div>
          <DashboardChart data={chartData} />
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between"><div><h2 className="text-lg font-bold text-ink">Recent transactions</h2><p className="mt-0.5 text-xs text-ink/50">Your latest account activity</p></div><a href="/transactions" className="text-sm font-semibold text-brand hover:text-brand-dark">View all →</a></div>
          <TransactionList transactions={transactions.map((t) => ({ ...t, amount: Number(t.amount), occurredAt: t.occurredAt.toISOString() }))} />
        </section>
      </div>
      <div className="min-w-0 space-y-5">
        <BudgetHealthCard income={monthIncome} expenses={monthExpense} dayOfMonth={now.getDate()} daysInMonth={daysInMonth} />
        <section className="card-surface p-5">
          <p className="page-kicker">Quick actions</p>
          <div className="mt-4 grid gap-2">
            <a href="/earnings" className="group relative overflow-hidden rounded-xl bg-[linear-gradient(110deg,#4320bb_0%,#683bef_55%,#ff8038_100%)] px-4 py-4 text-white shadow-lg shadow-brand/20 transition hover:-translate-y-0.5 hover:shadow-brand/30 dark:border dark:border-[#ff8038]/30 dark:bg-[linear-gradient(110deg,#4320bb_0%,#5428df_58%,#7348ef_100%)]">
              <span className="pointer-events-none absolute -right-8 -top-12 h-28 w-28 rounded-full border-[18px] border-white/10" />
              <span className="relative flex items-center justify-between gap-3"><span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-xl font-light">+</span><span><span className="block text-sm font-bold">Add freelance earning</span><span className="mt-0.5 block text-[11px] text-white/70">Marketplace, creator, or client income</span></span></span><span className="text-lg transition-transform group-hover:translate-x-0.5">→</span></span>
            </a>
            <a href="/transactions/add?type=EXPENSE" className="flex items-center justify-between rounded-xl bg-[#fff0e6] px-4 py-3 text-sm font-semibold text-rust">Add expense <span>+</span></a>
            <a href="/projects" className="flex items-center justify-between rounded-xl border border-hairline px-4 py-3 text-sm font-semibold">Track client project <span>→</span></a>
          </div>
        </section>
        <section className="card-surface p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3"><div><p className="page-kicker">Upcoming money</p><h2 className="mt-2 text-lg font-bold text-ink">Payouts on the way</h2></div><a href="/earnings" className="text-xs font-semibold text-brand">Manage →</a></div>
          {upcomingEarnings.length > 0 ? <div className="mt-5 divide-y divide-hairline">
            {upcomingEarnings.map((earning) => <a key={earning.id} href="/earnings" className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0eaff] text-xs font-bold text-sage">{earning.platform.slice(0, 1).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{earning.platform}</p><p className="truncate text-xs text-ink/45">{earning.expectedPayoutAt ? `Expected ${earning.expectedPayoutAt.toLocaleDateString("en-BD", { day: "numeric", month: "short" })}` : earning.status === "AVAILABLE" ? "Available to withdraw" : "Date not set"}</p></div></div><p className="shrink-0 text-sm font-bold text-income">{formatMoney(Number(earning.netAmountBdt))}</p></a>)}
          </div> : <div className="mt-5 rounded-xl border border-dashed border-hairline p-5 text-center"><p className="text-sm font-semibold text-ink">No payouts scheduled</p><p className="mt-1 text-xs text-ink/50">Add an earning with an expected date to see it here.</p><a href="/earnings" className="mt-3 inline-flex text-xs font-bold text-brand">Add earning →</a></div>}
          <div className="mt-5 flex items-center justify-between rounded-xl bg-[#f0eaff] px-4 py-3 dark:bg-[#30204f]"><span className="text-xs font-semibold text-sage">Total still on the way</span><span className="font-bold text-ink dark:text-white">{formatMoney(pendingPayouts)}</span></div>
        </section>
      </div>
      </div>

    </div>
  );
}

function formatMoney(amount: number) {
  return `৳${new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(amount)}`;
}

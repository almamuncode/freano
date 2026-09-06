import { prisma } from "@/lib/prisma";
import UsersTable from "@/components/admin/UsersTable";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: { select: { transactions: true } },
      transactions: { select: { type: true, amount: true } },
    },
  });

  const rows = users.map((u) => {
    const income = u.transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = u.transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt.toISOString(),
      transactionCount: u._count.transactions,
      balance: income - expense,
    };
  });

  return (
    <div>
      <header className="mb-8 pb-4 border-b-2 border-ink flex items-baseline justify-between">
        <div>
          <h1 className="font-ledger text-3xl font-semibold text-ink">Users</h1>
          <p className="text-sm text-ink/60 mt-1">
            {rows.length} {rows.length === 1 ? "person" : "people"} registered
          </p>
        </div>
      </header>

      <UsersTable initialUsers={rows} />
    </div>
  );
}

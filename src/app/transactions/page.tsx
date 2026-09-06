import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TransactionList from "@/components/TransactionList";

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const transactions = await prisma.transaction.findMany({
    where: { userId: (session.user as any).id },
    include: { category: true },
    orderBy: { occurredAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">All Transactions</h1>
      <TransactionList
        transactions={transactions.map((t) => ({
          ...t,
          amount: Number(t.amount),
          occurredAt: t.occurredAt.toISOString(),
        }))}
      />
    </div>
  );
}

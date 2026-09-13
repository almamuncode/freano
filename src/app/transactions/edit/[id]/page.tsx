import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TransactionForm from "@/components/TransactionForm";

export default async function EditTransactionPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;
  const [transaction, banks, wallets] = await Promise.all([
    prisma.transaction.findFirst({
      where: { id: params.id, userId },
      include: { category: true },
    }),
    prisma.bank.findMany({ where: { userId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.wallet.findMany({ where: { userId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!transaction) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Transaction</h1>
      <TransactionForm
        transaction={{
          ...transaction,
          amount: Number(transaction.amount),
          occurredAt: transaction.occurredAt.toISOString(),
        }}
        banks={banks}
        wallets={wallets}
      />
    </div>
  );
}
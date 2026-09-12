import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AccountLedger from "@/components/AccountLedger";
import PocketTransactionPanel from "@/components/PocketTransactionPanel";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PocketMoneyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;
  const transactions = await prisma.transaction.findMany({ where: { userId, account: "POCKET_MONEY" }, include: { category: true }, orderBy: { occurredAt: "desc" } });
  const banks = await prisma.bank.findMany({ where: { userId }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  const balance = transactions.reduce((total, transaction) => total + (transaction.type === "INCOME" ? Number(transaction.amount) : -Number(transaction.amount)), 0);
  return <AccountLedger account="POCKET_MONEY" balance={balance} transactions={transactions.map((transaction) => ({ ...transaction, amount: Number(transaction.amount), occurredAt: transaction.occurredAt.toISOString() }))} action={<PocketTransactionPanel banks={banks} />} />;
}
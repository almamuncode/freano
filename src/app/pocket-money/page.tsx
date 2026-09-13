import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AccountLedger from "@/components/AccountLedger";
import AccountTransferPanel from "@/components/AccountTransferPanel";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PocketMoneyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;
  const transactions = await prisma.transaction.findMany({ where: { userId, account: "POCKET_MONEY" }, include: { category: true }, orderBy: { occurredAt: "desc" } });
  const [banks, wallets] = await Promise.all([
    prisma.bank.findMany({ where: { userId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.wallet.findMany({ where: { userId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const balance = transactions.reduce((total, transaction) => total + (transaction.type === "INCOME" ? Number(transaction.amount) : -Number(transaction.amount)), 0);
  return <AccountLedger account="POCKET_MONEY" balance={balance} transactions={transactions.map((transaction) => ({ ...transaction, amount: Number(transaction.amount), occurredAt: transaction.occurredAt.toISOString() }))} action={<AccountTransferPanel currentAccount="POCKET_MONEY" banks={banks} wallets={wallets} />} />;
}
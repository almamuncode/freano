import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import AccountLedger from "@/components/AccountLedger";
import AccountRemovalButton from "@/components/AccountRemovalButton";
import AccountTransferPanel from "@/components/AccountTransferPanel";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function WalletDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;
  const wallet = await prisma.wallet.findFirst({ where: { id: params.id, userId }, include: { transactions: { include: { category: true }, orderBy: { occurredAt: "desc" } } } });
  if (!wallet) notFound();
  const [banks, wallets] = await Promise.all([
    prisma.bank.findMany({ where: { userId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.wallet.findMany({ where: { userId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const balance = wallet.transactions.reduce((total, transaction) => total + (transaction.type === "INCOME" ? Number(transaction.amount) : -Number(transaction.amount)), 0);
  return <AccountLedger account="WALLET" wallet={wallet} balance={balance} transactions={wallet.transactions.map((transaction) => ({ ...transaction, amount: Number(transaction.amount), occurredAt: transaction.occurredAt.toISOString() }))} action={<><AccountTransferPanel currentAccount="WALLET" currentId={wallet.id} banks={banks} wallets={wallets} /><AccountRemovalButton account="wallet" id={wallet.id} returnTo="/wallet" /></>} />;
}
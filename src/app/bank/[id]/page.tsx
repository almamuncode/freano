import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import AccountLedger from "@/components/AccountLedger";
import AccountTransferPanel from "@/components/AccountTransferPanel";
import AccountRemovalButton from "@/components/AccountRemovalButton";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BankDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const bank = await prisma.bank.findFirst({ where: { id: params.id, userId: (session.user as any).id }, include: { transactions: { include: { category: true }, orderBy: { occurredAt: "desc" } } } });
  if (!bank) notFound();
  const userId = (session.user as any).id;
  const [banks, wallets] = await Promise.all([
    prisma.bank.findMany({ where: { userId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.wallet.findMany({ where: { userId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const balance = bank.transactions.reduce((total, transaction) => total + (transaction.type === "INCOME" ? Number(transaction.amount) : -Number(transaction.amount)), 0);
  return <AccountLedger account="BANK" bank={bank} balance={balance} transactions={bank.transactions.map((transaction) => ({ ...transaction, amount: Number(transaction.amount), occurredAt: transaction.occurredAt.toISOString() }))} action={<><AccountTransferPanel currentAccount="BANK" currentId={bank.id} banks={banks} wallets={wallets} /><AccountRemovalButton account="bank" id={bank.id} returnTo="/bank" /></>} />;
}
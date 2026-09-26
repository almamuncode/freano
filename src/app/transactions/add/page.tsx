import TransactionForm from "@/components/TransactionForm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AddTransactionPage({
  searchParams,
}: {
  searchParams: { type?: string; account?: string; bankId?: string; walletId?: string; returnTo?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const initialType = searchParams.type === "INCOME" ? "INCOME" : searchParams.type === "EXPENSE" ? "EXPENSE" : undefined;
  const initialAccount = ["BANK", "WALLET", "POCKET_MONEY"].includes(searchParams.account ?? "") ? searchParams.account as "BANK" | "WALLET" | "POCKET_MONEY" : undefined;
  const returnTo = searchParams.returnTo && /^(\/bank\/[^/]+|\/wallet\/[^/]+|\/pocket-money)$/.test(searchParams.returnTo) ? searchParams.returnTo : undefined;
  const [banks, wallets] = await Promise.all([
    prisma.bank.findMany({ where: { userId: (session.user as any).id }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.wallet.findMany({ where: { userId: (session.user as any).id }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Add Transaction</h1>
      <TransactionForm userId={(session.user as any).id} initialType={initialType} initialAccount={initialAccount} initialBankId={initialAccount === "BANK" ? searchParams.bankId : undefined} initialWalletId={initialAccount === "WALLET" ? searchParams.walletId : undefined} returnTo={returnTo} banks={banks} wallets={wallets} />
    </div>
  );
}

import TransactionForm from "@/components/TransactionForm";

export default function AddTransactionPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const initialType = searchParams.type === "INCOME" ? "INCOME" : searchParams.type === "EXPENSE" ? "EXPENSE" : undefined;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Add Transaction</h1>
      <TransactionForm initialType={initialType} />
    </div>
  );
}

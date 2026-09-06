import TransactionForm from "@/components/TransactionForm";

export default function AddTransactionPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Add Transaction</h1>
      <TransactionForm />
    </div>
  );
}

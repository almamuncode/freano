export default function SummaryCard({
  label,
  amount,
  colorClass,
}: {
  label: string;
  amount: number;
  colorClass: string;
}) {
  return (
    <div className="card-surface p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-3 text-3xl font-bold tracking-tight ${colorClass}`}>
        {new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(amount)}
      </p>
    </div>
  );
}

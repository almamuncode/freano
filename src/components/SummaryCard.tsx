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
    <div className="bg-white rounded-xl shadow p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${colorClass}`}>
        {new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(amount)}
      </p>
    </div>
  );
}

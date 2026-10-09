"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ChartPoint = { day: string; date: string; income: number; expense: number };

export default function DashboardChart({ data }: { data: ChartPoint[] }) {
  const maxValue = useMemo(() => Math.max(...data.map((item) => Math.max(item.income, item.expense)), 100), [data]);

  return (
    <div className="h-64 min-w-0 w-full overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#eee8f8" strokeDasharray="3 3" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#7b8190" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis domain={[0, maxValue]} hide />
          <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload.date} formatter={(value: number, name: string) => [`৳${value.toLocaleString("en-BD")}`, name]} contentStyle={{ borderRadius: 10, border: "1px solid #e9e4f5", fontSize: 12 }} />
          <Bar dataKey="income" name="Income" fill="#601bff" radius={[4, 4, 0, 0]} maxBarSize={18} />
          <Bar dataKey="expense" name="Expense" fill="#ff914d" radius={[4, 4, 0, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

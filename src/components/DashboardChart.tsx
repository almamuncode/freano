"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ChartPoint = { day: string; date: string; income: number; expense: number };

export default function DashboardChart({ data }: { data: ChartPoint[] }) {
  const maxValue = useMemo(() => Math.max(...data.map((item) => Math.max(item.income, item.expense)), 100), [data]);

  return (
    <div className="h-64 min-w-0 w-full overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6338e8" stopOpacity={0.2} /><stop offset="100%" stopColor="#6338e8" stopOpacity={0} /></linearGradient>
            <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f88438" stopOpacity={0.16} /><stop offset="100%" stopColor="#f88438" stopOpacity={0} /></linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#eee8f8" strokeDasharray="3 3" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#7b8190" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis domain={[0, maxValue]} hide />
          <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload.date} formatter={(value: number) => [`BDT ${value.toLocaleString("en-BD")}`, ""]} contentStyle={{ borderRadius: 10, border: "1px solid #e9e4f5", fontSize: 12 }} />
          <Area type="monotone" dataKey="income" stroke="#6338e8" strokeWidth={2.5} fill="url(#incomeFill)" />
          <Area type="monotone" dataKey="expense" stroke="#f88438" strokeWidth={2.5} fill="url(#expenseFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

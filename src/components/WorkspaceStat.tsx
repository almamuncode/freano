import type { ReactNode } from "react";

export default function WorkspaceStat({ label, value, tone = "purple", icon, detail }: { label: string; value: string; tone?: "purple" | "green" | "pink" | "blue"; icon: ReactNode; detail?: string }) {
  const tones = { purple: "bg-brand/10 text-brand", green: "bg-income/10 text-income", pink: "bg-expense/10 text-expense", blue: "bg-sky-500/10 text-sky-500" };
  return <div className="card-surface flex min-w-0 items-center gap-3 p-4 sm:p-5"><span aria-hidden="true" className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl ${tones[tone]}`}>{icon}</span><div className="min-w-0"><p className="text-xs text-ink/60">{label}</p><p className="mt-1 break-words text-xl font-bold tabular-nums text-ink">{value}</p>{detail && <p className="mt-1 text-xs text-ink/50">{detail}</p>}</div></div>;
}

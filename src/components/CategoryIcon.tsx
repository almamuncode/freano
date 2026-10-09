import type { ReactNode } from "react";

type Kind = "wallet" | "bank" | "work" | "food" | "shopping" | "transport" | "home" | "utilities" | "software" | "gift" | "family" | "transfer" | "income" | "design" | "other";
const artwork: Record<Kind, ReactNode> = {
  wallet: <><rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 7V5a2 2 0 0 1 2-2h12M16 12h5v5h-5v-5Z"/></>,
  bank: <><path d="m3 8 9-5 9 5H3Zm2 4v6m5-6v6m4-6v6m5-6v6M3 21h18"/></>,
  design: <><rect x="4" y="4" width="16" height="16" rx="2"/><path d="m8 16 1-4 6-6 3 3-6 6-4 1Zm5-8 3 3"/></>,
  work: <><rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V4h6v3M4 12h16M10 12v3h4v-3"/></>,
  food: <><path d="M5 3v7m3-7v7M3 3v5a3 3 0 0 0 6 0V3M6 11v10M17 3c-3 3-4 7-4 10h5M18 3v18"/></>,
  shopping: <><path d="M5 8h14l1 12H4L5 8Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></>,
  transport: <><rect x="5" y="3" width="14" height="16" rx="3"/><path d="M5 11h14M9 3v8M7 19v2m10-2v2M8 15h1m6 0h1"/></>,
  home: <><path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-7h6v7"/></>,
  utilities: <><path d="M9 17h6m-6 3h6M8 13a6 6 0 1 1 8 0c-1 1-1 2-1 4H9c0-2 0-3-1-4Z"/></>,
  software: <><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4m-3-9-2-2 2-2m6 4 2-2-2-2"/></>,
  gift: <><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z"/></>,
  family: <><circle cx="9" cy="7" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v2"/></>,
  transfer: <><path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4"/></>,
  income: <><path d="M12 20V4m-6 6 6-6 6 6"/></>,
  other: <><path d="M13 3H4v9l9 9 8-8-8-10Z"/><circle cx="8" cy="7" r="1"/></>,
};
const colors: Record<Kind, string> = {
  wallet: "bg-orange-500", bank: "bg-sky-500", design: "bg-pink-500", work: "bg-emerald-500", income: "bg-emerald-500", food: "bg-rose-500", shopping: "bg-rose-500", transport: "bg-blue-500", home: "bg-indigo-500", utilities: "bg-violet-600", software: "bg-sky-500", gift: "bg-pink-500", family: "bg-orange-500", transfer: "bg-violet-600", other: "bg-orange-500",
};
function categoryKind(name: string, income: boolean): Kind {
  if (/wallet|bkash|nagad|rocket/.test(name)) return "wallet";
  if (/bank|savings/.test(name)) return "bank";
  if (/website|development|laptop|macbook/.test(name)) return "software";
  if (/design|brand|menu|social|creative/.test(name)) return "design";
  if (/transfer|deposit/.test(name)) return "transfer";
  if (/food|dining|grocery|restaurant/.test(name)) return "food";
  if (/shopping|clothing/.test(name)) return "shopping";
  if (/transport|travel|fuel/.test(name)) return "transport";
  if (/rent|home|housing/.test(name)) return "home";
  if (/utilities|internet|electric|bill/.test(name)) return "utilities";
  if (/software|tools|subscription/.test(name)) return "software";
  if (/gift/.test(name)) return "gift";
  if (/family/.test(name)) return "family";
  if (/client|freelance|project|salary|earning/.test(name)) return "work";
  return income ? "income" : "other";
}

export default function CategoryIcon({ name, income = false, transfer = false, variant = "solid" }: { name?: string; income?: boolean; transfer?: boolean; variant?: "solid" | "soft" }) {
  const kind = transfer ? "transfer" : categoryKind((name ?? "").toLowerCase(), income);
  const softColors: Record<Kind, string> = { wallet: "bg-orange-500/10 text-orange-500", bank: "bg-sky-500/10 text-sky-500", design: "bg-pink-500/10 text-pink-500", work: "bg-pink-500/10 text-pink-500", income: "bg-emerald-500/10 text-emerald-600", food: "bg-rose-500/10 text-rose-500", shopping: "bg-rose-500/10 text-rose-500", transport: "bg-blue-500/10 text-blue-500", home: "bg-indigo-500/10 text-indigo-500", utilities: "bg-violet-500/10 text-violet-500", software: "bg-sky-500/10 text-sky-500", gift: "bg-pink-500/10 text-pink-500", family: "bg-orange-500/10 text-orange-500", transfer: "bg-violet-500/10 text-violet-500", other: "bg-orange-500/10 text-orange-500" };
  return <span aria-hidden="true" className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${variant === "soft" ? softColors[kind] : `text-white shadow-sm ${colors[kind]}`}`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">{artwork[kind]}</svg></span>;
}

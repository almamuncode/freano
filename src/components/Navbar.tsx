"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

type IconName = "home" | "earnings" | "activity" | "bank" | "wallet" | "loan" | "project" | "statement" | "settings" | "more" | "plus";
const paths: Record<IconName, React.ReactNode> = {
  home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></>, earnings: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/><path d="m3 6 5-3 5 4 7-5"/></>, activity: <><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h5M8 17h7"/></>,
  bank: <><path d="m3 9 9-5 9 5M5 10h14M6 10v8m4-8v8m4-8v8m4-8v8M3 20h18"/></>, wallet: <><path d="M4 6h14a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V7a3 3 0 0 1 3-3h12"/><path d="M15 12h5v4h-5a2 2 0 0 1 0-4Z"/></>,
  loan: <><circle cx="12" cy="12" r="9"/><path d="M8.5 9.5c0-1.2 1.2-2 3.2-2 1.8 0 3 .7 3 2s-1 1.8-3 2.2-3 1-3 2.4 0 1.3 1.3 2.2 3.4 2.2 1.8 0 3.2-.8 3.2-2.1M12 5.5v13"/></>, project: <><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6V4h8v2M3 11h18M10 14h4"/></>,
  statement: <><path d="M5 3h11l3 3v15H5z"/><path d="M16 3v4h4M8 11h8M8 15h8M8 19h5"/></>, settings: <><circle cx="12" cy="12" r="3"/><path d="M4 12a8 8 0 1 0 16 0 8 8 0 1 0-16 0M12 2v3M12 19v3M2 12h3M19 12h3"/></>,
  more: <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>, plus: <path d="M12 5v14M5 12h14"/>,
};
function Icon({ name, className = "h-[18px] w-[18px]" }: { name: IconName; className?: string }) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{paths[name]}</svg>; }

const mainLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "home" as IconName }, { href: "/earnings", label: "Earnings", icon: "earnings" as IconName }, { href: "/projects", label: "Projects", icon: "project" as IconName },
  { href: "/transactions", label: "Transactions", icon: "activity" as IconName },
  { href: "/bank", label: "Bank accounts", icon: "bank" as IconName }, { href: "/wallet", label: "Wallets", icon: "wallet" as IconName },
  { href: "/loans", label: "Loans", icon: "loan" as IconName },
  { href: "/statement", label: "Statements", icon: "statement" as IconName },
];

export default function Navbar() {
  const pathname = usePathname(); const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false); const [profileImage, setProfileImage] = useState<string | null>(null); const [darkMode, setDarkMode] = useState(false); const menuRef = useRef<HTMLDivElement>(null);
  const user = session?.user as { name?: string | null; email?: string | null; role?: string } | undefined; const initials = (user?.name || user?.email || "U").slice(0, 1).toUpperCase();
  const active = (href: string) => {
    if (href === "/transactions") return pathname === href || (pathname?.startsWith(`${href}/`) && !pathname.startsWith("/transactions/add"));
    return pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));
  };
  useEffect(() => { const saved = localStorage.getItem("freano-theme"); const enabled = saved === "dark"; setDarkMode(enabled); document.documentElement.classList.toggle("dark", enabled); }, []);
  const toggleTheme = () => setDarkMode((current) => { const next = !current; document.documentElement.classList.toggle("dark", next); localStorage.setItem("freano-theme", next ? "dark" : "light"); return next; });
  useEffect(() => { if (status !== "authenticated") return; const load = () => fetch("/api/profile", { cache: "no-store" }).then((r) => r.ok ? r.json() : null).then((d) => setProfileImage(d?.image ?? null)).catch(() => undefined); load(); window.addEventListener("profile-updated", load); return () => window.removeEventListener("profile-updated", load); }, [status]);
  useEffect(() => { const close = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);

  if (status === "authenticated" && pathname !== "/guest") return <>
    <aside className="app-sidebar fixed inset-y-0 left-0 z-50 hidden w-[250px] flex-col border-r border-white/10 bg-[#111714] px-4 py-5 text-white lg:flex">
      <Link href="/dashboard" className="mb-7 px-2"><img src="/icons/logo-dark.png" alt="Freano" className="w-32" /></Link>
      <nav className="space-y-1">{mainLinks.map((link) => <Link key={link.href} href={link.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${active(link.href) ? "bg-gradient-to-r from-[#448d3b] to-[#5cae42] text-white shadow-lg shadow-black/20" : "text-white/65 hover:bg-white/[0.06] hover:text-white"}`}><Icon name={link.icon}/>{link.label}</Link>)}</nav>
      <div className="mt-auto space-y-2"><Link href="/transactions/add" className="flex items-center justify-center gap-2 rounded-xl bg-[#78d94f] px-4 py-3 text-sm font-bold text-[#132014] hover:bg-[#89e662]"><Icon name="plus"/>Add transaction</Link><div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#65b84b] text-sm font-bold">{profileImage ? <img src={profileImage} alt="" className="h-full w-full object-cover"/> : initials}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{user?.name || "Your profile"}</p><p className="truncate text-[10px] text-white/45">{user?.email}</p></div><button onClick={() => signOut({ callbackUrl: "/login" })} title="Sign out" className="text-white/45 hover:text-white">↗</button></div></div></div>
    </aside>
    <header className="sticky top-0 z-40 border-b border-hairline bg-white/90 backdrop-blur-xl dark:bg-[#111714]/95 lg:ml-[250px]"><div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8"><Link href="/dashboard" className="lg:hidden"><img src={darkMode ? "/icons/logo-dark.png" : "/icons/logo.png"} alt="Freano" className="w-28"/></Link><p className="hidden text-sm font-semibold text-ink/55 lg:block">Your financial workspace</p><div className="relative flex items-center gap-2" ref={menuRef}><Link href="/transactions/add" className="hidden rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white sm:block">+ New transaction</Link><button onClick={toggleTheme} aria-label="Toggle color theme" className="flex h-9 w-9 items-center justify-center rounded-xl border border-hairline bg-white text-gray-600 dark:bg-[#202923]">{darkMode ? "☀" : "☾"}</button><button onClick={() => setMenuOpen(!menuOpen)} className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-[#18251b] text-xs font-bold text-white">{profileImage ? <img src={profileImage} alt="" className="h-full w-full object-cover"/> : initials}</button>{menuOpen && <div className="absolute right-0 top-11 w-56 rounded-2xl border border-hairline bg-white p-2 shadow-xl dark:bg-[#202923]"><div className="border-b border-hairline px-3 py-2"><p className="truncate text-sm font-semibold">{user?.name}</p><p className="truncate text-xs text-ink/50">{user?.email}</p></div><Link href="/profile" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-50">Profile</Link><Link href="/settings" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-50">Settings</Link>{user?.role === "ADMIN" && <Link href="/admin/users" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-50">Admin</Link>}<button onClick={() => signOut({ callbackUrl: "/login" })} className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">Sign out</button></div>}</div></div></header>
    <nav className="mobile-app-nav fixed inset-x-3 bottom-3 z-50 grid grid-cols-6 rounded-2xl border border-white/10 bg-[#111714]/95 p-1.5 text-white shadow-2xl backdrop-blur-xl lg:hidden">{[mainLinks[0], mainLinks[1], mainLinks[3], mainLinks[6]].map((link) => <Link key={link.href} href={link.href} className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] ${active(link.href) ? "bg-[#5cac43] text-white" : "text-white/55"}`}><Icon name={link.icon} className="h-5 w-5"/>{link.label.split(" ")[0]}</Link>)}<Link href="/transactions/add" className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] ${pathname === "/transactions/add" ? "bg-[#5cac43] text-white" : "text-white/55"}`}><Icon name="plus" className="h-5 w-5"/>Add</Link><Link href="/settings" className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] ${active("/settings") ? "bg-[#5cac43]" : "text-white/55"}`}><Icon name="more" className="h-5 w-5"/>More</Link></nav>
  </>;

  return <header className="sticky top-0 z-50 border-b border-hairline bg-white/85 backdrop-blur-xl dark:bg-[#111714]/90"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6"><Link href="/"><img src={darkMode ? "/icons/logo-dark.png" : "/icons/logo.png"} alt="Freano" className="w-28"/></Link><nav className="flex items-center gap-3"><button onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-xl border border-hairline">{darkMode ? "☀" : "☾"}</button>{status === "unauthenticated" && <><Link href="/login" className="hidden text-sm font-medium text-ink/60 sm:block">Log in</Link><Link href="/register" className="btn-primary">Get started</Link></>}</nav></div></header>;
}

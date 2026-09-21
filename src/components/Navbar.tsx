"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const logoHref = status === "authenticated" ? "/dashboard" : "/";
  const user = session?.user as { name?: string | null; email?: string | null; role?: string } | undefined;
  const initials = (user?.name || user?.email || "U").slice(0, 1).toUpperCase();
  const primaryLinks = [
    { href: "/dashboard", label: "Overview" },
    { href: "/transactions", label: "Activity" },
    { href: "/bank", label: "Accounts" },
  ];

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("freano-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const enabled = savedTheme ? savedTheme === "dark" : prefersDark;
    setDarkMode(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  const toggleTheme = () => {
    setDarkMode((current) => {
      const next = !current;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("freano-theme", next ? "dark" : "light");
      return next;
    });
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    const loadImage = () => {
      fetch("/api/profile", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => setProfileImage(data?.image ?? null))
        .catch(() => undefined);
    };
    loadImage();
    window.addEventListener("profile-updated", loadImage);
    return () => window.removeEventListener("profile-updated", loadImage);
  }, [status]);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/75 backdrop-blur-xl dark:border-hairline dark:bg-[#202329]/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href={logoHref} className="shrink-0" aria-label="Freano home">
          <img className="w-28 sm:w-32 dark:hidden" src="/logo.png" alt="Freano" />
          <img className="hidden w-28 sm:w-32 dark:block" src="/icons/logo-dark.png" alt="Freano" />
        </Link>

        <nav className="flex items-center gap-2 text-sm sm:gap-3">
          {status === "authenticated" && <div className="hidden items-center rounded-xl border border-hairline bg-white/70 p-1 dark:bg-[#202329] md:flex">
            {primaryLinks.map((link) => <Link key={link.href} href={link.href} className={`${pathname === link.href || (link.href !== "/dashboard" && pathname?.startsWith(link.href)) ? "bg-brand text-white shadow-sm" : "text-ink/60 hover:text-ink"} rounded-lg px-3 py-1.5 text-xs font-semibold`}>{link.label}</Link>)}
          </div>}
          <button type="button" onClick={toggleTheme} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} className="flex h-9 w-9 items-center justify-center rounded-xl border border-hairline bg-white/70 text-base text-gray-600 hover:text-brand dark:text-gray-300">
            {darkMode ? "☀" : "☾"}
          </button>
          {status === "authenticated" ? (
            <>
              <Link href="/dashboard" className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold md:hidden ${pathname === "/dashboard" ? "bg-brand/10 text-brand" : "text-ink/60 hover:text-brand"}`}>Home</Link>
              {(session.user as any)?.role === "ADMIN" && (
                <Link
                  href="/admin/users"
                  className={
                    pathname?.startsWith("/admin")
                      ? "text-brand font-semibold"
                      : "text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                  }
                >
                  Admin
                </Link>
              )}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  aria-label="Open profile menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-brand font-semibold text-white shadow-md shadow-brand/25 ring-2 ring-white"
                >
                  {profileImage ? <img src={profileImage} alt="" className="h-full w-full object-cover" /> : initials}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 z-[60] mt-3 w-56 rounded-2xl border border-hairline bg-white p-2 shadow-xl shadow-black/10 dark:bg-[#202329]">
                    <div className="border-b border-gray-100 px-3 py-2">
                      <p className="truncate font-medium text-ink">{user?.name || "Your profile"}</p>
                      <p className="truncate text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">Profile</Link>
                    <Link href="/settings" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">Settings</Link>
                    <Link href="/statement" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">Statement</Link>
                    <Link href="/transactions" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">Transactions</Link>
                    <Link href="/wallet" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">Wallets</Link>
                    <Link href="/loans" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">Loans</Link>
                    <Link href="/projects" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">Unpaid projects</Link>
                    <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50">Sign out</button>
                  </div>
                )}
              </div>
            </>
          ) : status === "unauthenticated" ? (
            <>
              <Link href="/login" className="hidden text-gray-500 hover:text-gray-800 sm:block">
                Log in
              </Link>
              <Link href="/register" className="btn-primary px-3 py-2 sm:px-4">
                Get started
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

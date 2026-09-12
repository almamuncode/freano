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
    <header className="border-b border-hairline bg-white/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href={logoHref} className="text-xl font-bold text-brand">
          <img className="w-36" src={darkMode ? "/icons/logo-dark.png" : "/logo.png"} alt="Freano" />
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <button type="button" onClick={toggleTheme} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} className="rounded-full border border-hairline px-3 py-1.5 text-base text-gray-600 hover:text-brand dark:text-gray-300">
            {darkMode ? "☀" : "☾"}
          </button>
          {status === "authenticated" ? (
            <>
              <Link href="/dashboard" className={pathname === "/dashboard" ? "text-brand font-semibold" : "text-gray-500 hover:text-gray-800"}>Dashboard</Link>
              {(session.user as any)?.role === "ADMIN" && (
                <Link
                  href="/admin/users"
                  className={
                    pathname?.startsWith("/admin")
                      ? "text-brand font-semibold"
                      : "text-gray-500 hover:text-gray-800"
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
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-brand font-semibold text-white ring-2 ring-white"
                >
                  {profileImage ? <img src={profileImage} alt="" className="h-full w-full object-cover" /> : initials}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                    <div className="border-b border-gray-100 px-3 py-2">
                      <p className="truncate font-medium text-ink">{user?.name || "Your profile"}</p>
                      <p className="truncate text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">Profile</Link>
                    <Link href="/settings" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">Settings</Link>
                    <Link href="/statement" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">Statement</Link>
                    <Link href="/transactions" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">Transactions</Link>
                    <Link href="/loans" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">Loans</Link>
                    <Link href="/projects" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">Unpaid projects</Link>
                    <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50">Sign out</button>
                  </div>
                )}
              </div>
            </>
          ) : status === "unauthenticated" ? (
            <>
              <Link href="/login" className="text-gray-500 hover:text-gray-800">
                Log in
              </Link>
              <Link href="/register" className="text-brand font-medium">
                Register
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

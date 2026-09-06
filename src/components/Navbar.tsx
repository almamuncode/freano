"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/transactions/add", label: "+ Add" },
  { href: "/statement", label: "Statement" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-brand">
          {/* Freano */}
          <img className="w-36" src="/logo.png" alt="" />
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {status === "authenticated" ? (
            <>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    pathname === link.href
                      ? "text-brand font-semibold"
                      : "text-gray-500 hover:text-gray-800"
                  }
                >
                  {link.label}
                </Link>
              ))}
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
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-gray-500 hover:text-gray-800"
              >
                Sign out
              </button>
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  const isUsers = pathname?.startsWith("/admin/users");

  return (
    <aside className="w-56 shrink-0 border-r border-hairline min-h-screen px-6 py-10">
      <div className="mb-12">
        <p className="font-ledger text-xl font-semibold tracking-tight text-ink">Freano</p>
        <p className="text-xs text-brass mt-0.5">Admin ledger</p>
      </div>

      <nav className="space-y-1 text-sm">
        <Link
          href="/admin/users"
          className={`block py-1.5 border-l-2 pl-3 -ml-px transition-colors ${
            isUsers
              ? "border-brass text-ink font-medium"
              : "border-transparent text-ink/60 hover:text-ink"
          }`}
        >
          Users
        </Link>
      </nav>

      <div className="mt-16 pt-4 border-t border-hairline text-xs text-ink/50">
        <p>Signed in as {userName}</p>
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-brass mt-1">
          Sign out
        </button>
      </div>
    </aside>
  );
}

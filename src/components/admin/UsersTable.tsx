"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Row = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  transactionCount: number;
  balance: number;
};

function money(amount: number) {
  return new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(amount);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function UsersTable({ initialUsers }: { initialUsers: Row[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, query]);

  async function patchUser(id: string, body: Record<string, unknown>) {
    setError("");
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
    } finally {
      setBusyId(null);
    }
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`Delete ${name} and all of their transactions? This can't be undone.`)) return;
    setError("");
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
          className="w-72 bg-transparent border-b border-hairline focus:border-brass outline-none py-1.5 text-sm placeholder:text-ink/40"
        />
      </div>

      {error && <p className="text-rust text-sm mb-4">{error}</p>}

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-xs text-ink/50 border-b border-hairline">
            <th className="font-medium py-2 pr-4">Person</th>
            <th className="font-medium py-2 pr-4">Joined</th>
            <th className="font-medium py-2 pr-4 text-right">Entries</th>
            <th className="font-medium py-2 pr-4 text-right">Balance</th>
            <th className="font-medium py-2 pr-4">Status</th>
            <th className="font-medium py-2"></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => (
            <tr key={u.id} className="border-b border-hairline/70 align-middle">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-ink text-paper text-xs font-ledger-mono">
                    {initials(u.name)}
                  </div>
                  <div>
                    <p className="text-ink font-medium leading-tight">
                      {u.name}
                      {u.role === "ADMIN" && (
                        <span className="ml-2 text-xs text-brass">admin</span>
                      )}
                    </p>
                    <p className="text-ink/50 text-xs leading-tight">{u.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 pr-4 font-ledger-mono text-ink/70 text-xs">
                {new Date(u.createdAt).toLocaleDateString("en-BD", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td className="py-3 pr-4 text-right font-ledger-mono tabular-nums text-ink/70">
                {u.transactionCount}
              </td>
              <td
                className={`py-3 pr-4 text-right font-ledger-mono tabular-nums ${
                  u.balance >= 0 ? "text-sage" : "text-rust"
                }`}
              >
                {money(u.balance)}
              </td>
              <td className="py-3 pr-4">
                {u.isActive ? (
                  <span className="text-sage text-xs">active</span>
                ) : (
                  <span className="text-rust text-xs">suspended</span>
                )}
              </td>
              <td className="py-3">
                <div className="flex gap-3 text-xs">
                  <button
                    disabled={busyId === u.id}
                    onClick={() =>
                      patchUser(u.id, { role: u.role === "ADMIN" ? "USER" : "ADMIN" })
                    }
                    className="text-ink/60 hover:text-ink underline decoration-hairline underline-offset-4 disabled:opacity-40"
                  >
                    {u.role === "ADMIN" ? "Remove admin" : "Make admin"}
                  </button>
                  <button
                    disabled={busyId === u.id}
                    onClick={() => patchUser(u.id, { isActive: !u.isActive })}
                    className="text-ink/60 hover:text-ink underline decoration-hairline underline-offset-4 disabled:opacity-40"
                  >
                    {u.isActive ? "Suspend" : "Reactivate"}
                  </button>
                  <button
                    disabled={busyId === u.id}
                    onClick={() => deleteUser(u.id, u.name)}
                    className="text-rust hover:text-rust/80 underline decoration-hairline underline-offset-4 disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <p className="text-ink/50 text-sm py-8 text-center">No one matches that search.</p>
      )}
    </div>
  );
}

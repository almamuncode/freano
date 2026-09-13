"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AccountRemovalButton({ account, id, returnTo }: { account: "bank" | "wallet"; id: string; returnTo: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState(false);
  async function remove() {
    if (!window.confirm(`Remove this ${account} and all of its activity? Its balance will be removed from your total.`)) return;
    setRemoving(true); setError("");
    try {
      const response = await fetch(`/api/${account}s/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? `Could not remove ${account}`);
      router.push(returnTo); router.refresh();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : `Could not remove ${account}`); } finally { setRemoving(false); }
  }
  return <div className="mt-4"><button type="button" onClick={remove} disabled={removing} className="text-sm font-semibold text-[#f3aaa0] disabled:opacity-60">{removing ? "Removing..." : `Remove ${account}`}</button>{error && <p className="mt-2 text-sm text-[#f3aaa0]">{error}</p>}</div>;
}
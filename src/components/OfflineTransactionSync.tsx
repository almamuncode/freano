"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getQueuedTransactions, QUEUE_CHANGED_EVENT, syncQueuedTransactions } from "@/lib/offline-transactions";
import { showToast } from "@/lib/toast";

export default function OfflineTransactionSync() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const ownerId = (session?.user as { id?: string } | undefined)?.id;
  const [pending, setPending] = useState(0);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const refreshCount = useCallback(async () => {
    if (!ownerId) return setPending(0);
    setPending((await getQueuedTransactions(ownerId)).length);
  }, [ownerId]);

  const sync = useCallback(async (notify = false) => {
    if (!ownerId || !navigator.onLine) return;
    setSyncing(true);
    const result = await syncQueuedTransactions(ownerId);
    setPending(result.remaining);
    setSyncing(false);
    if (result.synced) {
      if (notify) showToast(`${result.synced} offline transaction${result.synced === 1 ? "" : "s"} synced`);
      router.refresh();
    }
  }, [ownerId, router]);

  useEffect(() => {
    setOnline(navigator.onLine);
    refreshCount();
    if (status === "authenticated") sync();

    const handleOnline = () => { setOnline(true); sync(true); };
    const handleOffline = () => setOnline(false);
    const handleFocus = () => { sync(); };
    const handleVisible = () => { if (document.visibilityState === "visible") sync(); };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("focus", handleFocus);
    window.addEventListener(QUEUE_CHANGED_EVENT, refreshCount);
    document.addEventListener("visibilitychange", handleVisible);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener(QUEUE_CHANGED_EVENT, refreshCount);
      document.removeEventListener("visibilitychange", handleVisible);
    };
  }, [refreshCount, status, sync]);

  if (status !== "authenticated" || (online && pending === 0)) return null;

  return (
    <div className="fixed inset-x-3 bottom-24 z-[60] mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl border border-[#d9c58e] bg-[#fff9e8] px-4 py-3 text-sm shadow-xl lg:bottom-5">
      <div>
        <p className="font-semibold text-ink">{online ? `${pending} transaction${pending === 1 ? "" : "s"} waiting to sync` : "You are offline"}</p>
        <p className="text-xs text-ink/55">{pending ? "Saved safely on this device." : "New transactions will be saved on this device."}</p>
      </div>
      {online && pending > 0 && <button type="button" onClick={() => sync(true)} disabled={syncing} className="shrink-0 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">{syncing ? "Syncing..." : "Sync now"}</button>}
    </div>
  );
}

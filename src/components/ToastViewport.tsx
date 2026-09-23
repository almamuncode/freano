"use client";

import { useEffect, useRef, useState } from "react";
import type { ToastKind } from "@/lib/toast";

type Toast = { id: number; message: string; kind: ToastKind };

export default function ToastViewport() {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<number>();

  useEffect(() => {
    const show = (event: Event) => {
      const { message, kind } = (event as CustomEvent<{ message: string; kind: ToastKind }>).detail;
      window.clearTimeout(timer.current);
      setToast({ id: Date.now(), message, kind });
      timer.current = window.setTimeout(() => setToast(null), 2100);
    };

    window.addEventListener("freano-toast", show);
    return () => {
      window.removeEventListener("freano-toast", show);
      window.clearTimeout(timer.current);
    };
  }, []);

  if (!toast) return null;

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      <div key={toast.id} className={`mini-toast mini-toast-${toast.kind}`} role="status">
        <span className="mini-toast-icon">{toast.kind === "success" ? "✓" : "!"}</span>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function ServiceWorkerRegister() {
  const { status } = useSession();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => registration.unregister());
        });
      }
      if ("caches" in window) {
        caches.keys().then((keys) => {
          keys.filter((key) => key.startsWith("freano-")).forEach((key) => caches.delete(key));
        });
      }
      return;
    }

    const handleInstallAvailable = (event: Event) => {
      event.preventDefault();
      (window as Window & { freanoInstallEvent?: Event }).freanoInstallEvent = event;
      window.dispatchEvent(new Event("freano-install-available"));
    };

    window.addEventListener("beforeinstallprompt", handleInstallAvailable);
    const handleWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === "OFFLINE_TRANSACTIONS_SYNCED") {
        window.dispatchEvent(new Event("freano-offline-queue-changed"));
      }
    };
    navigator.serviceWorker?.addEventListener("message", handleWorkerMessage);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(async (registration) => {
        if (status === "authenticated") {
          const readyRegistration = await navigator.serviceWorker.ready;
          readyRegistration.active?.postMessage({ type: "CACHE_TRANSACTION_FORM" });
        } else if (status === "unauthenticated" && navigator.onLine) {
          registration.active?.postMessage({ type: "CLEAR_PRIVATE_CACHE" });
        }
      }).catch((err) => {
        console.error("Service worker registration failed:", err);
      });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallAvailable);
      navigator.serviceWorker?.removeEventListener("message", handleWorkerMessage);
    };
  }, [status]);

  return null;
}

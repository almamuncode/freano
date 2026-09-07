"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    const handleInstallAvailable = (event: Event) => {
      event.preventDefault();
      (window as Window & { freanoInstallEvent?: Event }).freanoInstallEvent = event;
      window.dispatchEvent(new Event("freano-install-available"));
    };

    window.addEventListener("beforeinstallprompt", handleInstallAvailable);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service worker registration failed:", err);
      });
    }

    return () => window.removeEventListener("beforeinstallprompt", handleInstallAvailable);
  }, []);

  return null;
}

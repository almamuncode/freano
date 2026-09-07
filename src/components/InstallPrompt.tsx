"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const pathname = usePathname();
  const { status } = useSession();
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);

  useEffect(() => {
    if (pathname !== "/" || status !== "unauthenticated") return;

    const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone;
    if (!standalone) setVisible(true);

    const handleInstallAvailable = (event: Event) => {
      setInstallEvent(event as InstallPromptEvent);
      setVisible(true);
    };
    const savedInstallEvent = (window as Window & { freanoInstallEvent?: Event }).freanoInstallEvent;
    if (savedInstallEvent) handleInstallAvailable(savedInstallEvent);
    window.addEventListener("beforeinstallprompt", handleInstallAvailable);
    window.addEventListener("freano-install-available", () => handleInstallAvailable((window as Window & { freanoInstallEvent?: Event }).freanoInstallEvent!));
    return () => window.removeEventListener("beforeinstallprompt", handleInstallAvailable);
  }, [pathname, status]);

  if (!visible) return null;

  async function installApp() {
    if (!installEvent) {
      setHelpVisible(true);
      return;
    }
    await installEvent!.prompt();
    await installEvent!.userChoice;
    setInstallEvent(null);
    setVisible(false);
  }

  return (
    <div className="fixed bottom-5 right-5 z-30 max-w-[calc(100vw-2rem)] rounded-2xl border border-brand/20 bg-white p-2 pl-4 text-sm font-semibold text-ink shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:text-white">
      <div className="flex items-center gap-2">
        <span>Add to Home</span>
        <button type="button" onClick={installApp} className="rounded-full bg-brand px-3 py-1.5 text-white hover:bg-brand-dark">Add</button>
        <button type="button" aria-label="Dismiss install prompt" onClick={() => setVisible(false)} className="px-1 text-gray-400 hover:text-gray-700 dark:hover:text-white">×</button>
      </div>
      {helpVisible && <p className="max-w-xs px-2 pb-1 pt-2 text-xs font-normal text-gray-500">Open your browser menu and choose &quot;Add to Home Screen&quot;.</p>}
    </div>
  );
}
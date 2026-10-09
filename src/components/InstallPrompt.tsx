"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const { status } = useSession();
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    const standalone = window.matchMedia("(display-mode: standalone)").matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    if (standalone || window.localStorage.getItem("freano-installed") === "true") return;

    setIsIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent));
    setVisible(true);
    setExpanded(window.localStorage.getItem("freano-install-intro-seen") !== "true");
    const handleInstallAvailable = (event: Event) => { setInstallEvent(event as InstallPromptEvent); setVisible(true); };
    const handleCustomInstall = () => {
      const saved = (window as Window & { freanoInstallEvent?: Event }).freanoInstallEvent;
      if (saved) handleInstallAvailable(saved);
    };
    const saved = (window as Window & { freanoInstallEvent?: Event }).freanoInstallEvent;
    if (saved) handleInstallAvailable(saved);
    const handleInstalled = () => { window.localStorage.setItem("freano-installed", "true"); setVisible(false); };
    window.addEventListener("beforeinstallprompt", handleInstallAvailable);
    window.addEventListener("freano-install-available", handleCustomInstall);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallAvailable);
      window.removeEventListener("freano-install-available", handleCustomInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, [status]);

  if (!visible) return null;

  async function installApp() {
    if (!installEvent) { setHelpVisible(true); return; }
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      window.localStorage.setItem("freano-installed", "true");
      setVisible(false);
    } else {
      setExpanded(false);
    }
    setInstallEvent(null);
  }

  function collapse() {
    window.localStorage.setItem("freano-install-intro-seen", "true");
    setHelpVisible(false);
    setExpanded(false);
  }

  if (!expanded) return (
    <button type="button" onClick={() => setExpanded(true)} className="fixed bottom-24 right-4 z-[60] rounded-2xl border border-white/15 bg-[#291268] p-1.5 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl lg:bottom-5" aria-label="Install Freano" title="Install Freano">
      <img src="/icons/freano-app.png" alt="" className="h-10 w-10 rounded-xl" />
    </button>
  );

  return (
    <aside className="fixed inset-x-3 bottom-24 z-[60] mx-auto max-w-xs rounded-2xl border border-white/10 bg-[#291268]/95 p-3 text-white shadow-2xl backdrop-blur-xl lg:inset-x-auto lg:bottom-5 lg:right-5 lg:mx-0" aria-label="Install Freano">
      <div className="flex items-center gap-3">
        <img src="/icons/freano-app.png" alt="" className="h-11 w-11 rounded-xl" />
        <div className="min-w-0 flex-1"><p className="text-sm font-bold">Keep Freano on your home screen</p><p className="mt-0.5 text-[11px] text-white/55">Open your finances faster, like a regular app.</p></div>
        <button type="button" aria-label="Collapse install prompt" onClick={collapse} className="self-start px-1 text-xl leading-none text-white/45 hover:text-white">×</button>
      </div>
      <button type="button" onClick={installApp} className="mt-3 w-full rounded-xl bg-[#ff8038] px-4 py-2.5 text-sm font-bold text-[#ffffff] hover:bg-[#ff995c]">{installEvent ? "Install Freano" : "Show install steps"}</button>
      {helpVisible && <p className="mt-2 rounded-lg bg-white/[0.06] px-3 py-2 text-xs font-normal leading-5 text-white/70">{isIos ? "Tap the Share button in Safari, then choose “Add to Home Screen”." : "Open your browser menu and choose “Install app” or “Add to Home screen”."}</p>}
    </aside>
  );
}

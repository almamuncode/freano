"use client";

import { useEffect, useState } from "react";

export default function AppLaunch() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 850);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="app-launch" aria-hidden="true">
      <div className="app-launch-mark">
        <img src="/icons/logo.png" alt="" />
        <span />
      </div>
    </div>
  );
}

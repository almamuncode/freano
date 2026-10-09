import type { ReactNode } from "react";

export default function StatusBadge({ tone, children }: { tone: "green" | "blue" | "orange" | "pink" | "purple"; children: ReactNode }) {
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}

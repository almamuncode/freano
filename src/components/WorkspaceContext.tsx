"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";

export type Workspace = {
  request: (url: string, init?: RequestInit) => Promise<Response>;
  push: (path: string) => void;
  refresh: () => void;
};
export const WorkspaceContext = createContext<Workspace | null>(null);

// Account pages keep using the authenticated API; guest forms use a local adapter.
export function useWorkspace() {
  const guest = useContext(WorkspaceContext);
  const router = useRouter();
  return guest ?? { request: (url: string, init?: RequestInit) => fetch(url, init), push: router.push, refresh: router.refresh };
}

export function WorkspaceLink(props: React.ComponentProps<typeof NextLink>) {
  const guest = useContext(WorkspaceContext);
  if (!guest || typeof props.href !== "string") return <NextLink {...props} />;
  const path = props.href;
  return <a {...props as React.AnchorHTMLAttributes<HTMLAnchorElement>} href={`/guest#${encodeURIComponent(path)}`} onClick={(event) => {
    props.onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); guest.push(path);
  }} />;
}

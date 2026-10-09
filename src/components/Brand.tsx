import Link from "next/link";

export default function Brand({ href = "/", inverse = false, primary = false }: { href?: string; inverse?: boolean; primary?: boolean }) {
  return <Link href={href} aria-label="Freano home" className="inline-flex items-center gap-2.5">
    <img src={primary ? "/icons/freano-app.png" : "/icons/freano-mark.png"} alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-xl" />
    <span className={`text-2xl font-bold tracking-tight ${inverse ? "text-white" : "text-brand dark:text-white"}`}>freano<span className="text-[#ff8038]">.</span></span>
  </Link>;
}

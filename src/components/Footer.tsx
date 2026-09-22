import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: "f" },
  { label: "Instagram", href: "https://instagram.com", icon: "◎" },
  { label: "LinkedIn", href: "https://linkedin.com", icon: "in" },
  { label: "X", href: "https://x.com", icon: "𝕏" },
];

export default async function Footer() {
  const isAuthenticated = Boolean((await getServerSession(authOptions))?.user);
  const homeHref = isAuthenticated ? "/dashboard" : "/";

  return (
    <footer className="border-t border-hairline bg-white text-ink dark:bg-[#1d1d1f] dark:text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 py-5 text-center sm:justify-between sm:px-6 sm:text-left">
        <div className="order-1">
          <Link href={homeHref} className="inline-block" aria-label="Freano home">
            <img src="/icons/logo.png" alt="Freano" className="w-28 dark:hidden" />
            <img src="/icons/logo-dark.png" alt="Freano" className="hidden w-28 dark:block" />
          </Link>
        </div>

        <nav className="order-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-ink/60 dark:text-white/70 sm:order-2">
            <Link href={homeHref} className="hover:text-ink dark:hover:text-white">Home</Link>
            <Link href="/about" className="hover:text-ink dark:hover:text-white">About us</Link>
            <Link href="/contact" className="hover:text-ink dark:hover:text-white">Contact us</Link>
            {!isAuthenticated && <Link href="/login" className="hover:text-ink dark:hover:text-white">Log in</Link>}
            {!isAuthenticated && <Link href="/register" className="hover:text-ink dark:hover:text-white">Create an account</Link>}
        </nav>

        <div className="order-2 flex items-center gap-2 sm:order-3">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              aria-label={social.label}
              title={social.label}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-xs font-semibold text-ink/70 transition-colors hover:border-brass hover:text-brass dark:border-white/20 dark:text-white/80"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>
      <div className="border-t border-hairline dark:border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-2 text-center text-[11px] text-ink/45 dark:text-white/45 sm:px-6 sm:text-left">
          © {new Date().getFullYear()} Freano. Built for independent work.
        </div>
      </div>
    </footer>
  );
}

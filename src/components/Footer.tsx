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
    <footer className="border-t border-hairline bg-[#20283a] text-white">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-6">
        <div className="text-center sm:text-left">
          <Link href={homeHref} className="inline-block" aria-label="Freano home">
            <img src="/icons/logo-dark.png" alt="Freano" className="w-36" />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/65">
            A calmer way for independent workers to understand their money and move forward with confidence.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 sm:justify-start">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                title={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-sm font-semibold text-white/80 transition-colors hover:border-brass hover:text-brass"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="text-center sm:text-left">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-brass">Explore</h2>
          <nav className="mt-4 flex flex-col items-center gap-3 text-sm text-white/70 sm:items-start">
            <Link href={homeHref} className="hover:text-white">Home</Link>
            <Link href="/about" className="hover:text-white">About us</Link>
            <Link href="/contact" className="hover:text-white">Contact us</Link>
            {!isAuthenticated && <Link href="/login" className="hover:text-white">Log in</Link>}
            {!isAuthenticated && <Link href="/register" className="hover:text-white">Create an account</Link>}
          </nav>
        </div>

        <div className="text-center sm:text-left">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-brass">Get in touch</h2>
          <p className="mt-4 text-sm leading-6 text-white/70">Have a question or an idea? We would love to hear from you.</p>
          <a href="mailto:mail@almamuncool.com" className="mt-4 inline-block text-sm font-medium text-white hover:text-brass">
            mail@almamuncool.com
          </a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-4 text-xs text-white/45 sm:px-6">
          © {new Date().getFullYear()} Freano. Built for independent work.
        </div>
      </div>
    </footer>
  );
}
import Link from "next/link";

export default function AuthShell({ children, register = false }: { children: React.ReactNode; register?: boolean }) {
  return <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[32px] border border-hairline bg-white shadow-[0_24px_80px_rgba(67,32,187,0.09)] dark:bg-[#211a35] lg:grid-cols-[0.9fr_1.1fr]">
    <aside className="auth-art relative flex flex-col justify-between overflow-hidden p-7 text-white sm:p-10">
      <div className="relative z-10"><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">A little clarity. A lot of possibility.</span>
        <h2 className="mt-10 max-w-sm text-4xl font-bold leading-tight tracking-tight !text-white sm:text-5xl">Make room for<br />your next <span className="text-[#ffb588]">big thing.</span></h2>
        <p className="mt-5 max-w-xs text-sm leading-7 text-white/75">Your earnings, everyday spending, and future plans. All together in a space that feels like you.</p>
      </div>
      <div aria-hidden="true" className="relative z-10 my-10 hidden space-y-3 lg:block">
        <div className="rotate-[-4deg] rounded-3xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur"><div className="flex items-center justify-between"><span className="text-sm text-white/75">Your money, in focus</span><img src="/icons/Icon3.png" alt="" className="h-10 w-10 rounded-xl" /></div><p className="mt-5 text-3xl font-bold">More clarity.</p><div className="mt-5 flex h-16 items-end gap-3">{[35,60,45,80,65,95,75].map((height, index) => <span key={index} className={`flex-1 rounded-t-lg ${index === 5 ? "bg-[#ff8038]" : "bg-white/30"}`} style={{ height: `${height}%` }} />)}</div></div>
        <div className="relative ml-8 rotate-[3deg] rounded-2xl bg-[#ff8038] p-4 text-sm font-semibold shadow-xl">Less guesswork. More peace of mind. ↗</div>
      </div>
      <p className="relative z-10 mt-6 text-xs text-white/60">Built for independent work. Designed for everyday life.</p>
    </aside>
    <section className="p-6 sm:p-10"><p className="page-kicker">{register ? "Your fresh start" : "Welcome back"}</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{register ? "Create your account" : "Good to see you again."}</h1><p className="mb-7 mt-2 text-sm text-ink/60">{register ? "Bring your money together. Take the next step." : "Let’s pick up where you left off."}</p>{children}
      <div className="mt-6 border-t border-hairline pt-5 text-center"><Link href="/guest" className="btn-secondary w-full">Explore as a guest →</Link><p className="mt-3 text-xs leading-5 text-ink/55">Try Freano without an account. Guest data clears when you leave or refresh.</p></div>
    </section>
  </div>;
}

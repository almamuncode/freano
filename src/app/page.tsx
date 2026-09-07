import Link from "next/link";

export default function Home() {
  return (
    <div className="landing-page -mx-4 -mt-6 overflow-hidden">
      <section className="landing-hero relative border-b border-hairline px-6 pb-16 pt-14 sm:px-10 sm:pt-20">
        <div className="absolute right-[-5rem] top-[-6rem] h-64 w-64 rounded-full border-[24px] border-brand/10 sm:right-10 sm:top-[-8rem] sm:h-96 sm:w-96" />
        <div className="relative mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-brass">
              <span className="h-px w-8 bg-brass" />
              The freelancer&apos;s ledger
            </div>
            <h1 className="max-w-2xl text-5xl font-bold leading-[0.98] tracking-tight text-ink sm:text-7xl">
              Your work is personal. Your money should be clear.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-ink/65 sm:text-lg">
              Freano brings income, family costs, and business expenses into one
              calm, honest view, so you always know where your next taka is going.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="rounded-lg bg-brand px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand/20 transition-transform hover:-translate-y-0.5 hover:bg-brand-dark"
              >
                Start your ledger <span aria-hidden="true">-&gt;</span>
              </Link>
              <Link href="/login" className="font-semibold text-ink/70 hover:text-brand">
                I already have an account
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-3 text-sm text-ink/55">
              <span className="flex -space-x-2" aria-hidden="true">
                <span className="h-7 w-7 rounded-full border-2 border-[#f7f3e9] bg-[#d8b08c]" />
                <span className="h-7 w-7 rounded-full border-2 border-[#f7f3e9] bg-[#91a88e]" />
                <span className="h-7 w-7 rounded-full border-2 border-[#f7f3e9] bg-[#b6a2c7]" />
              </span>
              Made for independent work, wherever it takes you.
            </div>
          </div>

          <div className="landing-card relative mx-auto w-full max-w-md rotate-1 rounded-xl border border-hairline p-5 shadow-[0_22px_60px_rgba(32,41,58,0.14)] sm:p-7">
            <div className="flex items-start justify-between border-b border-hairline pb-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">One clear view</p>
                <h2 className="mt-2 text-2xl font-bold text-ink">Your money, organized.</h2>
              </div>
              <span className="text-2xl text-brand" aria-hidden="true">+</span>
            </div>
            <div className="space-y-3 py-6">
              <div className="landing-row flex items-center gap-4 rounded-lg p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dfeee0] text-sage">+</span>
                <div><p className="text-sm font-semibold text-ink">Income</p><p className="text-xs text-ink/50">Client work and retainers</p></div>
              </div>
              <div className="landing-row flex items-center gap-4 rounded-lg p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3ded8] text-rust">-</span>
                <div><p className="text-sm font-semibold text-ink">Expenses</p><p className="text-xs text-ink/50">Business and everyday costs</p></div>
              </div>
              <div className="landing-row flex items-center gap-4 rounded-lg p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eee4ce] text-brass">*</span>
                <div><p className="text-sm font-semibold text-ink">Life categories</p><p className="text-xs text-ink/50">Personal, family, and more</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-6 py-12 sm:grid-cols-3 sm:px-10 sm:py-16">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand">01 / Capture</p>
          <h2 className="text-xl font-bold text-ink">Every taka has a place.</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">Log income and spending in seconds, with categories that match real life.</p>
        </div>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand">02 / Understand</p>
          <h2 className="text-xl font-bold text-ink">See the whole picture.</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">Separate personal, family, and business money without losing the thread.</p>
        </div>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand">03 / Move forward</p>
          <h2 className="text-xl font-bold text-ink">Make calmer decisions.</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">A simple statement gives you confidence for the month ahead.</p>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <div className="landing-page -mx-4 -mt-6 overflow-hidden">
      <section className="landing-hero relative border-b border-hairline px-6 pb-20 pt-16 sm:px-10 sm:pt-24">
        <div className="absolute right-[-5rem] top-[-6rem] h-64 w-64 rounded-full border-[24px] border-brand/10 sm:right-10 sm:top-[-8rem] sm:h-96 sm:w-96" />
        <div className="absolute bottom-0 left-[12%] h-40 w-40 rounded-full bg-brand/[0.07] blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-brand/15 bg-white/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Built for independent work
            </div>
            <h1 className="max-w-2xl text-5xl font-bold leading-[0.98] tracking-tight text-ink sm:text-7xl">
              Your money.<br />Your freedom.<br /><span className="text-brand">Your next chapter.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-ink/65 sm:text-lg">
              Freano brings income, family costs, and business expenses into one
              calm, honest view, so you always know where your next taka is going.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
              className="btn-primary px-6 py-3.5"
              >
                Find your flow <span aria-hidden="true">-&gt;</span>
              </Link>
              <Link href="/guest" className="rounded-xl border border-brand/30 px-5 py-3 font-semibold text-brand">Try as guest</Link>
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

          <div className="landing-card relative mx-auto w-full max-w-md rotate-1 rounded-3xl border border-white/80 p-5 shadow-[0_26px_70px_rgba(32,41,58,0.16)] sm:p-7">
            <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#4320bb,#7348ef)] p-6 text-white">
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border-[32px] border-white/10" />
              <div className="relative flex items-center justify-between"><span className="text-sm text-white/75">Your total balance</span><img src="/icons/Icon3.png" alt="" className="h-10 w-10 rounded-xl" /></div>
              <p className="relative mt-7 text-4xl font-bold tracking-tight">৳25,400<span className="text-xl font-medium text-white/60">.00</span></p>
              <div className="relative mt-6 flex gap-3 text-xs"><span className="rounded-full bg-white/15 px-3 py-2">↗ Income <b className="ml-1">৳32,500</b></span><span className="rounded-full bg-[#ff8038] px-3 py-2">↘ Expenses <b className="ml-1">৳7,100</b></span></div>
              <svg viewBox="0 0 320 90" className="relative mt-5 w-full" aria-hidden="true"><defs><linearGradient id="preview-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="white" stopOpacity=".25"/><stop offset="100%" stopColor="white" stopOpacity="0"/></linearGradient></defs><path d="M0 70 C30 75 35 20 65 30 S110 80 145 40 S195 60 225 25 S275 40 320 5 V90 H0Z" fill="url(#preview-fill)"/><path d="M0 70 C30 75 35 20 65 30 S110 80 145 40 S195 60 225 25 S275 40 320 5" fill="none" stroke="white" strokeWidth="3"/><path d="M0 80 C40 40 60 65 90 55 S160 80 200 65 S270 80 320 50" fill="none" stroke="#ffb588" strokeWidth="2.5"/></svg>
            </div>
            <div className="mb-3 mt-6 flex justify-between"><h2 className="text-base font-bold">A little more organized.</h2><span className="text-xs text-ink/45">Preview</span></div>
            <div className="space-y-3">
              {[{ label: "Client income", detail: "Every project, every payout", icon: "↗", color: "bg-[#eee8ff] text-brand" }, { label: "Everyday spending", detail: "Know where your money goes", icon: "↘", color: "bg-[#ffede3] text-rust" }, { label: "Your next big goal", detail: "Make space for what matters", icon: "✧", color: "bg-[#e7f6f9] text-[#287f94]" }].map((item) => <div key={item.label} className="landing-row flex items-center gap-3 rounded-2xl p-3"><span className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${item.color}`}>{item.icon}</span><div><p className="text-sm font-semibold">{item.label}</p><p className="mt-0.5 text-xs text-ink/50">{item.detail}</p></div><span className="ml-auto text-ink/30">→</span></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 py-12 sm:grid-cols-3 sm:px-10 sm:py-16">
        <div className="rounded-2xl border border-white bg-white/60 p-5 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand">01 / Capture</p>
          <h2 className="text-xl font-bold text-ink">Every taka has a place.</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">Log income and spending in seconds, with categories that match real life.</p>
        </div>
        <div className="rounded-2xl border border-white bg-white/60 p-5 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand">02 / Understand</p>
          <h2 className="text-xl font-bold text-ink">See the whole picture.</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">Separate personal, family, and business money without losing the thread.</p>
        </div>
        <div className="rounded-2xl border border-white bg-white/60 p-5 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand">03 / Move forward</p>
          <h2 className="text-xl font-bold text-ink">Make calmer decisions.</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">A simple statement gives you confidence for the month ahead.</p>
        </div>
      </section>
    </div>
  );
}

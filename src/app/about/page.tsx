import Link from "next/link";

export const metadata = {
  title: "About Freano",
  description: "Learn why Freano exists and how it helps freelancers manage money with clarity.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl py-10 sm:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brass">About Freano</p>
      <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight text-ink sm:text-6xl">Money management that understands independent work.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/65">Freano was made for freelancers, creators, and independent professionals whose income and expenses do not fit into neat monthly boxes.</p>

      <div className="mt-12 grid gap-8 border-t border-hairline pt-10 sm:grid-cols-2">
        <section>
          <h2 className="text-xl font-bold text-ink">A clear view of real life</h2>
          <p className="mt-3 leading-7 text-ink/65">Track client income, business costs, family support, and everyday spending together, without losing the detail that makes each category useful.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-ink">Built for calmer decisions</h2>
          <p className="mt-3 leading-7 text-ink/65">Freano turns scattered transactions into a simple picture you can use to plan your next month, project, or move.</p>
        </section>
      </div>

      <div className="mt-12 rounded-2xl bg-brand px-6 py-8 text-white sm:px-10">
        <h2 className="text-2xl font-bold">Ready to make your money clearer?</h2>
        <p className="mt-2 max-w-xl text-white/75">Start with a simple ledger and build a system that fits the way you actually work.</p>
        <Link href="/register" className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-brand hover:bg-[#f5f2eb]">Create your account</Link>
      </div>
    </div>
  );
}
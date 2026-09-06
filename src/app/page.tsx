import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-brand mb-4">Freano</h1>
      <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
        Money management built for freelancers. Track every taka you earn and
        spend — personal, family, or business — and see your full statement
        anytime.
      </p>
      <div className="flex gap-4 justify-center">
        <Link href="/register" className="bg-brand text-white px-6 py-3 rounded-lg font-medium">
          Get Started
        </Link>
        <Link href="/login" className="border border-brand text-brand px-6 py-3 rounded-lg font-medium">
          Log In
        </Link>
      </div>
    </div>
  );
}

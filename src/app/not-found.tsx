import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md rounded-2xl border border-hairline bg-white p-8 text-center shadow-sm">
        <h1 className="text-4xl font-bold text-ink">404</h1>
        <p className="mt-3 text-sm text-gray-600">This page could not be found.</p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}

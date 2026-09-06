'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink antialiased">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-ink">Something went wrong</h2>
            <p className="mt-3 text-sm text-gray-600">
              {error.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => reset()}
              className="mt-6 inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

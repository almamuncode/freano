"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setResetUrl("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to create reset link");
      setMessage(data.message);
      setResetUrl(data.resetUrl ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create reset link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <h1 className="mb-2 text-center text-2xl font-bold">Forgot password?</h1>
      <p className="mb-6 text-center text-sm text-gray-600">Enter your account email to create a password reset link.</p>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow">
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
        {error && <p className="text-sm text-expense">{error}</p>}
        {message && <p className="text-sm text-income">{message}</p>}
        {resetUrl && <a href={resetUrl} className="block break-all rounded-lg bg-amber-50 p-3 text-xs text-amber-800 underline">Open development reset link</a>}
        <button disabled={loading} className="w-full rounded-lg bg-brand py-2 font-medium text-white disabled:opacity-60">{loading ? "Creating link..." : "Create reset link"}</button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500"><Link href="/login" className="text-brand">Back to login</Link></p>
    </div>
  );
}

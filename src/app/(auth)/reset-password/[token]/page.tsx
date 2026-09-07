"use client";

import Link from "next/link";
import { useState } from "react";

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.token, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to reset password");
      setMessage(data.message);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <h1 className="mb-2 text-center text-2xl font-bold">Set a new password</h1>
      <p className="mb-6 text-center text-sm text-gray-600">Choose a new password for your Freano account.</p>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow">
        <input type="password" required minLength={6} placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
        <input type="password" required minLength={6} placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
        {error && <p className="text-sm text-expense">{error}</p>}
        {message && <p className="text-sm text-income">{message} <Link href="/login" className="underline">Log in</Link></p>}
        <button disabled={loading} className="w-full rounded-lg bg-brand py-2 font-medium text-white disabled:opacity-60">{loading ? "Updating..." : "Update password"}</button>
      </form>
    </div>
  );
}

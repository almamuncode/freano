"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setMessage(data.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-2 text-center">Forgot Password</h1>
      <p className="text-sm text-gray-500 text-center mb-6">
        Enter your email and we'll send you a link to reset it.
      </p>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />
        {error && <p className="text-expense text-sm">{error}</p>}
        {message && <p className="text-income text-sm">{message}</p>}
        <button
          disabled={loading}
          className="w-full bg-brand text-white py-2 rounded-lg font-medium disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        <Link href="/login" className="text-brand">Back to log in</Link>
      </p>
    </div>
  );
}

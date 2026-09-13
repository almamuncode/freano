"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Log In</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-gray-600">Email</label>
          <input
            id="email"
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div className="-mt-2 text-right">
          <Link href="/forgot-password" className="text-sm text-brand hover:underline">Forgot password?</Link>
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-gray-600">Password</label>
          <input
            id="password"
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        {error && <p className="text-expense text-sm">{error}</p>}
        <button className="w-full bg-brand text-white py-2 rounded-lg font-medium">
          Log In
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        No account? <Link href="/register" className="text-brand">Register</Link>
      </p>
    </div>
  );
}

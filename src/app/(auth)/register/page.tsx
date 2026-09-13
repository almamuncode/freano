"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profession, setProfession] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, profession, currentCity, dateOfBirth, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.toString() ?? "Registration failed");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm text-gray-600">Full name</label>
          <input
            id="name"
            type="text"
            required
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
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
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm text-gray-600">Phone number</label>
          <input
            id="phone"
            type="tel"
            required
            pattern="(?:01[3-9][0-9]{8}|\+8801[3-9][0-9]{8}|008801[3-9][0-9]{8})"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="profession" className="mb-1 block text-sm text-gray-600">Profession (optional)</label>
          <input
            id="profession"
            type="text"
            placeholder="Profession (optional)"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="current-city" className="mb-1 block text-sm text-gray-600">Current city (optional)</label>
          <input
            id="current-city"
            type="text"
            placeholder="Current city (optional)"
            value={currentCity}
            onChange={(e) => setCurrentCity(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="date-of-birth" className="mb-1 block text-sm text-gray-600">
            Date of birth
          </label>
          <input
            id="date-of-birth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-gray-600">Password (min 6 chars)</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        {error && <p className="text-expense text-sm">{error}</p>}
        <button className="w-full bg-brand text-white py-2 rounded-lg font-medium">
          Register
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        Already have an account? <Link href="/login" className="text-brand">Log in</Link>
      </p>
    </div>
  );
}

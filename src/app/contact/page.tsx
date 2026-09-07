"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ loading: true, error: "", success: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to send your message");
      setForm({ name: "", email: "", message: "" });
      setStatus({ loading: false, error: "", success: "Thanks. Your message has been sent." });
    } catch (error) {
      setStatus({ loading: false, error: error instanceof Error ? error.message : "Unable to send your message", success: "" });
    }
  }

  return (
    <div className="mx-auto max-w-5xl py-10 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brass">Contact us</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-ink sm:text-5xl">Let&apos;s talk about what you&apos;re building.</h1>
          <p className="mt-5 leading-7 text-ink/65">Send us a note and we will get back to you at the email address you provide.</p>
          <a href="mailto:mail@almamuncool.com" className="mt-8 inline-block font-semibold text-brand hover:underline">mail@almamuncool.com</a>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-hairline bg-white p-6 shadow-sm sm:p-8">
          {status.error && <p className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{status.error}</p>}
          {status.success && <p className="mb-5 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{status.success}</p>}
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-medium text-ink">Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal" placeholder="Your name" /></label>
            <label className="text-sm font-medium text-ink">Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal" placeholder="you@example.com" /></label>
          </div>
          <label className="mt-5 block text-sm font-medium text-ink">Message<textarea required minLength={10} rows={6} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className="mt-2 w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 font-normal" placeholder="How can we help?" /></label>
          <button type="submit" disabled={status.loading} className="mt-6 w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70">{status.loading ? "Sending..." : "Send message"}</button>
        </form>
      </div>
    </div>
  );
}
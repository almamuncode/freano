'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    image: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to load profile");
        }

        const data = await res.json();
        setForm({
          name: data.name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          dateOfBirth: data.dateOfBirth ?? "",
          image: data.image ?? "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Unable to save profile");
      }

      setSuccess("Profile updated successfully.");
      setEditing(false);
      window.dispatchEvent(new Event("profile-updated"));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-gray-600">Loading profile...</div>;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 py-10">
      <div className="rounded-2xl border border-hairline bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink">My Profile</h1>
            <p className="mt-1 text-sm text-gray-600">View and manage your personal details.</p>
          </div>
          {!editing && <button type="button" onClick={() => setEditing(true)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white">Edit profile</button>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-hairline bg-white p-6 shadow-sm">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {success && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>}

        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-brand text-2xl font-bold text-white">
            {form.image ? <img src={form.image} alt="Profile" className="h-full w-full object-cover" /> : form.name.slice(0, 1).toUpperCase() || "U"}
          </div>
          {editing && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Profile picture</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 50 * 1024) {
                    setError("Profile picture must be 50 KB or smaller.");
                    e.target.value = "";
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => setForm((prev) => ({ ...prev, image: String(reader.result) }));
                  reader.readAsDataURL(file);
                }}
                className="block w-full text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">JPEG, PNG, GIF, or WebP. Maximum 50 KB.</p>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Full name</label>
          <input
            value={form.name}
            readOnly={!editing}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={form.email}
            readOnly={!editing}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Phone number</label>
          <input
            type="tel"
            value={form.phone}
            readOnly={!editing}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Date of birth</label>
          <input
            type="date"
            value={form.dateOfBirth}
            disabled={!editing}
            onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        {editing && <button type="submit" disabled={saving} className="w-full rounded-lg bg-brand px-4 py-2.5 font-medium text-white disabled:opacity-70">{saving ? "Saving..." : "Update profile"}</button>}
      </form>
    </div>
  );
}

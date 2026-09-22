'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_PROFILE_IMAGE_BYTES = 50 * 1024;

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not process this image")), "image/webp", quality));
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the resized image"));
    reader.readAsDataURL(blob);
  });
}

async function resizeProfileImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Choose a valid image file.");
  if (file.size > 15 * 1024 * 1024) throw new Error("The original image must be smaller than 15 MB.");

  const bitmap = await createImageBitmap(file);
  const cropSize = Math.min(bitmap.width, bitmap.height);
  const sourceX = (bitmap.width - cropSize) / 2;
  const sourceY = (bitmap.height - cropSize) / 2;
  let outputSize = 512;
  let result: Blob | null = null;

  while (outputSize >= 192) {
    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image resizing is not supported in this browser.");
    context.drawImage(bitmap, sourceX, sourceY, cropSize, cropSize, 0, 0, outputSize, outputSize);

    for (let quality = 0.88; quality >= 0.34; quality -= 0.08) {
      result = await canvasToBlob(canvas, quality);
      if (result.size <= MAX_PROFILE_IMAGE_BYTES) {
        bitmap.close();
        return { dataUrl: await blobToDataUrl(result), size: outputSize, bytes: result.size };
      }
    }
    outputSize -= 64;
  }

  bitmap.close();
  throw new Error("This image could not be compressed below 50 KB. Try another photo.");
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [imageInfo, setImageInfo] = useState("");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    profession: "",
    currentCity: "",
    dateOfBirth: "",
    image: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("edit") === "true") setEditing(true);

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
          profession: data.profession ?? "",
          currentCity: data.currentCity ?? "",
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

  const handleProfileImage = async (file?: File) => {
    if (!file) return;
    setProcessingImage(true);
    setError("");
    setImageInfo("");
    try {
      const resized = await resizeProfileImage(file);
      setForm((prev) => ({ ...prev, image: resized.dataUrl }));
      setImageInfo(`Square ${resized.size}×${resized.size}px · ${Math.ceil(resized.bytes / 1024)} KB`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resize this image");
    } finally {
      setProcessingImage(false);
    }
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
                disabled={processingImage}
                onChange={(e) => { void handleProfileImage(e.target.files?.[0]); e.target.value = ""; }}
                className="block w-full text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">{processingImage ? "Cropping and compressing…" : "Automatically cropped square and compressed below 50 KB."}</p>
              {imageInfo && <p className="mt-1 text-xs font-semibold text-brand">Ready · {imageInfo}</p>}
            </div>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Full name</label>
              <input value={form.name} onChange={(e) => handleChange("name", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone number</label>
              <input type="tel" pattern="(?:01[3-9][0-9]{8}|\+8801[3-9][0-9]{8}|008801[3-9][0-9]{8})" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="01712345678" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Profession</label>
              <input value={form.profession} onChange={(e) => handleChange("profession", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="e.g. Freelance designer" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Current city</label>
              <input value={form.currentCity} onChange={(e) => handleChange("currentCity", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="e.g. Dhaka" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Date of birth</label>
              <input type="date" value={form.dateOfBirth} onChange={(e) => handleChange("dateOfBirth", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
            </div>
          </div>
        ) : (
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {[
              ["Full name", form.name],
              ["Email", form.email],
              ["Phone number", form.phone],
              ["Profession", form.profession],
              ["Current city", form.currentCity],
              ["Date of birth", form.dateOfBirth],
            ].map(([label, value]) => (
              <div key={label} className="border-b border-hairline pb-3">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{label}</dt>
                <dd className="mt-1 text-sm font-medium text-ink">{value || "Not provided"}</dd>
              </div>
            ))}
          </dl>
        )}

        {editing && <button type="submit" disabled={saving || processingImage} className="w-full rounded-lg bg-brand px-4 py-2.5 font-medium text-white disabled:opacity-70">{processingImage ? "Processing image…" : saving ? "Saving..." : "Update profile"}</button>}
      </form>

    </div>
  );
}

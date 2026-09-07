import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id }, select: { name: true, image: true } });
  const initials = (user?.name ?? "U").slice(0, 1).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-10">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brass">Account</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">Manage your personal information and account security.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/profile?edit=true" className="card-surface block p-6 transition hover:-translate-y-0.5 hover:shadow-md">
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-brand text-lg font-bold text-white" aria-hidden="true">
            {user?.image ? <img src={user.image} alt="" className="h-full w-full object-cover" /> : initials}
          </span>
          <h2 className="mt-4 text-lg font-bold text-ink">Edit profile</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">Update your name, phone, profession, city, date of birth, and profile picture.</p>
          <span className="mt-5 block text-sm font-semibold text-brand">Manage profile -&gt;</span>
        </Link>
        <Link href="/profile?section=password" className="card-surface block p-6 transition hover:-translate-y-0.5 hover:shadow-md">
          <span className="text-2xl text-brand" aria-hidden="true">⚙</span>
          <h2 className="mt-4 text-lg font-bold text-ink">Change password</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">Update your password securely using your current password.</p>
          <span className="mt-5 block text-sm font-semibold text-brand">Update password -&gt;</span>
        </Link>
      </div>
    </div>
  );
}
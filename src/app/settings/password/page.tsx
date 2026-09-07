import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export default async function ChangePasswordPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-xl space-y-6 py-10">
      <div>
        <Link href="/settings" className="text-sm font-semibold text-brand hover:underline">&lt;- Settings</Link>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-brass">Security</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Change password</h1>
        <p className="mt-1 text-sm text-gray-600">Update your password securely using your current password.</p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}

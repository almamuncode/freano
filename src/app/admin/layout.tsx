import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Source_Serif_4, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

const ledgerSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-ledger",
});
const ledgerSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ledger-sans",
});
const ledgerMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ledger-mono",
});

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session?.user) redirect("/login");
  if (role !== "ADMIN") redirect("/dashboard");

  return (
    <div
      className={`${ledgerSerif.variable} ${ledgerSans.variable} ${ledgerMono.variable} font-ledger-sans min-h-screen bg-paper text-ink`}
    >
      <div className="flex">
        <AdminSidebar userName={session.user.name ?? "Admin"} />
        <main className="flex-1 px-8 py-10 max-w-4xl">{children}</main>
      </div>
    </div>
  );
}

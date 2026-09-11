import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProjectTracker from "@/components/ProjectTracker";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const projects = await prisma.project.findMany({ where: { userId: (session.user as any).id }, include: { payments: true }, orderBy: { createdAt: "desc" } });
  const outstanding = projects.reduce((sum, project) => sum + Math.max(Number(project.agreedAmount) - Number(project.paidAmount), 0), 0);
  return <div className="space-y-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brass">Freelance receivables</p><h1 className="mt-2 text-3xl font-bold text-ink">Unpaid projects</h1><p className="mt-1 text-sm text-ink/60">Keep delivered work visible until the payment actually arrives.</p></div><Link href="/loans" className="text-sm font-semibold text-brand">Open loan tracker -&gt;</Link></div><div className="card-surface flex items-center justify-between gap-4 p-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-rust">Still outstanding</p><p className="mt-1 text-2xl font-bold text-ink">৳{outstanding.toLocaleString("en-BD")}</p></div><span className="text-3xl" aria-hidden="true">◌</span></div><ProjectTracker initialProjects={projects.map((project) => ({ ...project, agreedAmount: Number(project.agreedAmount), paidAmount: Number(project.paidAmount), dueDate: project.dueDate?.toISOString() ?? null, payments: project.payments.map((payment) => ({ ...payment, amount: Number(payment.amount), paidAt: payment.paidAt.toISOString() })) }))} /></div>;
}
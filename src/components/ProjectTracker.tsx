"use client";

import CategoryIcon from "@/components/CategoryIcon";
import StatusBadge from "@/components/StatusBadge";

import { useWorkspace } from "@/components/WorkspaceContext";

import { useState } from "react";

type Payment = { id: string; amount: number; paidAt: string };
type Project = { id: string; title: string; client: string; phone?: string | null; agreedAmount: number; paidAmount: number; status: "UNPAID" | "PARTIAL" | "PAID"; dueDate?: string | null; note?: string | null; payments: Payment[] };
type Form = { title: string; client: string; phone?: string; agreedAmount: string; paidAmount: string; dueDate: string; note: string };
const blank: Form = { title: "", client: "", phone: "", agreedAmount: "", paidAmount: "", dueDate: "", note: "" };
const money = (amount: number) => `৳${new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(amount)}`;

export default function ProjectTracker({ initialProjects }: { initialProjects: Project[] }) {
  const router = useWorkspace();
  const [projects, setProjects] = useState(initialProjects);
  const [form, setForm] = useState<Form>(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [paymentFor, setPaymentFor] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [message, setMessage] = useState("");
  const field = (name: keyof Form, value: string) => setForm((current) => ({ ...current, [name]: value }));

  async function saveProject(event: React.FormEvent) {
    event.preventDefault();
    const editing = Boolean(editingId);
    const projectData = { ...form, agreedAmount: Number(form.agreedAmount), paidAmount: Number(form.paidAmount || 0), phone: form.phone };
    const response = await router.request(editing ? `/api/projects/${editingId}` : "/api/projects", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(projectData) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? "Could not save project");
    const old = projects.find((project) => project.id === editingId);
    const saved = { ...data, agreedAmount: Number(data.agreedAmount), paidAmount: Number(data.paidAmount), payments: old?.payments ?? [] };
    setProjects((current) => editing ? current.map((project) => project.id === editingId ? saved : project) : [saved, ...current]);
    setForm(blank); setEditingId(null); setMessage(editing ? "Project updated." : "Project saved.");
  }

  async function addPayment(project: Project) {
    const response = await router.request(`/api/projects/${project.id}/payments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: Number(paymentAmount) }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? "Could not save payment");
    setProjects((current) => current.map((item) => item.id === project.id ? { ...item, paidAmount: Number(data.paidAmount), status: data.status, payments: [...item.payments, { ...data.payment, amount: Number(data.payment.amount) }] } : item));
    setPaymentFor(null); setPaymentAmount(""); setMessage("Payment added.");
  }

  async function removeProject(project: Project) {
    if (!window.confirm(`Delete ${project.title}? Its payment history will also be removed.`)) return;
    const response = await router.request(`/api/projects/${project.id}`, { method: "DELETE" });
    if (!response.ok) return setMessage("Could not delete project");
    setProjects((current) => current.filter((item) => item.id !== project.id)); setMessage("Project deleted.");
  }

  return <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
    <form onSubmit={saveProject} className="card-surface space-y-4 p-5 sm:p-6">
      <div><h2 className="text-lg font-bold text-ink">{editingId ? "Edit project" : "Add completed work"}</h2><p className="mt-1 text-sm text-ink/60">Record the agreement, then add each payment as it arrives.</p></div>
      {([["title", "Project title", "Website redesign"], ["client", "Client", "Client or company"]] as const).map(([name, label, placeholder]) => <label key={name} className="block text-sm font-medium">{label}<input required value={form[name]} onChange={(event) => field(name, event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" placeholder={placeholder} /></label>)}
        <label className="block text-sm font-medium">BD mobile number<input required type="tel" value={form.phone} onChange={(event) => field("phone", event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="01712345678" pattern="(?:01[3-9]\d{8}|\+8801[3-9]\d{8}|008801[3-9]\d{8})" /></label>
      <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-medium">Agreed amount<input required type="number" min="1" step="0.01" value={form.agreedAmount} onChange={(event) => field("agreedAmount", event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="block text-sm font-medium">Already paid<input type="number" min="0" step="0.01" value={form.paidAmount} onChange={(event) => field("paidAmount", event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label></div>
      <label className="block text-sm font-medium">Payment due date<input type="date" value={form.dueDate} onChange={(event) => field("dueDate", event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
      <label className="block text-sm font-medium">Note<textarea value={form.note} onChange={(event) => field("note", event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" rows={2} /></label>
      {message && <p className="text-sm text-brand">{message}</p>}
      <div className="flex gap-2"><button className="flex-1 rounded-lg bg-brand py-2.5 font-semibold text-white">{editingId ? "Update project" : "Save project"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(blank); }} className="rounded-lg border px-4 py-2.5 text-sm font-semibold">Cancel</button>}</div>
    </form>
    <div className="space-y-3">{projects.length === 0 ? <div className="card-surface p-8 text-center text-sm text-ink/60">No projects tracked yet.</div> : projects.map((project) => { const remaining = Math.max(project.agreedAmount - project.paidAmount, 0); return <article key={project.id} className="card-surface p-5"><div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-start gap-3"><CategoryIcon name={project.title} variant="soft" /><div className="min-w-0"><h3 className="text-lg font-bold text-ink">{project.title}</h3><p className="text-sm text-ink/60">{project.client}{project.dueDate ? ` · Due ${new Date(project.dueDate).toLocaleDateString("en-BD")}` : ""}</p></div></div><StatusBadge tone={project.status === "PAID" ? "blue" : project.status === "PARTIAL" ? "green" : "orange"}>{project.status === "PARTIAL" ? "Partially paid" : project.status === "PAID" ? "Paid" : "Unpaid"}</StatusBadge></div><div className="mt-5 grid grid-cols-3 gap-3 border-t border-hairline pt-4 text-sm"><div><p className="text-ink/50">Agreed</p><p className="font-semibold">{money(project.agreedAmount)}</p></div><div><p className="text-ink/50">Received</p><p className="font-semibold text-income">{money(project.paidAmount)}</p></div><div><p className="text-ink/50">Outstanding</p><p className="font-semibold text-expense">{money(remaining)}</p></div></div><div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold"><button type="button" onClick={() => { setEditingId(project.id); setForm({ title: project.title, client: project.client, phone: project.phone ?? "", agreedAmount: String(project.agreedAmount), paidAmount: String(project.paidAmount), dueDate: project.dueDate?.slice(0, 10) ?? "", note: project.note ?? "" }); }} className="text-brand">Edit</button><button type="button" onClick={() => removeProject(project)} className="text-rust">Delete</button>{remaining > 0 && <button type="button" onClick={() => setPaymentFor(paymentFor === project.id ? null : project.id)} className="text-income">+ Record payment</button>}</div>{paymentFor === project.id && remaining > 0 && <div className="mt-4 flex gap-2"><input autoFocus type="number" min="0.01" max={remaining} step="0.01" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} className="min-w-0 flex-1 rounded-lg border px-3 py-2" placeholder={`Up to ${money(remaining)}`} /><button type="button" onClick={() => addPayment(project)} className="rounded-lg bg-income px-3 py-2 text-sm font-semibold text-white">Add payment</button></div>}</article>; })}</div>
  </div>;
}

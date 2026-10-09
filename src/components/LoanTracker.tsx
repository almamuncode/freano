"use client";

import { useWorkspace } from "@/components/WorkspaceContext";

import { useState } from "react";

type Payment = { id: string; amount: number; paidAt: string; note?: string | null };
type Loan = {
  id: string; direction: "LENT" | "BORROWED"; person: string; phone?: string | null; principal: number;
  interestRate: number; dueDate?: string | null; status: "OPEN" | "PAID";
  note?: string | null; payments: Payment[];
};
type LoanForm = { direction: "LENT" | "BORROWED"; person: string; phone: string; principal: string; interestRate: string; dueDate: string; note: string };

const emptyForm: LoanForm = { direction: "LENT", person: "", phone: "", principal: "", interestRate: "", dueDate: "", note: "" };
const money = (value: number) => `৳${new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(value)}`;

function formFromLoan(loan: Loan): LoanForm {
  return { direction: loan.direction, person: loan.person, phone: loan.phone ?? "", principal: String(loan.principal), interestRate: String(loan.interestRate), dueDate: loan.dueDate ? loan.dueDate.slice(0, 10) : "", note: loan.note ?? "" };
}

export default function LoanTracker({ initialLoans }: { initialLoans: Loan[] }) {
  const router = useWorkspace();
  const [loans, setLoans] = useState(initialLoans);
  const [form, setForm] = useState<LoanForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [paymentFor, setPaymentFor] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [message, setMessage] = useState("");
  const [directionFilter, setDirectionFilter] = useState<"LENT" | "BORROWED">("LENT");

  function updateField(field: keyof LoanForm, value: string) { setForm((current) => ({ ...current, [field]: value })); }

  async function saveLoan(event: React.FormEvent) {
    event.preventDefault();
    const editing = Boolean(editingId);
    const response = await router.request(editing ? `/api/loans/${editingId}` : "/api/loans", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, principal: Number(form.principal), interestRate: Number(form.interestRate || 0) }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? "Could not save loan");
    const saved = { ...data, principal: Number(data.principal), interestRate: Number(data.interestRate), payments: editing ? loans.find((loan) => loan.id === editingId)?.payments ?? [] : [] };
    setLoans((current) => editing ? current.map((loan) => loan.id === editingId ? saved : loan) : [saved, ...current]);
    setForm(emptyForm); setEditingId(null); setMessage(editing ? "Loan updated." : "Loan saved.");
  }

  async function addPayment(loan: Loan) {
    const response = await router.request(`/api/loans/${loan.id}/payments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: Number(paymentAmount) }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? "Could not save repayment");
    setLoans((current) => current.map((item) => item.id === loan.id ? { ...item, status: data.status ?? "OPEN", payments: [...item.payments, { ...data, amount: Number(data.amount) }] } : item));
    setPaymentFor(null); setPaymentAmount(""); setMessage("Repayment added.");
  }

  async function deleteLoan(loan: Loan) {
    if (!window.confirm(`Delete the loan with ${loan.person}? Its repayment history will also be removed.`)) return;
    const response = await router.request(`/api/loans/${loan.id}`, { method: "DELETE" });
    if (!response.ok) return setMessage("Could not delete loan");
    setLoans((current) => current.filter((item) => item.id !== loan.id)); setMessage("Loan deleted.");
  }

  return <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
    <form onSubmit={saveLoan} className="card-surface space-y-4 p-5 sm:p-6">
      <div><h2 className="text-lg font-bold text-ink">{editingId ? "Edit loan" : "Add a loan"}</h2><p className="mt-1 text-sm text-ink/60">Record the full agreement, then add each repayment as it happens.</p></div>
      <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => { updateField("direction", "LENT"); setDirectionFilter("LENT"); }} className={`rounded-lg px-3 py-2 text-sm font-semibold ${form.direction === "LENT" ? "bg-brand text-white" : "bg-gray-100 text-gray-600"}`}>I gave money</button><button type="button" onClick={() => { updateField("direction", "BORROWED"); setDirectionFilter("BORROWED"); }} className={`rounded-lg px-3 py-2 text-sm font-semibold ${form.direction === "BORROWED" ? "bg-brand text-white" : "bg-gray-100 text-gray-600"}`}>I took money</button></div>
      <label className="block text-sm font-medium">Person<input required value={form.person} onChange={(event) => updateField("person", event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="Name of person or provider" /></label>
      <label className="block text-sm font-medium">BD mobile number<input required type="tel" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="01712345678" pattern="(?:01[3-9]\d{8}|\+8801[3-9]\d{8}|008801[3-9]\d{8})" /></label>
      <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-medium">Principal<input required type="number" min="1" step="0.01" value={form.principal} onChange={(event) => updateField("principal", event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="BDT" /></label><label className="block text-sm font-medium">Interest %<input type="number" min="0" step="0.01" value={form.interestRate} onChange={(event) => updateField("interestRate", event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="0" /></label></div>
      <label className="block text-sm font-medium">Due date<input type="date" value={form.dueDate} onChange={(event) => updateField("dueDate", event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
      <label className="block text-sm font-medium">Note<textarea value={form.note} onChange={(event) => updateField("note", event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" rows={2} placeholder="Optional context" /></label>
      {message && <p className="text-sm text-brand">{message}</p>}
      <div className="flex gap-2"><button className="flex-1 rounded-lg bg-brand py-2.5 font-semibold text-white">{editingId ? "Update loan" : "Save loan"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="rounded-lg border px-4 py-2.5 text-sm font-semibold">Cancel</button>}</div>
    </form>
    <div className="space-y-3">{loans.filter((loan) => loan.direction === directionFilter).length === 0 ? <div className="card-surface p-8 text-center text-sm text-ink/60">No {directionFilter === "LENT" ? "given" : "taken"} loans yet.</div> : loans.filter((loan) => loan.direction === directionFilter).map((loan) => {
      const totalDue = loan.principal * (1 + loan.interestRate / 100); const paid = loan.payments.reduce((sum, payment) => sum + payment.amount, 0); const remaining = Math.max(totalDue - paid, 0);
      return <article key={loan.id} className="card-surface p-5"><div className="flex items-start justify-between gap-4"><div><span className={`text-xs font-bold uppercase tracking-wider ${loan.direction === "LENT" ? "text-income" : "text-rust"}`}>{loan.direction === "LENT" ? "You gave" : "You took"}</span><h3 className="mt-1 text-lg font-bold text-ink">{loan.person}</h3><p className="text-sm text-ink/60">{loan.interestRate ? `${loan.interestRate}% interest` : "No interest"}{loan.dueDate ? ` · Due ${new Date(loan.dueDate).toLocaleDateString("en-BD")}` : ""}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${loan.status === "PAID" ? "bg-[#eee8ff] text-sage" : "bg-[#fff0df] text-brass"}`}>{loan.status === "PAID" ? "Paid" : "Open"}</span></div><div className="mt-5 grid grid-cols-3 gap-3 border-t border-hairline pt-4 text-sm"><div><p className="text-ink/50">Total due</p><p className="font-semibold">{money(totalDue)}</p></div><div><p className="text-ink/50">Paid</p><p className="font-semibold text-income">{money(paid)}</p></div><div><p className="text-ink/50">Remaining</p><p className="font-semibold text-rust">{money(remaining)}</p></div></div><div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold"><button type="button" onClick={() => { setEditingId(loan.id); setForm(formFromLoan(loan)); }} className="text-brand">Edit</button><button type="button" onClick={() => deleteLoan(loan)} className="text-rust">Delete</button>{remaining > 0 && <button type="button" onClick={() => setPaymentFor(paymentFor === loan.id ? null : loan.id)} className="text-income">+ Record repayment</button>}</div>{paymentFor === loan.id && remaining > 0 && <div className="mt-4 flex gap-2"><input autoFocus type="number" min="0.01" max={remaining} step="0.01" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} className="min-w-0 flex-1 rounded-lg border px-3 py-2" placeholder={`Up to ${money(remaining)}`} /><button type="button" onClick={() => addPayment(loan)} className="rounded-lg bg-income px-3 py-2 text-sm font-semibold text-white">Add payment</button></div>}</article>;
    })}</div>
  </div>;
}

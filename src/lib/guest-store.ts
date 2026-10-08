import { z } from "zod";
import type { ComponentProps } from "react";
import type LoanTracker from "@/components/LoanTracker";
import type ProjectTracker from "@/components/ProjectTracker";
import type EarningsWorkspace from "@/components/EarningsWorkspace";
import type { Bank, Wallet, Transaction, Account } from "@/types";
import { isValidBangladeshiPhone } from "@/lib/profile-validation";

type Loan = ComponentProps<typeof LoanTracker>["initialLoans"][number];
type Project = ComponentProps<typeof ProjectTracker>["initialProjects"][number];
type Earning = ComponentProps<typeof EarningsWorkspace>["initialEarnings"][number] & { transactionId?: string };
export type GuestData = { banks: Bank[]; wallets: Wallet[]; transactions: Transaction[]; loans: Loan[]; projects: Project[]; earnings: Earning[] };
export const emptyGuestData = (): GuestData => ({ banks: [], wallets: [], transactions: [], loans: [], projects: [], earnings: [] });
const amount = z.number().finite().positive();
const text = z.string().trim().min(1);
const account = z.enum(["BANK", "WALLET", "POCKET_MONEY"]);
const paymentMethod = z.enum(["CASH", "BKASH", "NAGAD", "ROCKET", "BANK_TRANSFER", "CARD", "OTHER"]);
const transactionSchema = z.object({ type: z.enum(["INCOME", "EXPENSE"]), amount, source: text, account, bankId: z.string().optional(), walletId: z.string().optional(), scope: z.enum(["PERSONAL", "FAMILY", "BUSINESS"]).default("PERSONAL"), paymentMethod: paymentMethod.default("CASH"), note: z.string().optional(), occurredAt: z.string().datetime() });
const phone = text.refine(isValidBangladeshiPhone, "Enter a valid Bangladeshi mobile number");
const loanSchema = z.object({ direction: z.enum(["LENT", "BORROWED"]), person: text, phone, principal: amount, interestRate: z.number().min(0).max(100), dueDate: z.string().optional(), note: z.string().optional() });
const projectSchema = z.object({ title: text, client: text, phone, agreedAmount: amount, paidAmount: z.number().finite().min(0), dueDate: z.string().optional(), note: z.string().optional() });
const earningSchema = z.object({ sourceType: text, platform: text, title: text, client: z.string().optional(), grossAmount: amount, platformFee: z.number().min(0), otherFee: z.number().min(0), currency: text, exchangeRate: amount, status: z.enum(["PENDING", "AVAILABLE"]), expectedPayoutAt: z.string().optional(), note: z.string().optional() });
const rounded = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
export function guestBalance(data: GuestData, account?: Account, id?: string) {
  return rounded(data.transactions.filter(t => (!account || t.account === account) && (!id || (account === "BANK" ? t.bankId : t.walletId) === id)).reduce((sum, t) => sum + (t.type === "INCOME" ? t.amount : -t.amount), 0));
}

// A store is created per mounted guest workspace. Nothing is written to storage or sent to an API.
export function createGuestStore() {
  let data = emptyGuestData();
  const id = () => crypto.randomUUID();
  function checkAccount(kind: string, accountId?: string) {
    if (kind === "BANK" && !data.banks.some(b => b.id === accountId)) throw new Error("Select a bank account");
    if (kind === "WALLET" && !data.wallets.some(w => w.id === accountId)) throw new Error("Select a wallet");
  }
  function addTransaction(input: z.input<typeof transactionSchema> & { transferId?: string; isDeposit?: boolean }) {
    const parsed = transactionSchema.parse(input);
    checkAccount(parsed.account, parsed.account === "BANK" ? parsed.bankId : parsed.walletId);
    const transaction: Transaction = { ...parsed, id: id(), amount: rounded(parsed.amount), currency: "BDT", bankId: parsed.account === "BANK" ? parsed.bankId : null, walletId: parsed.account === "WALLET" ? parsed.walletId : null, transferId: input.transferId, isDeposit: input.isDeposit ?? false };
    data.transactions.unshift(transaction); return transaction;
  }
  function dispatch(url: string, init?: RequestInit) {
    const [, , resource, recordId, action] = url.split("/");
    const method = init?.method ?? "GET";
    const body = typeof init?.body === "string" ? JSON.parse(init.body) : {};
    if (resource === "banks" || resource === "wallets") {
      const list = data[resource];
      if (method === "POST" && !recordId) {
        const parsed = z.object({ name: text, details: z.string().optional() }).parse(body);
        if (list.some(item => item.name.toLowerCase() === parsed.name.toLowerCase())) throw new Error("An account with this name already exists");
        const item = { ...parsed, id: id() }; list.push(item); return item;
      }
      if (method === "DELETE" && recordId) {
        if (!list.some(item => item.id === recordId)) throw new Error("Account not found");
        data[resource] = list.filter(item => item.id !== recordId);
        const removed = data.transactions.filter(t => t.bankId === recordId || t.walletId === recordId).map(t => t.id);
        data.transactions = data.transactions.filter(t => !removed.includes(t.id));
        data.earnings.forEach(e => { if (e.transactionId && removed.includes(e.transactionId)) e.transactionId = undefined; });
        return { success: true };
      }
    }
    if (resource === "transactions") {
      const existing = data.transactions.find(t => t.id === recordId);
      if (method === "POST") return addTransaction(body);
      if (!existing) throw new Error("Transaction not found");
      if (method === "PATCH") {
        if (existing.transferId) throw new Error("Delete the transfer and record it again to change it");
        const parsed = transactionSchema.parse(body);
        checkAccount(parsed.account, parsed.account === "BANK" ? parsed.bankId : parsed.walletId);
        Object.assign(existing, parsed, { amount: rounded(parsed.amount), bankId: parsed.account === "BANK" ? parsed.bankId : null, walletId: parsed.account === "WALLET" ? parsed.walletId : null }); return existing;
      }
      if (method === "DELETE") {
        const removed = data.transactions.filter(t => t.id === recordId || (existing.transferId && t.transferId === existing.transferId)).map(t => t.id);
        data.transactions = data.transactions.filter(t => !removed.includes(t.id));
        data.earnings.forEach(e => { if (e.transactionId && removed.includes(e.transactionId)) e.transactionId = undefined; });
        return { success: true };
      }
    }
    if (resource === "account-transfers" || resource === "transfers") {
      const parsed = z.object({ amount, occurredAt: z.string().datetime(), note: z.string().optional(), fromAccount: z.enum(["BANK", "WALLET", "POCKET_MONEY", "PERSON"]), toAccount: z.enum(["BANK", "WALLET", "POCKET_MONEY", "PERSON"]), fromId: z.string().optional(), toId: z.string().optional(), personName: z.string().optional() }).parse(resource === "transfers" ? { ...body, fromAccount: body.sourceType === "BANK" ? "BANK" : "PERSON", fromId: body.bankId, toAccount: "POCKET_MONEY", personName: body.sourceType } : body);
      if (parsed.fromAccount === parsed.toAccount && parsed.fromId === parsed.toId) throw new Error("Choose two different accounts");
      if (parsed.fromAccount === "PERSON" && parsed.toAccount === "PERSON") throw new Error("Choose an account");
      for (const [kind, accountId] of [[parsed.fromAccount, parsed.fromId], [parsed.toAccount, parsed.toId]]) checkAccount(kind!, accountId);
      if ((parsed.fromAccount === "PERSON" || parsed.toAccount === "PERSON") && !parsed.personName?.trim()) throw new Error("Enter the person's name");
      if (parsed.fromAccount !== "PERSON" && parsed.amount > guestBalance(data, parsed.fromAccount, parsed.fromId)) throw new Error("This exceeds the available account balance");
      const transferId = parsed.fromAccount !== "PERSON" && parsed.toAccount !== "PERSON" ? id() : undefined;
      const entries = [];
      for (const [kind, accountId, type] of [[parsed.fromAccount, parsed.fromId, "EXPENSE"], [parsed.toAccount, parsed.toId, "INCOME"]] as const) {
        if (kind === "PERSON") continue;
        entries.push(addTransaction({ type, account: kind, bankId: kind === "BANK" ? accountId : undefined, walletId: kind === "WALLET" ? accountId : undefined, amount: parsed.amount, source: parsed.personName || "Account transfer", occurredAt: parsed.occurredAt, note: parsed.note, transferId, isDeposit: !transferId && type === "INCOME" }));
      }
      return entries;
    }
    if (resource === "bills") {
      const parsed = z.object({ biller: text, reference: text, amount, account, bankId: z.string().optional(), walletId: z.string().optional(), note: z.string().optional(), occurredAt: z.string().datetime() }).parse(body);
      checkAccount(parsed.account, parsed.account === "BANK" ? parsed.bankId : parsed.walletId);
      if (parsed.amount > guestBalance(data, parsed.account, parsed.account === "BANK" ? parsed.bankId : parsed.walletId)) throw new Error("This exceeds the available account balance");
      return addTransaction({ ...parsed, type: "EXPENSE", source: parsed.biller, note: `${parsed.reference}${parsed.note ? ` · ${parsed.note}` : ""}` });
    }
    if (resource === "loans") {
      const existing = data.loans.find(item => item.id === recordId);
      if (action === "payments" && existing) {
        const { amount: value } = z.object({ amount }).parse(body);
        const due = rounded(existing.principal * (1 + existing.interestRate / 100));
        const paid = existing.payments.reduce((sum, p) => sum + p.amount, 0);
        if (value > rounded(due - paid)) throw new Error("Repayment cannot exceed the remaining balance");
        const payment = { id: id(), amount: rounded(value), paidAt: new Date().toISOString() };
        existing.payments.push(payment); existing.status = rounded(paid + value) >= due ? "PAID" : "OPEN";
        return { ...payment, status: existing.status };
      }
      if (method === "POST" || (method === "PATCH" && existing)) {
        const parsed = loanSchema.parse(body);
        const payments = existing?.payments ?? [];
        const totalDue = rounded(parsed.principal * (1 + parsed.interestRate / 100));
        const paid = payments.reduce((sum, p) => sum + p.amount, 0);
        if (paid > totalDue) throw new Error("Loan total cannot be less than repayments");
        const item: Loan = { ...parsed, id: existing?.id ?? id(), payments, status: paid >= totalDue ? "PAID" : "OPEN" };
        data.loans = [item, ...data.loans.filter(l => l.id !== item.id)]; return item;
      }
      if (method === "DELETE" && existing) { data.loans = data.loans.filter(l => l.id !== recordId); return { success: true }; }
    }
    if (resource === "projects") {
      const existing = data.projects.find(item => item.id === recordId);
      if (action === "payments" && existing) {
        const { amount: value } = z.object({ amount }).parse(body);
        if (value > rounded(existing.agreedAmount - existing.paidAmount)) throw new Error("Payment exceeds the outstanding balance");
        const payment = { id: id(), amount: rounded(value), paidAt: new Date().toISOString() };
        existing.payments.push(payment); existing.paidAmount = rounded(existing.paidAmount + value); existing.status = existing.paidAmount >= existing.agreedAmount ? "PAID" : "PARTIAL";
        return { payment, paidAmount: existing.paidAmount, status: existing.status };
      }
      if (method === "POST" || (method === "PATCH" && existing)) {
        const parsed = projectSchema.parse(body);
        if (parsed.paidAmount > parsed.agreedAmount) throw new Error("Paid amount cannot exceed the project amount");
        const item: Project = { ...parsed, id: existing?.id ?? id(), payments: existing?.payments ?? [], status: parsed.paidAmount === 0 ? "UNPAID" : parsed.paidAmount >= parsed.agreedAmount ? "PAID" : "PARTIAL" };
        data.projects = [item, ...data.projects.filter(p => p.id !== item.id)]; return item;
      }
      if (method === "DELETE" && existing) { data.projects = data.projects.filter(p => p.id !== recordId); return { success: true }; }
    }
    if (resource === "earnings") {
      const existing = data.earnings.find(e => e.id === recordId);
      if (method === "POST") {
        const parsed = earningSchema.parse(body);
        if (parsed.platformFee + parsed.otherFee > parsed.grossAmount) throw new Error("Fees cannot exceed gross earnings");
        const item: Earning = { ...parsed, id: id(), netAmountBdt: rounded((parsed.grossAmount - parsed.platformFee - parsed.otherFee) * parsed.exchangeRate) };
        data.earnings.unshift(item); return item;
      }
      if (method === "PATCH" && existing) {
        if (existing.status === "RECEIVED") throw new Error("This payout is already received");
        const parsed = z.object({ action: z.literal("RECEIVE"), account, bankId: z.string().optional(), walletId: z.string().optional(), paymentMethod }).parse(body);
        const receivedAt = new Date().toISOString();
        const transaction = addTransaction({ ...parsed, type: "INCOME", amount: existing.netAmountBdt, source: `${existing.platform} · ${existing.title}`, occurredAt: receivedAt, scope: "BUSINESS" });
        existing.status = "RECEIVED"; existing.receivedAt = receivedAt; existing.transactionId = transaction.id; return existing;
      }
      if (method === "DELETE" && existing) {
        if (existing.transactionId) throw new Error("Manage the linked payout transaction instead");
        data.earnings = data.earnings.filter(e => e.id !== recordId); return { success: true };
      }
    }
    throw new Error("This action is not available in guest mode");
  }
  return {
    snapshot: () => structuredClone(data),
    reset: () => { data = emptyGuestData(); },
    async request(url: string, init?: RequestInit) {
      // Roll back all changes if a multi-entry operation fails.
      const previous = structuredClone(data);
      try { return Response.json(dispatch(url, init)); }
      catch (error) {
        data = previous;
        return Response.json({ error: error instanceof z.ZodError ? error.issues[0]?.message : error instanceof Error ? error.message : "Invalid details" }, { status: 400 });
      }
    },
  };
}

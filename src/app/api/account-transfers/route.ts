import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const accountSchema = z.enum(["BANK", "WALLET", "POCKET_MONEY"]);
type Account = z.infer<typeof accountSchema>;
const transferPartySchema = z.union([accountSchema, z.literal("PERSON")]);
const transferSchema = z.object({
  amount: z.number().positive(),
  fromAccount: transferPartySchema,
  toAccount: transferPartySchema,
  fromId: z.string().cuid().optional(),
  toId: z.string().cuid().optional(),
  personName: z.string().trim().min(1).max(120).optional(),
  note: z.string().trim().max(500).optional(),
  occurredAt: z.string().datetime(),
});

const accountLabel = { BANK: "bank account", WALLET: "wallet", POCKET_MONEY: "pocket money", PERSON: "another person" } as const;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = transferSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter valid transfer details" }, { status: 400 });
  const data = parsed.data;
  if (data.fromAccount === data.toAccount && data.fromId === data.toId) return NextResponse.json({ error: "Choose two different accounts" }, { status: 400 });
  const includesPerson = data.fromAccount === "PERSON" || data.toAccount === "PERSON";
  if (data.fromAccount === "PERSON" && data.toAccount === "PERSON") return NextResponse.json({ error: "Choose an account to transfer to or from" }, { status: 400 });
  if (includesPerson && !data.personName) return NextResponse.json({ error: "Enter the person's name" }, { status: 400 });
  if ((data.fromAccount !== "POCKET_MONEY" && data.fromAccount !== "PERSON" && !data.fromId) || (data.toAccount !== "POCKET_MONEY" && data.toAccount !== "PERSON" && !data.toId)) return NextResponse.json({ error: "Choose both transfer accounts" }, { status: 400 });

  const userId = (session.user as any).id;
  const getAccount = async (account: "BANK" | "WALLET", id: string) => account === "BANK"
    ? prisma.bank.findFirst({ where: { id, userId } })
    : prisma.wallet.findFirst({ where: { id, userId } });
  if (data.fromAccount !== "POCKET_MONEY" && data.fromAccount !== "PERSON" && !await getAccount(data.fromAccount, data.fromId!)) return NextResponse.json({ error: "Source account not found" }, { status: 404 });
  if (data.toAccount !== "POCKET_MONEY" && data.toAccount !== "PERSON" && !await getAccount(data.toAccount, data.toId!)) return NextResponse.json({ error: "Destination account not found" }, { status: 404 });

  if (data.fromAccount !== "PERSON") {
    const sourceWhere = data.fromAccount === "BANK" ? { bankId: data.fromId } : data.fromAccount === "WALLET" ? { walletId: data.fromId } : { account: "POCKET_MONEY" as const };
    const totals = await prisma.transaction.groupBy({ by: ["type"], where: { userId, ...sourceWhere }, _sum: { amount: true } });
    const balance = totals.reduce((sum, entry) => sum + (entry.type === "INCOME" ? Number(entry._sum.amount ?? 0) : -Number(entry._sum.amount ?? 0)), 0);
    if (data.amount > balance) return NextResponse.json({ error: `This exceeds the available ${accountLabel[data.fromAccount]} balance` }, { status: 400 });
  }

  const transferId = crypto.randomUUID();
  const entryData = (account: Account, id: string | undefined) => ({ account, bankId: account === "BANK" ? id : undefined, walletId: account === "WALLET" ? id : undefined });
  if (includesPerson) {
    const account = (data.fromAccount === "PERSON" ? data.toAccount : data.fromAccount) as Account;
    const accountId = data.fromAccount === "PERSON" ? data.toId : data.fromId;
    return NextResponse.json(await prisma.transaction.create({ data: { type: data.fromAccount === "PERSON" ? "INCOME" : "EXPENSE", amount: data.amount, source: `${data.fromAccount === "PERSON" ? "Deposit from" : "Withdrawal to"} ${data.personName}`, note: data.note || undefined, occurredAt: new Date(data.occurredAt), paymentMethod: account === "POCKET_MONEY" ? "CASH" : "BANK_TRANSFER", userId, ...entryData(account, accountId) } }), { status: 201 });
  }
  const fromAccount = data.fromAccount as Account;
  const toAccount = data.toAccount as Account;
  const records = await prisma.$transaction([
    prisma.transaction.create({ data: { type: "EXPENSE", amount: data.amount, source: `Transfer to ${accountLabel[toAccount]}`, note: data.note || undefined, occurredAt: new Date(data.occurredAt), paymentMethod: "BANK_TRANSFER", transferId, userId, ...entryData(fromAccount, data.fromId) } }),
    prisma.transaction.create({ data: { type: "INCOME", amount: data.amount, source: `Transfer from ${accountLabel[fromAccount]}`, note: data.note || undefined, occurredAt: new Date(data.occurredAt), paymentMethod: "BANK_TRANSFER", transferId, userId, ...entryData(toAccount, data.toId) } }),
  ]);
  return NextResponse.json(records, { status: 201 });
}
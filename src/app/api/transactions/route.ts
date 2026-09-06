import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive(),
  currency: z.string().default("BDT"),
  scope: z.enum(["PERSONAL", "FAMILY", "BUSINESS"]).default("PERSONAL"),
  paymentMethod: z
    .enum(["CASH", "BKASH", "NAGAD", "ROCKET", "BANK_TRANSFER", "CARD", "OTHER"])
    .default("CASH"),
  source: z.string().min(1), // client/shop/family member name etc.
  note: z.string().optional(),
  occurredAt: z.string(), // ISO date-time string from the form (date + time combined)
  categoryId: z.string().optional(),
});

// GET /api/transactions?type=EXPENSE&scope=FAMILY&from=2026-01-01&to=2026-01-31
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const scope = searchParams.get("scope");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: (session.user as any).id,
      ...(type ? { type: type as any } : {}),
      ...(scope ? { scope: scope as any } : {}),
      ...(from || to
        ? {
            occurredAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: { category: true },
    orderBy: { occurredAt: "desc" },
  });

  return NextResponse.json(transactions);
}

// POST /api/transactions
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const transaction = await prisma.transaction.create({
    data: {
      ...data,
      occurredAt: new Date(data.occurredAt),
      userId: (session.user as any).id,
    },
  });

  return NextResponse.json(transaction, { status: 201 });
}

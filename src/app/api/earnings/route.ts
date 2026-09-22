import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const earningSchema = z.object({
  sourceType: z.enum(["MARKETPLACE", "CREATOR_PLATFORM", "DIRECT_CLIENT", "OTHER"]),
  platform: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(160),
  client: z.string().trim().max(120).optional(),
  grossAmount: z.number().positive(),
  platformFee: z.number().min(0).default(0),
  otherFee: z.number().min(0).default(0),
  currency: z.string().trim().min(3).max(5).default("USD"),
  exchangeRate: z.number().positive(),
  status: z.enum(["PENDING", "AVAILABLE"]).default("PENDING"),
  expectedPayoutAt: z.string().optional(),
  note: z.string().trim().max(500).optional(),
}).refine((data) => data.platformFee + data.otherFee <= data.grossAmount, { message: "Fees cannot exceed gross earnings", path: ["platformFee"] });

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const earnings = await prisma.freelanceEarning.findMany({ where: { userId: (session.user as any).id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(earnings);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = earningSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid earning" }, { status: 400 });
  const data = parsed.data;
  const netAmountBdt = (data.grossAmount - data.platformFee - data.otherFee) * data.exchangeRate;
  const earning = await prisma.freelanceEarning.create({ data: { ...data, client: data.client || null, note: data.note || null, expectedPayoutAt: data.expectedPayoutAt ? new Date(`${data.expectedPayoutAt}T12:00:00`) : null, netAmountBdt, userId: (session.user as any).id } });
  return NextResponse.json(earning, { status: 201 });
}

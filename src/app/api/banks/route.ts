import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bankSchema = z.object({ name: z.string().trim().min(1).max(80), details: z.string().trim().max(250).optional() });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = bankSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid bank name and details" }, { status: 400 });
  try {
    const bank = await prisma.bank.create({ data: { ...parsed.data, details: parsed.data.details || undefined, userId: (session.user as any).id } });
    return NextResponse.json(bank, { status: 201 });
  } catch {
    return NextResponse.json({ error: "A bank with this name already exists" }, { status: 409 });
  }
}
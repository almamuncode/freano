import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidBangladeshiPhone, normalizeBangladeshiPhone } from "@/lib/profile-validation";

const loanSchema = z.object({
  direction: z.enum(["LENT", "BORROWED"]),
  person: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  principal: z.number().positive(),
  interestRate: z.number().min(0).max(100),
  dueDate: z.string().optional(),
  note: z.string().trim().max(500).optional(),
});

async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user ? (session.user as any).id : null;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const existing = await prisma.loan.findFirst({ where: { id: params.id, userId } });
  if (!existing) return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  const parsed = loanSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter valid loan details" }, { status: 400 });
  const data = parsed.data;
  const phone = normalizeBangladeshiPhone(data.phone);
  if (!isValidBangladeshiPhone(phone)) return NextResponse.json({ error: "Enter a valid Bangladeshi mobile number" }, { status: 400 });
  const loan = await prisma.loan.update({ where: { id: params.id }, data: { ...data, phone, dueDate: data.dueDate ? new Date(data.dueDate) : null, note: data.note || null } });
  return NextResponse.json(loan);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const existing = await prisma.loan.findFirst({ where: { id: params.id, userId } });
  if (!existing) return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  await prisma.loan.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
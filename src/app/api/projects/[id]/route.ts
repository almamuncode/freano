import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidBangladeshiPhone, normalizeBangladeshiPhone } from "@/lib/profile-validation";

const updateSchema = z.object({ title: z.string().trim().min(1), client: z.string().trim().min(1), phone: z.string().trim().min(1), agreedAmount: z.number().positive(), paidAmount: z.number().min(0), dueDate: z.string().optional(), note: z.string().trim().max(500).optional() });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const project = await prisma.project.findFirst({ where: { id: params.id, userId: (session.user as any).id } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter valid project details" }, { status: 400 });
  const data = parsed.data;
  const phone = normalizeBangladeshiPhone(data.phone);
  if (!isValidBangladeshiPhone(phone)) return NextResponse.json({ error: "Enter a valid Bangladeshi mobile number" }, { status: 400 });
  const agreedAmount = data.agreedAmount ?? Number(project.agreedAmount);
  const paidAmount = data.paidAmount ?? Number(project.paidAmount);
  if (paidAmount > agreedAmount) return NextResponse.json({ error: "Paid amount cannot exceed the project amount" }, { status: 400 });
  const status = paidAmount === 0 ? "UNPAID" : paidAmount >= agreedAmount ? "PAID" : "PARTIAL";
  const updated = await prisma.project.update({ where: { id: project.id }, data: { ...data, phone, agreedAmount, paidAmount, status, dueDate: data.dueDate ? new Date(data.dueDate) : undefined, note: data.note || null } });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const project = await prisma.project.findFirst({ where: { id: params.id, userId: (session.user as any).id } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  await prisma.project.delete({ where: { id: project.id } });
  return NextResponse.json({ success: true });
}
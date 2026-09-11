import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const paymentSchema = z.object({ amount: z.number().positive(), note: z.string().trim().max(500).optional() });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const project = await prisma.project.findFirst({ where: { id: params.id, userId } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  const parsed = paymentSchema.safeParse(await req.json());
  if (!parsed.success || Number(project.paidAmount) + parsed.data.amount > Number(project.agreedAmount)) {
    return NextResponse.json({ error: "Payment is greater than the outstanding balance" }, { status: 400 });
  }
  const paidAmount = Number(project.paidAmount) + parsed.data.amount;
  const status = paidAmount >= Number(project.agreedAmount) - 0.01 ? "PAID" : "PARTIAL";
  const [payment] = await prisma.$transaction([
    prisma.projectPayment.create({ data: { amount: parsed.data.amount, note: parsed.data.note || null, projectId: project.id } }),
    prisma.project.update({ where: { id: project.id }, data: { paidAmount, status } }),
  ]);
  return NextResponse.json({ payment, paidAmount, status }, { status: 201 });
}
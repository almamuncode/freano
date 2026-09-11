import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidBangladeshiPhone, normalizeBangladeshiPhone } from "@/lib/profile-validation";

const projectSchema = z.object({
  title: z.string().trim().min(1),
  client: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  agreedAmount: z.number().positive(),
  paidAmount: z.number().min(0).default(0),
  dueDate: z.string().optional(),
  note: z.string().trim().max(500).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const projects = await prisma.project.findMany({ where: { userId: (session.user as any).id }, include: { payments: { orderBy: { paidAt: "desc" } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = projectSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter valid project details" }, { status: 400 });
  const data = parsed.data;
  const phone = normalizeBangladeshiPhone(data.phone);
  if (!isValidBangladeshiPhone(phone)) return NextResponse.json({ error: "Enter a valid Bangladeshi mobile number" }, { status: 400 });
  if (data.paidAmount > data.agreedAmount) return NextResponse.json({ error: "Paid amount cannot exceed the project amount" }, { status: 400 });
  const status = data.paidAmount === 0 ? "UNPAID" : data.paidAmount >= data.agreedAmount ? "PAID" : "PARTIAL";
  const project = await prisma.project.create({
    data: {
      title: data.title,
      client: data.client,
      phone,
      agreedAmount: data.agreedAmount,
      paidAmount: data.paidAmount,
      status,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      note: data.note || null,
      userId: (session.user as any).id,
    },
  });
  return NextResponse.json(project, { status: 201 });
}
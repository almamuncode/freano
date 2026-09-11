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
  interestRate: z.number().min(0).max(100).default(0),
  dueDate: z.string().optional(),
  note: z.string().trim().max(500).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const loans = await prisma.loan.findMany({
    where: { userId: (session.user as any).id },
    include: { payments: { orderBy: { paidAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(loans);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = loanSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter valid loan details" }, { status: 400 });
  const data = parsed.data;
  const phone = normalizeBangladeshiPhone(data.phone);
  if (!isValidBangladeshiPhone(phone)) return NextResponse.json({ error: "Enter a valid Bangladeshi mobile number" }, { status: 400 });
  const loan = await prisma.loan.create({
    data: {
      direction: data.direction,
      person: data.person,
      phone,
      principal: data.principal,
      interestRate: data.interestRate,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      note: data.note || null,
      userId: (session.user as any).id,
    },
  });
  return NextResponse.json(loan, { status: 201 });
}
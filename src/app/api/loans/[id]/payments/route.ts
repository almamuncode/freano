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
  const loan = await prisma.loan.findFirst({ where: { id: params.id, userId }, include: { payments: true } });
  if (!loan) return NextResponse.json({ error: "Loan not found" }, { status: 404 });

  const parsed = paymentSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid repayment amount" }, { status: 400 });
  const totalDue = Number(loan.principal) * (1 + Number(loan.interestRate) / 100);
  const paid = loan.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  if (parsed.data.amount > totalDue - paid + 0.01) {
    return NextResponse.json({ error: "Repayment cannot be greater than the remaining balance" }, { status: 400 });
  }

  const payment = await prisma.loanPayment.create({
    data: { amount: parsed.data.amount, note: parsed.data.note || null, loanId: loan.id },
  });
  await prisma.loan.update({
    where: { id: loan.id },
    data: { status: paid + parsed.data.amount >= totalDue - 0.01 ? "PAID" : "OPEN" },
  });
  return NextResponse.json(payment, { status: 201 });
}
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await prisma.bank.deleteMany({ where: { id: params.id, userId: (session.user as any).id } });
  if (!result.count) return NextResponse.json({ error: "Bank account not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
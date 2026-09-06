import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // An admin can't suspend or demote themselves by mistake through this screen
  if (params.id === (session.user as any).id) {
    return NextResponse.json({ error: "You can't change your own account here" }, { status: 400 });
  }

  const body = await req.json(); // expects { role?: "USER" | "ADMIN", isActive?: boolean }
  const updated = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(body.role ? { role: body.role } : {}),
      ...(typeof body.isActive === "boolean" ? { isActive: body.isActive } : {}),
    },
    select: { id: true, role: true, isActive: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (params.id === (session.user as any).id) {
    return NextResponse.json({ error: "You can't delete your own account here" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

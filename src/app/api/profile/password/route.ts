import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(6) });

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id }, select: { passwordHash: true } });
  if (!user || !(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  await prisma.user.update({ where: { id: (session.user as any).id }, data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10) } });
  return NextResponse.json({ message: "Password updated successfully" });
}

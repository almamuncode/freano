import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPasswordResetToken } from "@/lib/password-reset";

const schema = z.object({ token: z.string().min(1), password: z.string().min(6) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashPasswordResetToken(parsed.data.token) },
  });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "This reset link is invalid or expired" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash: await bcrypt.hash(parsed.data.password, 10) } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
  ]);

  return NextResponse.json({ message: "Password updated successfully" });
}

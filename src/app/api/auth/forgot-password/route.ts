import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/password-reset";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return NextResponse.json({ message: "If that email exists, a reset link has been created." });

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  const { token, tokenHash } = createPasswordResetToken();
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL ?? new URL(req.url).origin}/reset-password/${token}`;
  if (process.env.NODE_ENV !== "production") console.info(`Password reset link for ${user.email}: ${resetUrl}`);

  return NextResponse.json({
    message: "If that email exists, a reset link has been created.",
    ...(process.env.NODE_ENV !== "production" ? { resetUrl } : {}),
  });
}

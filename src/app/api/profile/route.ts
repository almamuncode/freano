import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  image: z
    .string()
    .max(70000, "Profile picture must be 50 KB or smaller")
    .refine((value) => value === "" || /^data:image\/(jpeg|png|gif|webp);base64,/.test(value), "Unsupported profile picture")
    .optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      phone: true,
      dateOfBirth: true,
      currency: true,
      role: true,
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    ...user,
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().slice(0, 10) : null,
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, phone, dateOfBirth, image } = parsed.data;

  if (!name && !email && !phone && !dateOfBirth && image === undefined) {
    return NextResponse.json({ error: "No profile fields provided" }, { status: 400 });
  }

  const normalizedPhone = phone?.trim() ? phone.trim() : null;
  const normalizedDateOfBirth = dateOfBirth && dateOfBirth.trim() ? new Date(dateOfBirth) : null;

  if (dateOfBirth && dateOfBirth.trim() && Number.isNaN(normalizedDateOfBirth?.getTime())) {
    return NextResponse.json({ error: "Invalid date of birth" }, { status: 400 });
  }

  if (email && email !== (session.user as any).email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== (session.user as any).id) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: (session.user as any).id },
    data: {
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
      ...(phone !== undefined ? { phone: normalizedPhone } : {}),
      ...(dateOfBirth !== undefined ? { dateOfBirth: normalizedDateOfBirth } : {}),
      ...(image !== undefined ? { image: image || null } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      phone: true,
      dateOfBirth: true,
      currency: true,
      role: true,
    },
  });

  return NextResponse.json({
    ...updatedUser,
    dateOfBirth: updatedUser.dateOfBirth ? updatedUser.dateOfBirth.toISOString().slice(0, 10) : null,
  });
}

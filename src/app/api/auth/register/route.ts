import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

// Default categories every new user starts with
const DEFAULT_CATEGORIES = [
  { name: "Client Payment", type: "INCOME" as const, icon: "💼" },
  { name: "Freelance Project", type: "INCOME" as const, icon: "💻" },
  { name: "Gift", type: "INCOME" as const, icon: "🎁" },
  { name: "Food", type: "EXPENSE" as const, icon: "🍔" },
  { name: "Transport", type: "EXPENSE" as const, icon: "🚌" },
  { name: "Family Support", type: "EXPENSE" as const, icon: "👨‍👩‍👧" },
  { name: "Rent", type: "EXPENSE" as const, icon: "🏠" },
  { name: "Utilities", type: "EXPENSE" as const, icon: "💡" },
  { name: "Software/Tools", type: "EXPENSE" as const, icon: "🛠️" },
  { name: "Other", type: "EXPENSE" as const, icon: "🔖" },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        categories: {
          create: DEFAULT_CATEGORIES.map((c) => ({ ...c, isDefault: true })),
        },
      },
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

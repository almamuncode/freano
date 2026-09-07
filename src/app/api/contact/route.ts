import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(200),
  message: z.string().trim().min(10, "Please write a little more in your message").max(5000),
});

export async function POST(request: Request) {
  const parsed = contactSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid form" }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error("Contact form email is not configured. Set RESEND_API_KEY and CONTACT_FROM_EMAIL.");
    return NextResponse.json({ error: "Contact form is temporarily unavailable. Please email mail@almamuncool.com directly." }, { status: 503 });
  }

  const { name, email, message } = parsed.data;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: ["mail@almamuncool.com"],
      reply_to: email,
      subject: `Freano contact message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    }),
  });

  if (!response.ok) {
    console.error("Resend rejected contact message", await response.text());
    return NextResponse.json({ error: "Unable to send your message right now. Please try again later." }, { status: 502 });
  }

  return NextResponse.json({ message: "Message sent" });
}
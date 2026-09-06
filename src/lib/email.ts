import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Freano <onboarding@resend.dev>",
    to,
    subject: "Reset your Freano password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Reset your password</h2>
        <p>We received a request to reset your Freano password. This link expires in 1 hour.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">
            Reset Password
          </a>
        </p>
        <p style="color:#666;font-size:13px;">
          If you didn't request this, you can safely ignore this email — your password won't change.
        </p>
      </div>
    `,
  });
}

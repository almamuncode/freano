import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/** Returns the admin's session, or null if the caller isn't a logged-in admin. */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session;
}

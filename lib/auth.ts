import { auth } from "@/auth";
import type { User } from "@/lib/types";

export async function getCurrentUser(): Promise<User | null> {
  if (process.env.DEV_USER_EMAIL) {
    return {
      email: process.env.DEV_USER_EMAIL,
      name: process.env.DEV_USER_NAME || process.env.DEV_USER_EMAIL
    };
  }

  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;

  return {
    email,
    name: session.user?.name || email
  };
}

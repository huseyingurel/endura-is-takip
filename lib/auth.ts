import type { User } from "@/lib/types";

export async function decrypt() {
  return null;
}

export async function getCurrentUser(): Promise<User | null> {
  if (process.env.DEV_USER_EMAIL) {
    return {
      email: process.env.DEV_USER_EMAIL,
      name: process.env.DEV_USER_NAME || process.env.DEV_USER_EMAIL
    };
  }

  return null;
}

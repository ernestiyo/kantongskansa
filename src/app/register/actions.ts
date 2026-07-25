"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, users } from "@/lib/db/schema";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { DEFAULT_CATEGORIES } from "@/lib/constants";

export type RegisterState = {
  error?: string;
};

export async function registerUser(
  input: RegisterInput,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const { name, email, password } = parsed.data;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return { error: "Email sudah terdaftar" };
  }

  const passwordHash = await hash(password, 10);

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning({ id: users.id });

  await db.insert(categories).values(
    DEFAULT_CATEGORIES.map((category) => ({
      userId: user.id,
      name: category.name,
      isDefault: true,
      budgetPercent: category.budgetPercent,
    })),
  );

  return {};
}

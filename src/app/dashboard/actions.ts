"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { categories, transactions, users } from "@/lib/db/schema";
import { monthlyIncomeSchema } from "@/lib/validations/onboarding";
import { transactionSchema, type TransactionInput } from "@/lib/validations/transaction";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";
import { budgetTargetFor } from "@/lib/budget";

type ActionState = { error?: string; warning?: string };

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function updateMonthlyIncome(
  input: unknown,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = monthlyIncomeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  await db
    .update(users)
    .set({ monthlyIncome: parsed.data.monthlyIncome.toString() })
    .where(eq(users.id, userId));

  revalidatePath("/dashboard");
  return {};
}

export async function createTransaction(
  input: TransactionInput,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { type, categoryId, amount, date, note } = parsed.data;

  const [category] = await db
    .select({
      id: categories.id,
      name: categories.name,
      budgetPercent: categories.budgetPercent,
      budgetAmount: categories.budgetAmount,
    })
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .limit(1);
  if (!category) return { error: "Kategori tidak ditemukan" };

  let warning: string | undefined;

  if (type === "expense") {
    const [user] = await db
      .select({ monthlyIncome: users.monthlyIncome })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const target = budgetTargetFor(category, Number(user.monthlyIncome));

    if (target !== null) {
      const [{ total }] = await db
        .select({
          total: sql<string>`coalesce(sum(${transactions.amount}), 0)`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.categoryId, categoryId),
            eq(transactions.type, "expense"),
          ),
        );
      const spentBefore = Number(total);
      const spentAfter = spentBefore + amount;
      if (spentBefore <= target && spentAfter > target) {
        warning = `Transaksi ini bikin kategori "${category.name}" jadi overbudget.`;
      }
    }
  }

  await db.insert(transactions).values({
    userId,
    categoryId,
    type,
    amount: amount.toString(),
    date,
    note: note || null,
  });

  revalidatePath("/dashboard");
  return { warning };
}

export async function updateTransaction(
  id: string,
  input: TransactionInput,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { type, categoryId, amount, date, note } = parsed.data;

  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .limit(1);
  if (!category) return { error: "Kategori tidak ditemukan" };

  const result = await db
    .update(transactions)
    .set({
      type,
      categoryId,
      amount: amount.toString(),
      date,
      note: note || null,
    })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning({ id: transactions.id });

  if (result.length === 0) return { error: "Transaksi tidak ditemukan" };

  revalidatePath("/dashboard");
  return {};
}

export async function deleteTransaction(id: string): Promise<ActionState> {
  const userId = await requireUserId();

  const result = await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning({ id: transactions.id });

  if (result.length === 0) return { error: "Transaksi tidak ditemukan" };

  revalidatePath("/dashboard");
  return {};
}

function budgetFieldsFromInput(input: CategoryInput) {
  return {
    budgetPercent:
      input.targetType === "percent" ? input.budgetPercent!.toString() : null,
    budgetAmount:
      input.targetType === "amount" ? input.budgetAmount!.toString() : null,
  };
}

export async function createCategory(
  input: CategoryInput,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  await db.insert(categories).values({
    userId,
    name: parsed.data.name,
    isDefault: false,
    ...budgetFieldsFromInput(parsed.data),
  });

  revalidatePath("/dashboard");
  return {};
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<ActionState> {
  const userId = await requireUserId();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const result = await db
    .update(categories)
    .set({
      name: parsed.data.name,
      ...budgetFieldsFromInput(parsed.data),
    })
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning({ id: categories.id });

  if (result.length === 0) return { error: "Kategori tidak ditemukan" };

  revalidatePath("/dashboard");
  return {};
}

export async function deleteCategory(id: string): Promise<ActionState> {
  const userId = await requireUserId();

  const [category] = await db
    .select({ isDefault: categories.isDefault })
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .limit(1);

  if (!category) return { error: "Kategori tidak ditemukan" };
  if (category.isDefault) {
    return { error: "Kategori default tidak bisa dihapus" };
  }

  try {
    await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
  } catch {
    return { error: "Kategori masih dipakai di transaksi, tidak bisa dihapus" };
  }

  revalidatePath("/dashboard");
  return {};
}

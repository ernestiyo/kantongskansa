import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, transactions, users } from "@/lib/db/schema";
import { buildCategoryBudgets } from "@/lib/budget";
import { buildMonthlyTrend } from "@/lib/trend";

export async function getDashboardData(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const userCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(desc(categories.isDefault), categories.createdAt);

  const userTransactions = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      amount: transactions.amount,
      date: transactions.date,
      note: transactions.note,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date), desc(transactions.createdAt));

  const monthlyIncome = Number(user.monthlyIncome);
  const totalIncome = userTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = userTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const saldo = monthlyIncome + totalIncome - totalExpense;

  const expenseByCategory = new Map<string, number>();
  for (const t of userTransactions) {
    if (t.type !== "expense") continue;
    expenseByCategory.set(
      t.categoryId,
      (expenseByCategory.get(t.categoryId) ?? 0) + Number(t.amount),
    );
  }
  const categoryBudgets = buildCategoryBudgets(
    userCategories,
    expenseByCategory,
    monthlyIncome,
  );
  const monthlyTrendPoints = buildMonthlyTrend(userTransactions);

  return {
    user,
    categories: userCategories,
    transactions: userTransactions,
    monthlyIncome,
    totalIncome,
    totalExpense,
    saldo,
    categoryBudgets,
    monthlyTrendPoints,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

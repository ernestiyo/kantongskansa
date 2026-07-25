import { eq, desc } from "drizzle-orm";
import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { categories, transactions, users } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { buildCategoryBudgets } from "@/lib/budget";
import { buildMonthlyTrend } from "@/lib/trend";
import { IncomeForm } from "./income-form";
import { CategoryForm } from "./category-form";
import { CategoryList } from "./category-list";
import { TransactionForm } from "./transaction-form";
import { TransactionList } from "./transaction-list";
import { TransactionFilters } from "./transaction-filters";
import { BudgetDonut } from "./budget-donut";
import { MonthlyTrend } from "./monthly-trend";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; from?: string; to?: string }>;
}) {
  const session = await auth();
  const userId = session!.user.id;
  const filters = await searchParams;

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

  const userTransactionsRaw = await db
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
  const totalIncome = userTransactionsRaw
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = userTransactionsRaw
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const saldo = monthlyIncome + totalIncome - totalExpense;

  const categoryOptions = userCategories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  const expenseByCategory = new Map<string, number>();
  for (const t of userTransactionsRaw) {
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
  const overBudgetCategories = categoryBudgets.filter((c) => c.isOverBudget);
  const monthlyTrendPoints = buildMonthlyTrend(userTransactionsRaw);

  const categoryFilter =
    filters.category && filters.category !== "all" ? filters.category : null;
  const fromFilter = filters.from || null;
  const toFilter = filters.to || null;
  const filteredTransactions = userTransactionsRaw.filter((t) => {
    if (categoryFilter && t.categoryId !== categoryFilter) return false;
    if (fromFilter && t.date < fromFilter) return false;
    if (toFilter && t.date > toFilter) return false;
    return true;
  });

  const needsOnboarding = monthlyIncome === 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Halo, {user.name} 👋</h1>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <Button type="submit" variant="outline" size="sm">
            Keluar
          </Button>
        </form>
      </div>

      {needsOnboarding ? (
        <Card>
          <CardContent className="space-y-3">
            <p className="font-medium">
              Yuk mulai dengan input saldo awal / pemasukan bulananmu.
            </p>
            <p className="text-sm text-muted-foreground">
              Ini jadi basis hitung alokasi 50/30/20 dan saldo berjalanmu.
            </p>
            <IncomeForm
              currentIncome={monthlyIncome}
              triggerLabel="Input saldo awal"
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-1">
            <p className="text-sm text-muted-foreground">Saldo saat ini</p>
            <p
              className={`text-2xl font-semibold ${saldo < 0 ? "text-destructive" : ""}`}
            >
              {formatRupiah(saldo)}
            </p>
            {saldo < 0 && (
              <p className="text-sm text-destructive">
                Pengeluaran sudah melebihi pemasukan.
              </p>
            )}
            {overBudgetCategories.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-sm text-muted-foreground">
                  Overbudget:
                </span>
                {overBudgetCategories.map((c) => (
                  <Badge key={c.id} variant="destructive">
                    {c.name}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
              <span>Pemasukan bulanan: {formatRupiah(monthlyIncome)}</span>
              <span>Total pemasukan: {formatRupiah(totalIncome)}</span>
              <span>Total pengeluaran: {formatRupiah(totalExpense)}</span>
            </div>
            <div className="pt-2">
              <IncomeForm
                currentIncome={monthlyIncome}
                triggerLabel="Ubah saldo awal"
                variant="outline"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <section className="space-y-3">
        <h2 className="font-medium">Breakdown 50/30/20</h2>
        <Card>
          <CardContent>
            <BudgetDonut categories={categoryBudgets} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Kategori</h2>
          <CategoryForm triggerLabel="Tambah kategori" variant="outline" />
        </div>
        <CategoryList categories={categoryBudgets} />
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Tren bulanan</h2>
        <Card>
          <CardContent>
            <MonthlyTrend points={monthlyTrendPoints} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Transaksi</h2>
          <TransactionForm
            categories={categoryOptions}
            triggerLabel="Tambah transaksi"
          />
        </div>
        <TransactionFilters categories={categoryOptions} />
        <TransactionList
          transactions={filteredTransactions}
          categories={categoryOptions}
          hasAnyTransactions={userTransactionsRaw.length > 0}
        />
      </section>
    </div>
  );
}

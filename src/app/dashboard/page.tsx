import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatRupiah } from "@/lib/format";
import { getDashboardData } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { IncomeForm } from "./income-form";
import { CategoryForm } from "./category-form";
import { CategoryList } from "./category-list";
import { TransactionForm } from "./transaction-form";
import { BudgetDonut } from "./budget-donut";
import { MonthlyTrend } from "./monthly-trend";
import { ReportLinks } from "./report-links";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const {
    user,
    categories: userCategories,
    transactions: userTransactionsRaw,
    monthlyIncome,
    totalIncome,
    totalExpense,
    saldo,
    categoryBudgets,
    monthlyTrendPoints,
  } = await getDashboardData(userId);

  const categoryOptions = userCategories.map((c) => ({
    id: c.id,
    name: c.name,
  }));
  const overBudgetCategories = categoryBudgets.filter((c) => c.isOverBudget);
  const recentTransactions = userTransactionsRaw.slice(0, 3);

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

      {!needsOnboarding && <ReportLinks />}

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
        <Card className="bg-gradient-to-br from-primary/12 via-card to-card ring-primary/15">
          <CardContent className="space-y-1">
            <p className="text-sm text-muted-foreground">Saldo saat ini</p>
            <p
              className={`text-2xl font-semibold ${saldo < 0 ? "text-destructive" : "text-primary"}`}
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
        <h2 className="flex items-center gap-2 font-medium">
          <span className="size-1.5 rounded-full bg-primary" />
          Breakdown 50/30/20
        </h2>
        <Card>
          <CardContent>
            <BudgetDonut categories={categoryBudgets} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            Kategori
          </h2>
          <CategoryForm triggerLabel="Tambah kategori" variant="outline" />
        </div>
        <CategoryList categories={categoryBudgets} />
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-medium">
          <span className="size-1.5 rounded-full bg-primary" />
          Tren bulanan
        </h2>
        <Card>
          <CardContent>
            <MonthlyTrend points={monthlyTrendPoints} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            Transaksi
          </h2>
          <TransactionForm
            categories={categoryOptions}
            triggerLabel="Tambah transaksi"
          />
        </div>
        <Card>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {userTransactionsRaw.length} transaksi tercatat
            </p>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada transaksi. Tambahkan transaksi pertamamu.
              </p>
            ) : (
              <ul className="divide-y">
                {recentTransactions.map((tx) => (
                  <li
                    key={tx.id}
                    className="flex items-center justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {tx.categoryName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.date)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 font-medium",
                        tx.type === "income"
                          ? "text-primary"
                          : "text-foreground",
                      )}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatRupiah(Number(tx.amount))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/dashboard/transactions"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-full",
              )}
            >
              Lihat semua transaksi
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

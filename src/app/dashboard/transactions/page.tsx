import Link from "next/link";
import { auth } from "@/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TransactionForm } from "../transaction-form";
import { TransactionList } from "../transaction-list";
import { TransactionFilters } from "../transaction-filters";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; from?: string; to?: string }>;
}) {
  const session = await auth();
  const userId = session!.user.id;
  const filters = await searchParams;

  const { categories: userCategories, transactions: userTransactionsRaw } =
    await getDashboardData(userId);

  const categoryOptions = userCategories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

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

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Kembali ke dashboard
        </Link>
        <TransactionForm
          categories={categoryOptions}
          triggerLabel="Tambah transaksi"
        />
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Semua transaksi</h1>
        <p className="text-sm text-muted-foreground">
          {userTransactionsRaw.length} transaksi tercatat
        </p>
      </div>

      <section className="space-y-3">
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

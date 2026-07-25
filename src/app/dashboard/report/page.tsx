import Link from "next/link";
import { auth } from "@/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import { formatDate, formatRupiah } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PrintButton } from "./print-button";

export default async function ReportPage() {
  const session = await auth();
  const userId = session!.user.id;

  const { user, monthlyIncome, totalIncome, totalExpense, saldo, categoryBudgets, transactions } =
    await getDashboardData(userId);

  const printedAt = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 print:max-w-none print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Kembali ke dashboard
        </Link>
        <PrintButton />
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Laporan Keuangan</h1>
        <p className="text-sm text-muted-foreground">
          {user.name} &middot; dicetak {printedAt}
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="font-medium">Ringkasan</h2>
        <table className="w-full border-collapse text-sm">
          <tbody>
            <tr className="border-b">
              <td className="py-1.5 pr-2 text-muted-foreground">Saldo saat ini</td>
              <td className="py-1.5 pl-2 text-right font-medium">{formatRupiah(saldo)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-1.5 pr-2 text-muted-foreground">
                Pemasukan bulanan / saldo awal
              </td>
              <td className="py-1.5 pl-2 text-right">{formatRupiah(monthlyIncome)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-1.5 pr-2 text-muted-foreground">Total pemasukan</td>
              <td className="py-1.5 pl-2 text-right">{formatRupiah(totalIncome)}</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-2 text-muted-foreground">Total pengeluaran</td>
              <td className="py-1.5 pl-2 text-right">{formatRupiah(totalExpense)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="space-y-2 overflow-x-auto">
        <h2 className="font-medium">Breakdown Kategori</h2>
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-1.5 pr-2 font-normal">Kategori</th>
              <th className="px-2 py-1.5 font-normal">Target</th>
              <th className="px-2 py-1.5 text-right font-normal">Realisasi</th>
              <th className="py-1.5 pl-2 text-right font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {categoryBudgets.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="py-1.5 pr-2">{c.name}</td>
                <td className="px-2 py-1.5">
                  {c.target === null ? "Tanpa target" : formatRupiah(c.target)}
                </td>
                <td className="px-2 py-1.5 text-right">{formatRupiah(c.spent)}</td>
                <td className="py-1.5 pl-2 text-right">
                  {c.isOverBudget ? "Overbudget" : "OK"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-2 overflow-x-auto">
        <h2 className="font-medium">Riwayat Transaksi</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada transaksi.</p>
        ) : (
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-1.5 pr-2 font-normal">Tanggal</th>
                <th className="px-2 py-1.5 font-normal">Tipe</th>
                <th className="px-2 py-1.5 font-normal">Kategori</th>
                <th className="px-2 py-1.5 text-right font-normal">Nominal</th>
                <th className="py-1.5 pl-2 font-normal">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="py-1.5 pr-2 whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="px-2 py-1.5">
                    {t.type === "income" ? "Pemasukan" : "Pengeluaran"}
                  </td>
                  <td className="px-2 py-1.5">{t.categoryName}</td>
                  <td className="px-2 py-1.5 text-right whitespace-nowrap">
                    {t.type === "income" ? "+" : "-"}
                    {formatRupiah(Number(t.amount))}
                  </td>
                  <td className="py-1.5 pl-2 text-muted-foreground">{t.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

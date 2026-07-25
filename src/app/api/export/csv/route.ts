import { auth } from "@/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import { toCsvDocument } from "@/lib/csv";
import { formatDate } from "@/lib/format";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const {
    user,
    monthlyIncome,
    totalIncome,
    totalExpense,
    saldo,
    categoryBudgets,
    transactions,
  } = await getDashboardData(session.user.id);

  const rows: (string | number)[][] = [
    ["Ringkasan KantongSkansa"],
    ["Nama", user.name],
    ["Saldo saat ini", saldo],
    ["Pemasukan bulanan / saldo awal", monthlyIncome],
    ["Total pemasukan", totalIncome],
    ["Total pengeluaran", totalExpense],
    [],
    ["Breakdown Kategori"],
    ["Kategori", "Target", "Realisasi", "Status"],
    ...categoryBudgets.map((c) => [
      c.name,
      c.target === null ? "Tanpa target" : c.target,
      c.spent,
      c.isOverBudget ? "Overbudget" : "OK",
    ]),
    [],
    ["Riwayat Transaksi"],
    ["Tanggal", "Tipe", "Kategori", "Nominal", "Catatan"],
    ...transactions.map((t) => [
      formatDate(t.date),
      t.type === "income" ? "Pemasukan" : "Pengeluaran",
      t.categoryName,
      t.amount,
      t.note ?? "",
    ]),
  ];

  const csv = "﻿" + toCsvDocument(rows);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kantongskansa-${user.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.csv"`,
    },
  });
}

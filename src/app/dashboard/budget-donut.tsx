"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatRupiah } from "@/lib/format";
import type { CategoryWithBudget } from "@/lib/budget";

export function BudgetDonut({
  categories,
}: {
  categories: CategoryWithBudget[];
}) {
  const slices = categories.filter((c) => c.spent > 0);
  const totalSpent = slices.reduce((sum, c) => sum + c.spent, 0);

  if (totalSpent === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada pengeluaran tercatat. Breakdown realisasi muncul di sini
        setelah kamu menambah transaksi pengeluaran.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="h-48 w-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="spent"
              nameKey="name"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={slices.length > 1 ? 2 : 0}
              stroke="var(--card)"
              strokeWidth={2}
            >
              {slices.map((entry) => (
                <Cell key={entry.id} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                formatRupiah(Number(value)),
                String(name),
              ]}
              contentStyle={{
                fontSize: 13,
                borderRadius: 8,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full space-y-1.5 text-sm">
        {slices
          .slice()
          .sort((a, b) => b.spent - a.spent)
          .map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 truncate">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <span className="truncate">{c.name}</span>
              </span>
              <span className="shrink-0 text-muted-foreground">
                {formatRupiah(c.spent)} (
                {Math.round((c.spent / totalSpent) * 100)}%)
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}

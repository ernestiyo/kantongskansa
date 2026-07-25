"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatRupiah } from "@/lib/format";
import { CATEGORY_COLORS } from "@/lib/budget";
import type { MonthlyTrendPoint } from "@/lib/trend";

const INCOME_COLOR = CATEGORY_COLORS[0];
const EXPENSE_COLOR = CATEGORY_COLORS[1];

export function MonthlyTrend({ points }: { points: MonthlyTrendPoint[] }) {
  if (points.length < 2) {
    return (
      <p className="text-sm text-muted-foreground">
        Grafik tren muncul setelah kamu punya transaksi di minimal 2 bulan
        berbeda.
      </p>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ left: 8, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            tickFormatter={(value: number) =>
              value >= 1000 ? `${Math.round(value / 1000)}rb` : String(value)
            }
          />
          <Tooltip
            formatter={(value) => formatRupiah(Number(value))}
            contentStyle={{ fontSize: 13, borderRadius: 8 }}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Line
            type="monotone"
            dataKey="income"
            name="Pemasukan"
            stroke={INCOME_COLOR}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name="Pengeluaran"
            stroke={EXPENSE_COLOR}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

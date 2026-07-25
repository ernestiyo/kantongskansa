const monthLabelFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "short",
  year: "numeric",
});

export type MonthlyTrendPoint = {
  month: string;
  label: string;
  income: number;
  expense: number;
};

export function buildMonthlyTrend(
  transactions: { type: "income" | "expense"; amount: string; date: string }[],
): MonthlyTrendPoint[] {
  const byMonth = new Map<string, { income: number; expense: number }>();

  for (const t of transactions) {
    const month = t.date.slice(0, 7);
    const bucket = byMonth.get(month) ?? { income: 0, expense: 0 };
    if (t.type === "income") {
      bucket.income += Number(t.amount);
    } else {
      bucket.expense += Number(t.amount);
    }
    byMonth.set(month, bucket);
  }

  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, totals]) => ({
      month,
      label: monthLabelFormatter.format(new Date(`${month}-01T00:00:00`)),
      ...totals,
    }));
}

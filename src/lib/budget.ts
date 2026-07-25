export const CATEGORY_COLORS = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
];
export const OTHER_COLOR = "#898781";

export type CategoryWithBudget = {
  id: string;
  name: string;
  isDefault: boolean;
  budgetPercent: string | null;
  budgetAmount: string | null;
  spent: number;
  target: number | null;
  isOverBudget: boolean;
  color: string;
};

export function budgetTargetFor(
  category: { budgetPercent: string | null; budgetAmount: string | null },
  monthlyIncome: number,
): number | null {
  if (category.budgetPercent !== null) {
    return (Number(category.budgetPercent) / 100) * monthlyIncome;
  }
  if (category.budgetAmount !== null) {
    return Number(category.budgetAmount);
  }
  return null;
}

export function buildCategoryBudgets(
  categories: {
    id: string;
    name: string;
    isDefault: boolean;
    budgetPercent: string | null;
    budgetAmount: string | null;
  }[],
  expenseByCategory: Map<string, number>,
  monthlyIncome: number,
): CategoryWithBudget[] {
  return categories.map((category, index) => {
    const spent = expenseByCategory.get(category.id) ?? 0;
    const target = budgetTargetFor(category, monthlyIncome);
    return {
      ...category,
      spent,
      target,
      isOverBudget: target !== null && spent > target,
      color:
        index < CATEGORY_COLORS.length
          ? CATEGORY_COLORS[index]
          : OTHER_COLOR,
    };
  });
}

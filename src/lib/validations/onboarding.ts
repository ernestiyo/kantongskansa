import { z } from "zod";

export const monthlyIncomeSchema = z.object({
  monthlyIncome: z.coerce
    .number({ error: "Nominal wajib diisi" })
    .min(0, "Nominal tidak boleh negatif"),
});

export type MonthlyIncomeInput = z.infer<typeof monthlyIncomeSchema>;
export type MonthlyIncomeFormInput = z.input<typeof monthlyIncomeSchema>;

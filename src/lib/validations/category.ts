import { z } from "zod";

export const categorySchema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter"),
    targetType: z.enum(["none", "percent", "amount"]),
    budgetPercent: z.coerce.number().min(0).max(100).optional(),
    budgetAmount: z.coerce.number().min(0).optional(),
  })
  .refine(
    (data) => data.targetType !== "percent" || data.budgetPercent !== undefined,
    { message: "Persentase target wajib diisi", path: ["budgetPercent"] },
  )
  .refine(
    (data) => data.targetType !== "amount" || data.budgetAmount !== undefined,
    { message: "Nominal target wajib diisi", path: ["budgetAmount"] },
  );

export type CategoryInput = z.infer<typeof categorySchema>;
export type CategoryFormInput = z.input<typeof categorySchema>;

import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"], { error: "Tipe wajib dipilih" }),
  categoryId: z.uuid("Kategori wajib dipilih"),
  amount: z.coerce
    .number({ error: "Nominal wajib diisi" })
    .positive("Nominal harus lebih dari 0"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  note: z.string().trim().max(200, "Catatan maksimal 200 karakter").optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type TransactionFormInput = z.input<typeof transactionSchema>;

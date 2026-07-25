"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  transactionSchema,
  type TransactionInput,
  type TransactionFormInput,
} from "@/lib/validations/transaction";
import { createTransaction, updateTransaction } from "./actions";

type CategoryOption = { id: string; name: string };

type ExistingTransaction = {
  id: string;
  type: "income" | "expense";
  categoryId: string;
  amount: string;
  date: string;
  note: string | null;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionForm({
  categories,
  transaction,
  triggerLabel,
  variant = "default",
}: {
  categories: CategoryOption[];
  transaction?: ExistingTransaction;
  triggerLabel: string;
  variant?: "default" | "outline" | "ghost";
}) {
  const [open, setOpen] = useState(false);
  const isEdit = !!transaction;

  const defaultValues: TransactionFormInput = transaction
    ? {
        type: transaction.type,
        categoryId: transaction.categoryId,
        amount: Number(transaction.amount),
        date: transaction.date,
        note: transaction.note ?? "",
      }
    : {
        type: "expense",
        categoryId: categories[0]?.id ?? "",
        amount: 0,
        date: todayIso(),
        note: "",
      };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormInput, unknown, TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues,
  });

  const onSubmit = async (data: TransactionInput) => {
    const result = isEdit
      ? await updateTransaction(transaction.id, data)
      : await createTransaction(data);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Transaksi diperbarui" : "Transaksi ditambahkan");
    if (result.warning) toast.warning(result.warning);
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) reset(defaultValues);
      }}
    >
      <DialogTrigger className={cn(buttonVariants({ variant }))}>
        {triggerLabel}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit transaksi" : "Tambah transaksi"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipe</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Pengeluaran</SelectItem>
                    <SelectItem value="income">Pemasukan</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-sm text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Nominal (Rp)</Label>
            <Input
              id="amount"
              type="number"
              inputMode="numeric"
              step="1"
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Catatan (opsional)</Label>
            <Textarea id="note" rows={2} {...register("note")} />
            {errors.note && (
              <p className="text-sm text-destructive">{errors.note.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  categorySchema,
  type CategoryInput,
  type CategoryFormInput,
} from "@/lib/validations/category";
import { createCategory, updateCategory } from "./actions";

type ExistingCategory = {
  id: string;
  name: string;
  budgetPercent: string | null;
  budgetAmount: string | null;
};

function targetTypeFor(category?: ExistingCategory): CategoryInput["targetType"] {
  if (!category) return "percent";
  if (category.budgetPercent !== null) return "percent";
  if (category.budgetAmount !== null) return "amount";
  return "none";
}

export function CategoryForm({
  category,
  triggerLabel,
  variant = "default",
}: {
  category?: ExistingCategory;
  triggerLabel: string;
  variant?: "default" | "outline" | "ghost";
}) {
  const [open, setOpen] = useState(false);
  const isEdit = !!category;

  const defaultValues: CategoryFormInput = {
    name: category?.name ?? "",
    targetType: targetTypeFor(category),
    budgetPercent: category?.budgetPercent
      ? Number(category.budgetPercent)
      : undefined,
    budgetAmount: category?.budgetAmount
      ? Number(category.budgetAmount)
      : undefined,
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormInput, unknown, CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });

  const targetType = watch("targetType");

  const onSubmit = async (data: CategoryInput) => {
    const result = isEdit
      ? await updateCategory(category.id, data)
      : await createCategory(data);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Kategori diperbarui" : "Kategori ditambahkan");
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
            {isEdit ? "Edit kategori" : "Tambah kategori"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama kategori</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Target alokasi</Label>
            <Controller
              name="targetType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih jenis target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">
                      % dari pemasukan
                    </SelectItem>
                    <SelectItem value="amount">Nominal tetap</SelectItem>
                    <SelectItem value="none">Tanpa target</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {targetType === "percent" && (
            <div className="space-y-2">
              <Label htmlFor="budgetPercent">Persentase target (%)</Label>
              <Input
                id="budgetPercent"
                type="number"
                inputMode="numeric"
                step="1"
                {...register("budgetPercent")}
              />
              {errors.budgetPercent && (
                <p className="text-sm text-destructive">
                  {errors.budgetPercent.message}
                </p>
              )}
            </div>
          )}

          {targetType === "amount" && (
            <div className="space-y-2">
              <Label htmlFor="budgetAmount">Nominal target (Rp)</Label>
              <Input
                id="budgetAmount"
                type="number"
                inputMode="numeric"
                step="1"
                {...register("budgetAmount")}
              />
              {errors.budgetAmount && (
                <p className="text-sm text-destructive">
                  {errors.budgetAmount.message}
                </p>
              )}
            </div>
          )}

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

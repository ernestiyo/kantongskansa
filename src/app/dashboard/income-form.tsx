"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  monthlyIncomeSchema,
  type MonthlyIncomeInput,
  type MonthlyIncomeFormInput,
} from "@/lib/validations/onboarding";
import { updateMonthlyIncome } from "./actions";

export function IncomeForm({
  currentIncome,
  triggerLabel,
  variant = "default",
}: {
  currentIncome: number;
  triggerLabel: string;
  variant?: "default" | "outline" | "ghost" | "link";
}) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MonthlyIncomeFormInput, unknown, MonthlyIncomeInput>({
    resolver: zodResolver(monthlyIncomeSchema),
    defaultValues: { monthlyIncome: currentIncome },
  });

  const onSubmit = async (data: MonthlyIncomeInput) => {
    const result = await updateMonthlyIncome(data);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Saldo awal tersimpan");
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) reset({ monthlyIncome: currentIncome });
      }}
    >
      <DialogTrigger className={cn(buttonVariants({ variant }))}>
        {triggerLabel}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Saldo awal / pemasukan bulanan</DialogTitle>
          <DialogDescription>
            Ini jadi basis hitung alokasi 50/30/20 kamu.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="monthlyIncome">Nominal (Rp)</Label>
            <Input
              id="monthlyIncome"
              type="number"
              inputMode="numeric"
              step="1"
              {...register("monthlyIncome")}
            />
            {errors.monthlyIncome && (
              <p className="text-sm text-destructive">
                {errors.monthlyIncome.message}
              </p>
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

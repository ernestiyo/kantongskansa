"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatRupiah } from "@/lib/format";
import type { CategoryWithBudget } from "@/lib/budget";
import { deleteCategory } from "./actions";
import { CategoryForm } from "./category-form";

function targetLabel(category: CategoryWithBudget) {
  if (category.budgetPercent !== null) {
    return `${Number(category.budgetPercent)}% dari pemasukan`;
  }
  if (category.budgetAmount !== null) {
    return `Target ${formatRupiah(Number(category.budgetAmount))}`;
  }
  return "Tanpa target";
}

function DeleteCategoryButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const onConfirm = async () => {
    setPending(true);
    const result = await deleteCategory(id);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Kategori dihapus");
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Hapus
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus kategori ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Kategori yang masih punya transaksi tidak bisa dihapus.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function CategoryList({
  categories,
}: {
  categories: CategoryWithBudget[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        const progress =
          category.target && category.target > 0
            ? Math.min((category.spent / category.target) * 100, 100)
            : 0;

        return (
          <Card key={category.id}>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 font-medium">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </p>
                {category.isOverBudget && (
                  <Badge variant="destructive">Overbudget</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {targetLabel(category)}
              </p>
              {category.target !== null && (
                <>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${category.isOverBudget ? "bg-destructive" : "bg-primary"}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Terpakai {formatRupiah(category.spent)} dari{" "}
                    {formatRupiah(category.target)}
                  </p>
                </>
              )}
              <div className="flex items-center justify-between pt-1">
                {category.isDefault ? (
                  <span className="text-xs text-muted-foreground">
                    Default
                  </span>
                ) : (
                  <span />
                )}
                <div className="flex gap-1">
                  <CategoryForm
                    category={category}
                    triggerLabel="Edit"
                    variant="ghost"
                  />
                  {!category.isDefault && (
                    <DeleteCategoryButton id={category.id} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

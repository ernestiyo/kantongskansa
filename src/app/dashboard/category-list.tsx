"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { deleteCategory } from "./actions";
import { CategoryForm } from "./category-form";

type CategoryRow = {
  id: string;
  name: string;
  isDefault: boolean;
  budgetPercent: string | null;
  budgetAmount: string | null;
};

function targetLabel(category: CategoryRow) {
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

export function CategoryList({ categories }: { categories: CategoryRow[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Card key={category.id}>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium">{category.name}</p>
              {category.isDefault && (
                <span className="text-xs text-muted-foreground">Default</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {targetLabel(category)}
            </p>
            <div className="flex gap-1 pt-1">
              <CategoryForm
                category={category}
                triggerLabel="Edit"
                variant="ghost"
              />
              {!category.isDefault && <DeleteCategoryButton id={category.id} />}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

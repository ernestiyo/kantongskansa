"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { formatDate, formatRupiah } from "@/lib/format";
import { deleteTransaction } from "./actions";
import { TransactionForm } from "./transaction-form";

type CategoryOption = { id: string; name: string };

type TransactionRow = {
  id: string;
  type: "income" | "expense";
  categoryId: string;
  categoryName: string;
  amount: string;
  date: string;
  note: string | null;
};

function DeleteTransactionButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const onConfirm = async () => {
    setPending(true);
    const result = await deleteTransaction(id);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Transaksi dihapus");
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Hapus
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus transaksi ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak bisa dibatalkan.
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

export function TransactionList({
  transactions,
  categories,
}: {
  transactions: TransactionRow[];
  categories: CategoryOption[];
}) {
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada transaksi. Tambahkan transaksi pertamamu.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Catatan</TableHead>
            <TableHead className="text-right">Nominal</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="whitespace-nowrap">
                {formatDate(tx.date)}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span>{tx.categoryName}</span>
                  <Badge
                    variant={tx.type === "income" ? "default" : "secondary"}
                    className="w-fit"
                  >
                    {tx.type === "income" ? "Pemasukan" : "Pengeluaran"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="max-w-40 truncate text-muted-foreground">
                {tx.note || "-"}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                {tx.type === "income" ? "+" : "-"}
                {formatRupiah(Number(tx.amount))}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <TransactionForm
                    categories={categories}
                    transaction={tx}
                    triggerLabel="Edit"
                    variant="ghost"
                  />
                  <DeleteTransactionButton id={tx.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

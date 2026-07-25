"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CategoryOption = { id: string; name: string };

export function TransactionFilters({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "all";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const hasFilter = category !== "all" || from !== "" || to !== "";

  const categoryItems = [
    { label: "Semua kategori", value: "all" },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ];

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Kategori</label>
        <Select
          value={category}
          onValueChange={(v) => updateParam("category", v ?? "all")}
          items={categoryItems}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua kategori</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Dari</label>
        <Input
          type="date"
          value={from}
          onChange={(e) => updateParam("from", e.target.value)}
          className="w-36"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Sampai</label>
        <Input
          type="date"
          value={to}
          onChange={(e) => updateParam("to", e.target.value)}
          className="w-36"
        />
      </div>
      {hasFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(pathname, { scroll: false })}
        >
          Reset filter
        </Button>
      )}
    </div>
  );
}

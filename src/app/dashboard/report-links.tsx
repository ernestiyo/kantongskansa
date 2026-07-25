import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReportLinks() {
  return (
    <div className="flex flex-wrap gap-2">
      <a href="/api/export/csv" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
        Export CSV
      </a>
      <Link
        href="/dashboard/report"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        Cetak laporan
      </Link>
    </div>
  );
}

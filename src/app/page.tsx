import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">KantongSkansa</h1>
        <p className="text-muted-foreground">
          Catat & pantau uang sakumu, gampang dari HP.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/register" className={cn(buttonVariants())}>
          Daftar
        </Link>
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Masuk
        </Link>
      </div>
    </div>
  );
}

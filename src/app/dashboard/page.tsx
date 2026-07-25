import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-lg space-y-4 p-6">
      <h1 className="text-2xl font-semibold">
        Halo, {session?.user?.name} 👋
      </h1>
      <p className="text-muted-foreground">
        Dashboard lengkap (saldo, breakdown 50/30/20, grafik) menyusul.
      </p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <Button type="submit" variant="outline">
          Keluar
        </Button>
      </form>
    </div>
  );
}

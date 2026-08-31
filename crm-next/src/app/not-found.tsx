import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <div className="text-6xl font-bold tracking-tight text-primary">404</div>
      <div>
        <h1 className="text-xl font-semibold">Nie znaleziono strony</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sprawdź adres URL lub wróć do panelu.
        </p>
      </div>
      <Button render={<Link href="/dashboard" />} nativeButton={false}>
        Wróć do Dashboardu
      </Button>
    </div>
  );
}

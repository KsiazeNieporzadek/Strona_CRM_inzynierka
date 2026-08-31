"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { login, type LoginFormState } from "@/app/login-actions";

const initialState: LoginFormState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-card p-10 shadow-2xl shadow-black/10 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:shadow-black/50">
        <h1 className="mb-1 text-center text-3xl font-bold bg-gradient-to-r from-primary to-[var(--primary-glow)] bg-clip-text text-transparent">
          CRM System
        </h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Zaloguj się, aby kontynuować
        </p>
        <form action={formAction} className="space-y-6">
          <div>
            <Label className="mb-2 block text-foreground">E-mail</Label>
            <Input
              type="email"
              name="email"
              placeholder="Wprowadź e-mail"
              className="h-12 rounded-2xl px-4 text-base"
            />
          </div>
          <div>
            <Label className="mb-2 block text-foreground">Hasło</Label>
            <Input
              type="password"
              name="password"
              placeholder="Wprowadź hasło"
              className="h-12 rounded-2xl px-4 text-base"
            />
          </div>
          {state.error && (
            <p className="text-center text-sm text-destructive">
              {state.error}
            </p>
          )}
          <Button
            type="submit"
            disabled={pending}
            className="h-12 w-full text-base"
          >
            {pending ? "Logowanie..." : "Zaloguj się"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Demo: admin@crm.local / admin123
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          © 2026 CRM System. Wszelkie prawa zastrzeżone.
        </p>
      </div>
    </div>
  );
}

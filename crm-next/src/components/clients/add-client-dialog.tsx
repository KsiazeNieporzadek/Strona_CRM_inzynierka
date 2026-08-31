"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient, type ClientFormState } from "@/app/clients/actions";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = ["Aktywny", "Lejek sprzedażowy", "Windykacja"];

const initialState: ClientFormState = { errors: {}, success: false };

function AddClientForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction, pending] = useActionState(
    createClient,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      const timeout = setTimeout(onSuccess, 900);
      return () => clearTimeout(timeout);
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label className="mb-2 block">
            Imię <span className="text-destructive">*</span>
          </Label>
          <Input
            name="firstName"
            className={cn(state.errors.firstName && "border-destructive")}
          />
          {state.errors.firstName && (
            <p className="mt-1 text-xs text-destructive">
              {state.errors.firstName}
            </p>
          )}
        </div>

        <div>
          <Label className="mb-2 block">
            Nazwisko <span className="text-destructive">*</span>
          </Label>
          <Input
            name="lastName"
            className={cn(state.errors.lastName && "border-destructive")}
          />
          {state.errors.lastName && (
            <p className="mt-1 text-xs text-destructive">
              {state.errors.lastName}
            </p>
          )}
        </div>

        <div>
          <Label className="mb-2 block">
            Status umowy <span className="text-destructive">*</span>
          </Label>
          <Select name="status">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Wybierz status..." />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors.status && (
            <p className="mt-1 text-xs text-destructive">
              {state.errors.status}
            </p>
          )}
        </div>

        <div>
          <Label className="mb-2 block">
            PESEL <span className="text-destructive">*</span>
          </Label>
          <Input
            name="pesel"
            className={cn(state.errors.pesel && "border-destructive")}
          />
          {state.errors.pesel && (
            <p className="mt-1 text-xs text-destructive">
              {state.errors.pesel}
            </p>
          )}
        </div>

        <div>
          <Label className="mb-2 block">NIP</Label>
          <Input
            name="nip"
            className={cn(state.errors.nip && "border-destructive")}
          />
          {state.errors.nip && (
            <p className="mt-1 text-xs text-destructive">{state.errors.nip}</p>
          )}
        </div>

        <div>
          <Label className="mb-2 block">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            type="email"
            name="email"
            className={cn(state.errors.email && "border-destructive")}
          />
          {state.errors.email && (
            <p className="mt-1 text-xs text-destructive">
              {state.errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label className="mb-2 block">Adres</Label>
          <Input name="address" />
        </div>
        <div>
          <Label className="mb-2 block">Kod pocztowy</Label>
          <Input
            name="postalCode"
            placeholder="00-000"
            className={cn(state.errors.postalCode && "border-destructive")}
          />
          {state.errors.postalCode && (
            <p className="mt-1 text-xs text-destructive">
              {state.errors.postalCode}
            </p>
          )}
        </div>
      </div>

      {state.success && (
        <div className="rounded-xl bg-[#16a34a]/15 px-4 py-3 text-center text-sm font-medium text-[#4ade80]">
          Klient został pomyślnie dodany!
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={pending || state.success}>
          {pending ? "Zapisywanie..." : "Zapisz klienta"}
        </Button>
      </div>
    </form>
  );
}

export function AddClientDialog() {
  const [open, setOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setResetKey((k) => k + 1);
      }}
    >
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        Dodaj klienta
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Dodaj nowego klienta</DialogTitle>
        </DialogHeader>
        {open && <AddClientForm key={resetKey} onSuccess={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}

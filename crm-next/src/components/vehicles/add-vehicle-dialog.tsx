"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createVehicle, type VehicleFormState } from "@/app/vehicles/actions";
import { cn } from "@/lib/utils";

const initialState: VehicleFormState = { errors: {}, success: false };

function AddVehicleForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction, pending] = useActionState(
    createVehicle,
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
          <Label className="mb-1 block text-sm">Marka</Label>
          <Input
            name="brand"
            placeholder="Toyota"
            className={cn(state.errors.brand && "border-destructive")}
          />
          {state.errors.brand && (
            <p className="mt-1 text-xs text-destructive">
              {state.errors.brand}
            </p>
          )}
        </div>
        <div>
          <Label className="mb-1 block text-sm">Model</Label>
          <Input
            name="model"
            placeholder="Corolla"
            className={cn(state.errors.model && "border-destructive")}
          />
          {state.errors.model && (
            <p className="mt-1 text-xs text-destructive">
              {state.errors.model}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label className="mb-1 block text-sm">Nazwa ubezpieczyciela</Label>
        <Input
          name="insuranceName"
          placeholder="PZU"
          className={cn(state.errors.insuranceName && "border-destructive")}
        />
        {state.errors.insuranceName && (
          <p className="mt-1 text-xs text-destructive">
            {state.errors.insuranceName}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label className="mb-1 block text-sm">Data produkcji</Label>
          <Input
            type="date"
            name="productionDate"
            className={cn(state.errors.productionDate && "border-destructive")}
          />
          {state.errors.productionDate && (
            <p className="mt-1 text-xs text-destructive">
              {state.errors.productionDate}
            </p>
          )}
        </div>
        <div>
          <Label className="mb-1 block text-sm">Ubezpieczony do</Label>
          <Input
            type="date"
            name="insuranceDate"
            className={cn(state.errors.insuranceDate && "border-destructive")}
          />
          {state.errors.insuranceDate && (
            <p className="mt-1 text-xs text-destructive">
              {state.errors.insuranceDate}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label className="mb-1 block text-sm">Numer VIN</Label>
          <Input
            name="vin"
            placeholder="WVWZZZ1JZXW000000"
            className={cn(state.errors.vin && "border-destructive")}
          />
          {state.errors.vin && (
            <p className="mt-1 text-xs text-destructive">{state.errors.vin}</p>
          )}
        </div>
        <div>
          <Label className="mb-1 block text-sm">Numer rejestracyjny</Label>
          <Input
            name="regNumber"
            placeholder="WI 1234X"
            className={cn(state.errors.regNumber && "border-destructive")}
          />
          {state.errors.regNumber && (
            <p className="mt-1 text-xs text-destructive">
              {state.errors.regNumber}
            </p>
          )}
        </div>
      </div>

      {state.success && (
        <div className="rounded-xl bg-[#16a34a]/15 px-4 py-3 text-center text-sm font-medium text-[#4ade80]">
          Pojazd został poprawnie dodany!
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={pending || state.success}>
          {pending ? "Zapisywanie..." : "Zapisz pojazd"}
        </Button>
      </div>
    </form>
  );
}

export function AddVehicleDialog() {
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
        Dodaj auto
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Dodaj nowy pojazd</DialogTitle>
        </DialogHeader>
        {open && (
          <AddVehicleForm key={resetKey} onSuccess={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

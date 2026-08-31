"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface VehicleFormState {
  errors: Record<string, string>;
  success: boolean;
}

async function nextVehicleId() {
  const vehicles = await prisma.vehicle.findMany({ select: { id: true } });
  const max = vehicles.reduce((acc, v) => {
    const n = parseInt(v.id.replace(/^V/, ""), 10);
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `V${String(max + 1).padStart(3, "0")}`;
}

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

export async function createVehicle(
  _prevState: VehicleFormState,
  formData: FormData
): Promise<VehicleFormState> {
  const brand = String(formData.get("brand") || "").trim();
  const model = String(formData.get("model") || "").trim();
  const insuranceName = String(formData.get("insuranceName") || "").trim();
  const productionDate = String(formData.get("productionDate") || "").trim();
  const insuranceDate = String(formData.get("insuranceDate") || "").trim();
  const vin = String(formData.get("vin") || "").trim();
  const regNumber = String(formData.get("regNumber") || "").trim();

  const errors: Record<string, string> = {};
  if (!brand) errors.brand = 'Pole "Marka" jest wymagane.';
  if (!model) errors.model = 'Pole "Model" jest wymagane.';
  if (!insuranceName)
    errors.insuranceName = 'Pole "Nazwa ubezpieczyciela" jest wymagane.';
  if (!productionDate || isNaN(new Date(productionDate).getTime()))
    errors.productionDate = 'Pole "Data produkcji" jest wymagane.';
  if (!insuranceDate || isNaN(new Date(insuranceDate).getTime()))
    errors.insuranceDate = 'Pole "Ubezpieczenie do" jest wymagane.';
  if (!vin || !VIN_REGEX.test(vin))
    errors.vin = "VIN musi mieć 17 znaków (bez I, O, Q).";
  if (!regNumber)
    errors.regNumber = 'Pole "Numer rejestracyjny" jest wymagane.';

  if (Object.keys(errors).length > 0) {
    return { errors, success: false };
  }

  const id = await nextVehicleId();

  await prisma.vehicle.create({
    data: {
      id,
      brand,
      model,
      insuranceName,
      production: new Date(productionDate),
      insurance: new Date(insuranceDate),
      vin,
      regNumber,
    },
  });

  revalidatePath("/vehicles");
  return { errors: {}, success: true };
}

export async function addServiceEntry(
  vehicleId: string,
  date: string,
  description: string
) {
  await prisma.serviceEntry.create({
    data: { vehicleId, date: new Date(date), description },
  });
  revalidatePath("/vehicles");
}

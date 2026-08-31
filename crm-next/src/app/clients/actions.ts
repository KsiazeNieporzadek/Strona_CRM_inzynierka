"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ClientFormState {
  errors: Record<string, string>;
  success: boolean;
}

async function nextClientId() {
  const clients = await prisma.client.findMany({ select: { id: true } });
  const max = clients.reduce((acc, c) => {
    const n = parseInt(c.id, 10);
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return String(max + 1).padStart(3, "0");
}

export async function createClient(
  _prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const status = String(formData.get("status") || "");
  const pesel = String(formData.get("pesel") || "").trim();
  const nip = String(formData.get("nip") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const postalCode = String(formData.get("postalCode") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  const errors: Record<string, string> = {};

  if (!firstName) errors.firstName = "To pole jest wymagane.";
  if (!lastName) errors.lastName = "To pole jest wymagane.";
  if (!status) errors.status = "Wybierz status klienta.";
  if (!/^[0-9]{11}$/.test(pesel))
    errors.pesel = "PESEL musi składać się dokładnie z 11 cyfr.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Podaj poprawny adres e-mail.";
  if (nip && !/^[0-9]{10}$/.test(nip))
    errors.nip = "NIP musi składać się z 10 cyfr.";
  if (postalCode && !/^[0-9]{2}-[0-9]{3}$/.test(postalCode))
    errors.postalCode = "Kod pocztowy musi mieć format XX-XXX.";

  if (Object.keys(errors).length > 0) {
    return { errors, success: false };
  }

  const id = await nextClientId();
  const fullAddress = [address, postalCode].filter(Boolean).join(", ");

  await prisma.client.create({
    data: {
      id,
      firstName,
      lastName,
      status,
      pesel,
      nip: nip || null,
      email,
      phone: phone || "brak",
      address: fullAddress || null,
    },
  });

  revalidatePath("/clients");
  return { errors: {}, success: true };
}

export async function archiveClient(id: string) {
  await prisma.client.update({
    where: { id },
    data: { archived: true },
  });
  revalidatePath("/clients");
}

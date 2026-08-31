"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function assignTransfer(transferId: number, clientId: string) {
  const transfer = await prisma.unassignedTransfer.findUnique({
    where: { id: transferId },
  });
  if (!transfer) return;

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        invoice: transfer.title,
        amount: transfer.amount,
        delayDays: 0,
        clientId,
      },
    }),
    prisma.unassignedTransfer.delete({ where: { id: transferId } }),
  ]);

  revalidatePath("/finance");
  revalidatePath("/finance/unassigned");
}

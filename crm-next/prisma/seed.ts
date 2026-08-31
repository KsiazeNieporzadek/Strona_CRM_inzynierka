import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";
import clients from "../src/data/clients.json";
import vehicles from "../src/data/vehicles.json";
import finance from "../src/data/finance.json";
import unassignedTransfers from "../src/data/unassigned_transfers.json";
import contracts from "../src/data/contracts-finance.json";

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@crm.local" },
  });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: "admin@crm.local",
        passwordHash: await hashPassword("admin123"),
        name: "Administrator",
      },
    });
  }

  for (const c of clients) {
    await prisma.client.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        pesel: c.pesel,
        nip: c.nip || null,
        email: c.email,
        phone: c.phone,
        address: c.address || null,
        status: c.status,
      },
    });
  }

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { id: v.id },
      update: {},
      create: {
        id: v.id,
        brand: v.brand,
        model: v.model,
        clientId: v.client || null,
        regNumber: v.regNumber,
        insurance: new Date(v.insurance),
        vin: v.vin,
        production: new Date(v.production),
      },
    });
  }

  const paymentCount = await prisma.payment.count();
  if (paymentCount === 0) {
    await prisma.payment.createMany({
      data: finance.map((f) => ({
        invoice: f.invoice,
        amount: f.amount,
        delayDays: f.delayDays,
      })),
    });
  }

  const transferCount = await prisma.unassignedTransfer.count();
  if (transferCount === 0) {
    await prisma.unassignedTransfer.createMany({
      data: unassignedTransfers.map((t) => ({
        title: t.title,
        transferDate: new Date(t.transferDate),
        accountNumber: t.accountNumber,
        amount: t.amount,
        currency: t.currency,
      })),
    });
  }

  for (const c of contracts) {
    await prisma.contract.upsert({
      where: { contractId: c.contractId },
      update: {},
      create: {
        contractId: c.contractId,
        clientName: c.clientName,
        clientId: c.clientId,
        startDate: new Date(c.startDate),
        endDate: new Date(c.endDate),
        financingAmount: c.financingAmount,
        duration: c.duration,
        monthlyInstallment: c.monthlyInstallment,
        contractValue: c.contractValue,
        roi: c.roi,
        remainingAmount: c.remainingAmount,
      },
    });
  }

  console.log(
    `Seeded ${clients.length} clients, ${vehicles.length} vehicles, ${finance.length} payments, ${unassignedTransfers.length} unassigned transfers, ${contracts.length} contracts.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

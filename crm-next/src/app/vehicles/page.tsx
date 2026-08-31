import { prisma } from "@/lib/prisma";
import { VehiclesTable } from "@/components/vehicles/vehicles-table";

export default async function VehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      client: { select: { firstName: true, lastName: true } },
      serviceEntries: { orderBy: { date: "desc" } },
    },
    orderBy: { id: "asc" },
  });

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold text-foreground">Samochody</h1>
      <VehiclesTable
        vehicles={vehicles.map((v) => ({
          id: v.id,
          brand: v.brand,
          model: v.model,
          clientName: v.client
            ? `${v.client.firstName} ${v.client.lastName}`
            : "",
          regNumber: v.regNumber,
          insurance: v.insurance.toISOString().slice(0, 10),
          vin: v.vin,
          production: v.production.toISOString().slice(0, 10),
          serviceEntries: v.serviceEntries.map((e) => ({
            id: e.id,
            date: e.date.toISOString().slice(0, 10),
            description: e.description,
          })),
        }))}
      />
    </div>
  );
}

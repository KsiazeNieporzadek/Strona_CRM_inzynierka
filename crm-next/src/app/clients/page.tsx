import { prisma } from "@/lib/prisma";
import { ClientsTable } from "@/components/clients/clients-table";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    where: { archived: false },
    orderBy: { id: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-foreground">Klienci</h1>
      <ClientsTable
        clients={clients.map((c) => ({
          id: c.id,
          firstName: c.firstName,
          lastName: c.lastName,
          pesel: c.pesel,
          nip: c.nip,
          email: c.email,
          phone: c.phone,
          address: c.address,
          status: c.status,
        }))}
      />
    </div>
  );
}

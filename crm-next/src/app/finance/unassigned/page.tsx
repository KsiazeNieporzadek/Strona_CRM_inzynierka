import { prisma } from "@/lib/prisma";
import { FinanceTabs } from "@/components/finance/finance-tabs";
import { UnassignedTable } from "@/components/finance/unassigned-table";

export default async function UnassignedPage() {
  const transfers = await prisma.unassignedTransfer.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <FinanceTabs />
      </div>
      <UnassignedTable
        transfers={transfers.map((t) => ({
          id: t.id,
          title: t.title,
          transferDate: t.transferDate.toISOString().slice(0, 10),
          accountNumber: t.accountNumber,
          amount: t.amount,
          currency: t.currency,
        }))}
      />
    </div>
  );
}

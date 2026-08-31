import { prisma } from "@/lib/prisma";
import { FinanceTabs } from "@/components/finance/finance-tabs";
import { ContractsTable } from "@/components/finance/contracts-table";

export default async function ContractsPage() {
  const contracts = await prisma.contract.findMany({
    orderBy: { contractId: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <FinanceTabs />
      </div>
      <ContractsTable
        contracts={contracts.map((c) => ({
          contractId: c.contractId,
          clientName: c.clientName,
          clientId: c.clientId,
          startDate: c.startDate.toISOString().slice(0, 10),
          endDate: c.endDate.toISOString().slice(0, 10),
          financingAmount: c.financingAmount,
          duration: c.duration,
          monthlyInstallment: c.monthlyInstallment,
          contractValue: c.contractValue,
          roi: c.roi,
          remainingAmount: c.remainingAmount,
        }))}
      />
    </div>
  );
}

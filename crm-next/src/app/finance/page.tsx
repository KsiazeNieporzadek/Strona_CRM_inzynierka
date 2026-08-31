import { prisma } from "@/lib/prisma";
import { FinanceTabs } from "@/components/finance/finance-tabs";
import { PaymentsTable } from "@/components/finance/payments-table";

export default async function FinancePage() {
  const payments = await prisma.payment.findMany({ orderBy: { id: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <FinanceTabs />
      </div>
      <PaymentsTable payments={payments} />
    </div>
  );
}

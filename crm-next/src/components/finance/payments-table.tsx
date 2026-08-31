"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { TableScrollArea } from "@/components/ui/table-scroll-area";
import { cn } from "@/lib/utils";

export interface PaymentRow {
  id: number;
  invoice: string;
  amount: number;
  delayDays: number;
  clientId: string | null;
}

const ITEMS_PER_PAGE = 10;

export function PaymentsTable({ payments }: { payments: PaymentRow[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(payments.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const pageData = payments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function exportToCsv() {
    let csv = "ID,Faktura,Kwota,Opóźnienie dni\n";
    payments.forEach((p) => {
      csv += `${p.id},${p.invoice},${p.amount},${p.delayDays}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "finanse.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Liczba wyników: {payments.length}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={exportToCsv}
          title="Eksportuj CSV"
        >
          <Download className="size-4" />
        </Button>
      </div>

      <TableScrollArea>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID wpłaty</TableHead>
              <TableHead>Nazwa faktury</TableHead>
              <TableHead>Wysokość wpłaty</TableHead>
              <TableHead>Dni opóźnienia</TableHead>
              <TableHead>Klient</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((p) => (
              <TableRow
                key={p.id}
                className={cn(p.delayDays > 0 && "bg-destructive/10")}
              >
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.invoice}</TableCell>
                <TableCell>{p.amount.toLocaleString()} PLN</TableCell>
                <TableCell>{p.delayDays}</TableCell>
                <TableCell>{p.clientId || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableScrollArea>

      <PaginationControls
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}

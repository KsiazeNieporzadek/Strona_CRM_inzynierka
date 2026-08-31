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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { TableScrollArea } from "@/components/ui/table-scroll-area";
import { cn } from "@/lib/utils";

export interface ContractRow {
  contractId: string;
  clientName: string;
  clientId: string;
  startDate: string;
  endDate: string;
  financingAmount: number;
  duration: string;
  monthlyInstallment: number;
  contractValue: number;
  roi: number;
  remainingAmount: number;
}

interface Installment {
  number: number;
  dueDate: string;
  amount: number;
  status: "Do zapłaty" | "Opłacona";
}

const ITEMS_PER_PAGE = 10;

function computeInstallmentSchedule(contract: ContractRow): Installment[] {
  const monthsMatch = contract.duration.match(/\d+/);
  const monthsCount = monthsMatch ? parseInt(monthsMatch[0], 10) : 0;
  const start = new Date(contract.startDate);
  const monthly = contract.monthlyInstallment || 0;

  let unpaidCount = 0;
  if (monthly > 0) {
    unpaidCount = Math.round(contract.remainingAmount / monthly);
    unpaidCount = Math.min(monthsCount, Math.max(0, unpaidCount));
  }

  const installments: Installment[] = [];
  for (let i = 1; i <= monthsCount; i++) {
    const due = new Date(start.getFullYear(), start.getMonth() + i, start.getDate());
    const isUnpaid = i > monthsCount - unpaidCount;
    installments.push({
      number: i,
      dueDate: due.toISOString().slice(0, 10),
      amount: monthly,
      status: isUnpaid ? "Do zapłaty" : "Opłacona",
    });
  }
  return installments;
}

export function ContractsTable({ contracts }: { contracts: ContractRow[] }) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ContractRow | null>(null);

  const totalPages = Math.max(1, Math.ceil(contracts.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const pageData = contracts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function exportToCsv() {
    let csv =
      "ID umowy,Imię i Nazwisko,ID klienta,Data zawarcia,Data zakończenia,Kwota finansowania,Czas trwania,Rata netto,Wartość umowy,ROI,Kwota do spłaty\n";
    contracts.forEach((c) => {
      csv += `${c.contractId},"${c.clientName}",${c.clientId},${c.startDate},${c.endDate},${c.financingAmount},${c.duration},${c.monthlyInstallment},${c.contractValue},${c.roi},${c.remainingAmount}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "umowy_finanse.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const schedule = selected ? computeInstallmentSchedule(selected) : [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Liczba wyników: {contracts.length}
        </div>
        <Button variant="outline" size="icon" onClick={exportToCsv} title="Eksportuj CSV">
          <Download className="size-4" />
        </Button>
      </div>

      <TableScrollArea>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID umowy</TableHead>
              <TableHead>Imię i Nazwisko Klienta</TableHead>
              <TableHead>ID klienta</TableHead>
              <TableHead>Data zawarcia</TableHead>
              <TableHead>Data zakończenia</TableHead>
              <TableHead>Kwota finansowania</TableHead>
              <TableHead>Czas trwania</TableHead>
              <TableHead>Rata netto</TableHead>
              <TableHead>Wartość umowy</TableHead>
              <TableHead>ROI</TableHead>
              <TableHead>Kwota do spłaty</TableHead>
              <TableHead>Harmonogram</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((c) => (
              <TableRow key={c.contractId}>
                <TableCell>{c.contractId}</TableCell>
                <TableCell>{c.clientName}</TableCell>
                <TableCell>{c.clientId}</TableCell>
                <TableCell>{c.startDate}</TableCell>
                <TableCell>{c.endDate}</TableCell>
                <TableCell>{c.financingAmount.toLocaleString()} PLN</TableCell>
                <TableCell>{c.duration}</TableCell>
                <TableCell>{c.monthlyInstallment.toLocaleString()} PLN</TableCell>
                <TableCell>{c.contractValue.toLocaleString()} PLN</TableCell>
                <TableCell>{c.roi.toLocaleString()} PLN</TableCell>
                <TableCell>{c.remainingAmount.toLocaleString()} PLN</TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => setSelected(c)}>
                    Harmonogram
                  </Button>
                </TableCell>
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

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Harmonogram spłat
              {selected && ` — umowa ${selected.contractId} (${selected.clientName})`}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nr raty</TableHead>
                  <TableHead>Termin płatności</TableHead>
                  <TableHead>Kwota</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.length > 0 ? (
                  schedule.map((row) => (
                    <TableRow key={row.number}>
                      <TableCell>{row.number}</TableCell>
                      <TableCell>{row.dueDate}</TableCell>
                      <TableCell>{row.amount.toLocaleString()} PLN</TableCell>
                      <TableCell
                        className={cn(
                          row.status === "Do zapłaty"
                            ? "text-[#f87171]"
                            : "text-[#4ade80]"
                        )}
                      >
                        {row.status}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      Brak danych do zbudowania harmonogramu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Zamknij
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { TableScrollArea } from "@/components/ui/table-scroll-area";
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
import { assignTransfer } from "@/app/finance/actions";

export interface TransferRow {
  id: number;
  title: string;
  transferDate: string;
  accountNumber: string;
  amount: number;
  currency: string;
}

const ITEMS_PER_PAGE = 10;

export function UnassignedTable({ transfers }: { transfers: TransferRow[] }) {
  const [data, setData] = useState(transfers);
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<TransferRow | null>(null);
  const [clientId, setClientId] = useState("");
  const [pending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const pageData = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function exportToCsv() {
    let csv = "Tytuł przelewu,Data przelewu,Numer rachunku,Wartość,Waluta\n";
    data.forEach((t) => {
      csv += `"${t.title}",${t.transferDate},${t.accountNumber},${t.amount},${t.currency}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nieprzypisane_wplaty.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function openAssign(transfer: TransferRow) {
    setTarget(transfer);
    setClientId("");
  }

  function confirmAssign() {
    if (!target || !clientId.trim()) return;
    const transferId = target.id;
    const id = clientId.trim();
    setData((prev) => prev.filter((t) => t.id !== transferId));
    setTarget(null);
    startTransition(() => {
      assignTransfer(transferId, id);
    });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Liczba wyników: {data.length}</div>
        <Button variant="outline" size="icon" onClick={exportToCsv} title="Eksportuj CSV">
          <Download className="size-4" />
        </Button>
      </div>

      <TableScrollArea>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tytuł przelewu</TableHead>
              <TableHead>Data przelewu</TableHead>
              <TableHead>Numer rachunku</TableHead>
              <TableHead>Wartość</TableHead>
              <TableHead>Waluta</TableHead>
              <TableHead>Przypisz</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.title}</TableCell>
                <TableCell>{t.transferDate}</TableCell>
                <TableCell className="font-mono text-xs">
                  {t.accountNumber}
                </TableCell>
                <TableCell>{t.amount.toLocaleString()}</TableCell>
                <TableCell>{t.currency}</TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => openAssign(t)}>
                    Przypisz
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {pageData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Brak nieprzypisanych wpłat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableScrollArea>

      <PaginationControls
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <Dialog open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Przypisz wpłatę do klienta</DialogTitle>
          </DialogHeader>
          {target && (
            <p className="text-sm text-muted-foreground">
              {target.title} — {target.amount.toLocaleString()} {target.currency}
            </p>
          )}
          <div>
            <Label className="mb-1 block text-xs text-muted-foreground">
              ID klienta
            </Label>
            <Input
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="np. 001"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button disabled={pending || !clientId.trim()} onClick={confirmAssign}>
              Przypisz
            </Button>
            <Button variant="secondary" onClick={() => setTarget(null)}>
              Anuluj
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

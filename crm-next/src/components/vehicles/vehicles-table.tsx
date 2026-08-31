"use client";

import { useMemo, useState, useTransition } from "react";
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
import { addServiceEntry } from "@/app/vehicles/actions";
import { AddVehicleDialog } from "@/components/vehicles/add-vehicle-dialog";

interface ServiceEntryRow {
  id: number;
  date: string;
  description: string;
}

export interface VehicleRow {
  id: string;
  brand: string;
  model: string;
  clientName: string;
  regNumber: string;
  insurance: string;
  vin: string;
  production: string;
  serviceEntries: ServiceEntryRow[];
}

const ITEMS_PER_PAGE = 10;
type SortField = "insurance" | "production";

export function VehiclesTable({ vehicles }: { vehicles: VehicleRow[] }) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortAscending, setSortAscending] = useState(true);
  const [page, setPage] = useState(1);
  const [serviceVehicle, setServiceVehicle] = useState<VehicleRow | null>(
    null
  );
  const [entryDate, setEntryDate] = useState("");
  const [entryDesc, setEntryDesc] = useState("");
  const [pending, startTransition] = useTransition();
  const [localEntries, setLocalEntries] = useState<
    Record<string, ServiceEntryRow[]>
  >({});

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    let result = vehicles.filter(
      (v) =>
        v.brand.toLowerCase().includes(query) ||
        v.model.toLowerCase().includes(query) ||
        v.regNumber.toLowerCase().includes(query)
    );
    if (sortField) {
      result = [...result].sort((a, b) => {
        const diff =
          new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime();
        return sortAscending ? diff : -diff;
      });
    }
    return result;
  }, [vehicles, search, sortField, sortAscending]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const pageData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortAscending((prev) => !prev);
    } else {
      setSortField(field);
      setSortAscending(true);
    }
  }

  function sortIndicator(field: SortField) {
    if (sortField !== field) return "⬍";
    return sortAscending ? "⬆" : "⬇";
  }

  function daysUntil(dateStr: string) {
    const diff =
      (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return Math.ceil(diff);
  }

  function exportToCsv() {
    const headers = [
      "ID",
      "Marka",
      "Model",
      "Przypisany klient",
      "Numer rejestracyjny",
      "Ubezpieczenie",
      "Numer VIN",
      "Data produkcji",
    ];
    const rows = vehicles.map((v) => [
      v.id,
      v.brand,
      v.model,
      v.clientName || "wolny",
      v.regNumber,
      v.insurance,
      v.vin,
      v.production,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(";")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "vehicles.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function openService(vehicle: VehicleRow) {
    setServiceVehicle(vehicle);
    setEntryDate("");
    setEntryDesc("");
  }

  function handleAddEntry() {
    if (!serviceVehicle || !entryDate || !entryDesc.trim()) {
      alert("Podaj datę oraz opis wykonanej czynności serwisowej.");
      return;
    }
    const vehicleId = serviceVehicle.id;
    const newEntry = { id: -Date.now(), date: entryDate, description: entryDesc.trim() };
    setLocalEntries((prev) => ({
      ...prev,
      [vehicleId]: [newEntry, ...(prev[vehicleId] || [])],
    }));
    setEntryDate("");
    setEntryDesc("");
    startTransition(() => {
      addServiceEntry(vehicleId, newEntry.date, newEntry.description);
    });
  }

  function entriesFor(vehicle: VehicleRow) {
    const extra = localEntries[vehicle.id] || [];
    return [...extra, ...vehicle.serviceEntries].sort((a, b) =>
      a.date < b.date ? 1 : -1
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <Input
          placeholder="Wyszukaj markę, model lub rejestrację"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="min-w-[220px] flex-grow"
        />
        <Button variant="outline" size="icon" onClick={exportToCsv} title="Eksportuj do CSV">
          <Download className="size-4" />
        </Button>
        <AddVehicleDialog />
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        Liczba wyników: {filtered.length}
      </div>

      <TableScrollArea>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Marka</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Przypisany klient</TableHead>
              <TableHead>Numer rejestracyjny</TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-foreground"
                onClick={() => toggleSort("insurance")}
              >
                Ubezpieczenie {sortIndicator("insurance")}
              </TableHead>
              <TableHead>VIN</TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-foreground"
                onClick={() => toggleSort("production")}
              >
                Data produkcji {sortIndicator("production")}
              </TableHead>
              <TableHead>Historia serwisowa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((v) => {
              const soon = daysUntil(v.insurance) <= 30;
              return (
                <TableRow
                  key={v.id}
                  className={soon ? "bg-destructive/10" : undefined}
                >
                  <TableCell>{v.id}</TableCell>
                  <TableCell>{v.brand}</TableCell>
                  <TableCell>{v.model}</TableCell>
                  <TableCell>{v.clientName || "wolny"}</TableCell>
                  <TableCell>{v.regNumber}</TableCell>
                  <TableCell>{v.insurance}</TableCell>
                  <TableCell>{v.vin}</TableCell>
                  <TableCell>{v.production}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openService(v)}
                    >
                      Historia
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {pageData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground"
                >
                  Brak wyników.
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

      <Dialog
        open={!!serviceVehicle}
        onOpenChange={(open) => !open && setServiceVehicle(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Historia serwisowa
              {serviceVehicle &&
                ` — ${serviceVehicle.brand} ${serviceVehicle.model} (${serviceVehicle.regNumber})`}
            </DialogTitle>
          </DialogHeader>
          <ul className="max-h-48 list-inside list-disc space-y-1 overflow-y-auto text-sm">
            {serviceVehicle && entriesFor(serviceVehicle).length > 0 ? (
              entriesFor(serviceVehicle).map((e) => (
                <li key={e.id}>
                  {e.date} — {e.description}
                </li>
              ))
            ) : (
              <li className="list-none text-muted-foreground">
                Brak wpisów w historii serwisowej.
              </li>
            )}
          </ul>
          <div className="flex flex-wrap items-end gap-2 border-t border-border pt-4">
            <div>
              <Label className="mb-1 block text-xs text-muted-foreground">
                Data
              </Label>
              <Input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
              />
            </div>
            <div className="min-w-[150px] flex-grow">
              <Label className="mb-1 block text-xs text-muted-foreground">
                Opis wykonanej czynności
              </Label>
              <Input
                placeholder="np. Wymiana oleju"
                value={entryDesc}
                onChange={(e) => setEntryDesc(e.target.value)}
              />
            </div>
            <Button onClick={handleAddEntry} disabled={pending}>
              Dodaj wpis
            </Button>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setServiceVehicle(null)}>
              Zamknij
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

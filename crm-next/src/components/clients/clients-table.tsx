"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { TableScrollArea } from "@/components/ui/table-scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { archiveClient } from "@/app/clients/actions";
import { AddClientDialog } from "@/components/clients/add-client-dialog";

export interface ClientRow {
  id: string;
  firstName: string;
  lastName: string;
  pesel: string;
  nip: string | null;
  email: string;
  phone: string;
  address: string | null;
  status: string;
}

const ITEMS_PER_PAGE = 10;

const STATUS_LABELS: Record<string, string> = {
  all: "Wszystkie statusy",
  aktywny: "Aktywny",
  lejek: "Lejek sprzedażowy",
  windykacja: "Windykacja",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "Aktywny")
    return <Badge className="bg-[#22c55e] text-white">Aktywny</Badge>;
  if (status === "Windykacja")
    return <Badge className="bg-[#ef4444] text-white">Windykacja</Badge>;
  if (status === "Lejek sprzedażowy")
    return <Badge className="bg-[#eab308] text-black">Lejek</Badge>;
  return <span>{status || "Brak"}</span>;
}

type SortColumn = "id" | "firstName" | "lastName" | "status";

export function ClientsTable({ clients }: { clients: ClientRow[] }) {
  const [data, setData] = useState(clients);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortAscending, setSortAscending] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ClientRow | null>(null);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    setData(clients);
  }, [clients]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    let result = data.filter((c) => {
      const matchesText =
        c.firstName.toLowerCase().includes(query) ||
        c.lastName.toLowerCase().includes(query) ||
        (c.nip || "").includes(query);
      const matchesStatus =
        statusFilter === "all" ||
        (c.status || "").toLowerCase().includes(statusFilter);
      return matchesText && matchesStatus;
    });

    if (sortColumn) {
      result = [...result].sort((a, b) => {
        let valA: string | number = a[sortColumn] ?? "";
        let valB: string | number = b[sortColumn] ?? "";
        if (sortColumn === "id") {
          valA = parseInt(String(valA), 10) || 0;
          valB = parseInt(String(valB), 10) || 0;
        } else {
          valA = String(valA).toLowerCase();
          valB = String(valB).toLowerCase();
        }
        if (valA < valB) return sortAscending ? -1 : 1;
        if (valA > valB) return sortAscending ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, search, statusFilter, sortColumn, sortAscending]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const pageData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function toggleSort(column: SortColumn) {
    if (sortColumn === column) {
      setSortAscending((prev) => !prev);
    } else {
      setSortColumn(column);
      setSortAscending(true);
    }
    setPage(1);
  }

  function sortIndicator(column: SortColumn) {
    if (sortColumn !== column) return "↕";
    return sortAscending ? "↑" : "↓";
  }

  function exportToCsv() {
    const headers = [
      "ID",
      "Imię",
      "Nazwisko",
      "PESEL",
      "NIP",
      "Email",
      "Telefon",
      "Adres",
    ];
    const rows = data.map((c) => [
      c.id,
      c.firstName,
      c.lastName,
      c.pesel,
      c.nip || "",
      c.email,
      c.phone,
      c.address || "",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(";")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "clients.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleArchive() {
    if (!selected) return;
    const confirmed = window.confirm(
      `Czy na pewno chcesz zarchiwizować klienta ${selected.firstName} ${selected.lastName}? Zniknie on z listy klientów.`
    );
    if (!confirmed) return;
    setArchiving(true);
    try {
      await archiveClient(selected.id);
      setData((prev) => prev.filter((c) => c.id !== selected.id));
      setSelected(null);
    } finally {
      setArchiving(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Input
          placeholder="Wyszukaj imię, nazwisko lub NIP"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="min-w-[220px] flex-grow"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue>
              {(value: string) => STATUS_LABELS[value]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie statusy</SelectItem>
            <SelectItem value="aktywny">Aktywny</SelectItem>
            <SelectItem value="lejek">Lejek sprzedażowy</SelectItem>
            <SelectItem value="windykacja">Windykacja</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={exportToCsv} title="Eksportuj do CSV">
          <Download className="size-4" />
        </Button>
        <AddClientDialog />
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        Liczba wyników: {filtered.length}
      </div>

      <TableScrollArea>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none hover:text-foreground"
                onClick={() => toggleSort("id")}
              >
                ID {sortIndicator("id")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-foreground"
                onClick={() => toggleSort("firstName")}
              >
                Imię {sortIndicator("firstName")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-foreground"
                onClick={() => toggleSort("lastName")}
              >
                Nazwisko {sortIndicator("lastName")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-foreground"
                onClick={() => toggleSort("status")}
              >
                Status {sortIndicator("status")}
              </TableHead>
              <TableHead>PESEL</TableHead>
              <TableHead>NIP</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Adres</TableHead>
              <TableHead>Profil</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.id}</TableCell>
                <TableCell>{client.firstName}</TableCell>
                <TableCell>{client.lastName}</TableCell>
                <TableCell>
                  <StatusBadge status={client.status} />
                </TableCell>
                <TableCell>{client.pesel}</TableCell>
                <TableCell>{client.nip}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.address}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelected(client)}
                  >
                    Szczegóły
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {pageData.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
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

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profil klienta</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">ID:</span> {selected.id}
              </p>
              <p>
                <span className="text-muted-foreground">Imię i nazwisko:</span>{" "}
                {selected.firstName} {selected.lastName}
              </p>
              <p>
                <span className="text-muted-foreground">Status:</span>{" "}
                {selected.status || "Brak"}
              </p>
              <p>
                <span className="text-muted-foreground">PESEL:</span> {selected.pesel}
              </p>
              <p>
                <span className="text-muted-foreground">NIP:</span> {selected.nip}
              </p>
              <p>
                <span className="text-muted-foreground">Email:</span> {selected.email}
              </p>
              <p>
                <span className="text-muted-foreground">Telefon:</span> {selected.phone}
              </p>
              <p>
                <span className="text-muted-foreground">Adres:</span> {selected.address}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={archiving}
              onClick={handleArchive}
            >
              Archiwizuj
            </Button>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Zamknij
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

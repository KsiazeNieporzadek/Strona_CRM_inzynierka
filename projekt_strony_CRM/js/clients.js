
document.addEventListener("DOMContentLoaded", () => {
  let data = [];
  let currentPage = 1;
  const itemsPerPage = 10;

  // Zmienne do sortowania
  let sortColumn = null;
  let sortAscending = true;

  const tbody = document.getElementById("clients-table-body");
  const searchInput = document.getElementById("search");
  const statusFilter = document.getElementById("statusFilter");
  const resultCount = document.getElementById("result-count");
  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");
  const exportBtn = document.getElementById("exportCsv");

  // ---- FE01.3 / FEP05: profil klienta + archiwizacja z potwierdzeniem ----
  const ARCHIVED_KEY = "archivedClientIds";
  const clientModal = document.getElementById("clientModal");
  const clientModalBody = document.getElementById("clientModalBody");
  const archiveClientBtn = document.getElementById("archiveClientBtn");
  const closeClientModalBtn = document.getElementById("closeClientModal");
  let currentModalClientId = null;

  function getArchivedIds() {
    try {
      return JSON.parse(localStorage.getItem(ARCHIVED_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function saveArchivedIds(ids) {
    localStorage.setItem(ARCHIVED_KEY, JSON.stringify(ids));
  }

  function openClientModal(client) {
    currentModalClientId = client.id;
    clientModalBody.innerHTML = `
      <p><span class="text-gray-400">ID:</span> ${client.id}</p>
      <p><span class="text-gray-400">Imię i nazwisko:</span> ${client.firstName} ${client.lastName}</p>
      <p><span class="text-gray-400">Status:</span> ${client.status || "Brak"}</p>
      <p><span class="text-gray-400">PESEL:</span> ${client.pesel}</p>
      <p><span class="text-gray-400">NIP:</span> ${client.nip}</p>
      <p><span class="text-gray-400">Email:</span> ${client.email}</p>
      <p><span class="text-gray-400">Telefon:</span> ${client.phone}</p>
      <p><span class="text-gray-400">Adres:</span> ${client.address}</p>
    `;
    clientModal.classList.remove("hidden");
  }

  function closeClientModal() {
    clientModal.classList.add("hidden");
    currentModalClientId = null;
  }

  closeClientModalBtn.addEventListener("click", closeClientModal);

  archiveClientBtn.addEventListener("click", () => {
    if (currentModalClientId === null) return;
    const client = data.find(c => c.id === currentModalClientId);
    const label = client ? `${client.firstName} ${client.lastName}` : currentModalClientId;
    const confirmed = confirm(`Czy na pewno chcesz zarchiwizować klienta ${label}? Zniknie on z listy klientów.`);
    if (!confirmed) return;

    const archived = getArchivedIds();
    if (!archived.includes(currentModalClientId)) {
      archived.push(currentModalClientId);
      saveArchivedIds(archived);
    }
    closeClientModal();
    applyFilter();
  });

  function fetchData() {
    fetch("data/clients.json")
      .then(response => response.json())
      .then(json => {
        data = json;
        applyFilter();
      })
      .catch(err => console.error("Błąd ładowania JSON:", err));
  }

  function renderTable(filteredData) {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
    currentPage = Math.min(Math.max(currentPage, 1), totalPages);

    const startIdx = (currentPage - 1) * itemsPerPage;
    const pageData = filteredData.slice(startIdx, startIdx + itemsPerPage);

    tbody.innerHTML = "";
    pageData.forEach(client => {
      const row = document.createElement("tr");
      // Zmieniono hover:bg-black-50 na poprawne hover:bg-gray-50
      row.className = "border-b hover:bg-gray-700 transition"; 
      // Generowanie ładnych etykiet statusu na podstawie danych z JSON
      let statusBadge = "";
      if (client.status === "Aktywny") {
        statusBadge = '<span class="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-bold">Aktywny</span>';
      } else if (client.status === "Windykacja") {
        statusBadge = '<span class="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold">Windykacja</span>';
      } else if (client.status === "Lejek sprzedażowy") {
        statusBadge = '<span class="px-2 py-1 bg-yellow-500 text-black rounded-full text-xs font-bold">Lejek</span>';
      } else {
        statusBadge = client.status || "Brak";
      }

      row.innerHTML = `
        <td class="px-6 py-4">${client.id}</td>
        <td class="px-6 py-4">${client.firstName}</td>
        <td class="px-6 py-4">${client.lastName}</td>
        <td class="px-6 py-4">${statusBadge}</td> <td class="px-6 py-4">${client.pesel}</td>
        <td class="px-6 py-4">${client.nip}</td>
        <td class="px-6 py-4">${client.email}</td>
        <td class="px-6 py-4">${client.phone}</td>
        <td class="px-6 py-4">${client.address}</td>
        <td class="px-6 py-4">
          <button class="client-details-btn px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs" data-id="${client.id}">
            Szczegóły
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });

    tbody.querySelectorAll(".client-details-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const client = data.find(c => c.id === btn.dataset.id);
        if (client) openClientModal(client);
      });
    });

    resultCount.textContent = `Liczba wyników: ${filteredData.length}`;
    pageInfo.textContent = `Strona ${currentPage} z ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
  }

  function applyFilter() {
    const query = searchInput.value.toLowerCase();
    const statusQuery = statusFilter.value; // Pobieramy wartość z selecta
    const archivedIds = getArchivedIds();

    const filtered = data.filter(client => {
      // FE01.3: zarchiwizowani klienci znikają z listy
      if (archivedIds.includes(client.id)) return false;

      // Sprawdzamy wyszukiwanie tekstowe
      const matchesText =
        client.firstName.toLowerCase().includes(query) ||
        client.lastName.toLowerCase().includes(query) ||
        client.nip.includes(query);

      // Sprawdzamy status
      let matchesStatus = true;
      if (statusQuery !== "all") {
        // Zabezpieczenie, jeśli jakiś klient w JSON nie ma jeszcze dodanego statusu
        const clientStatus = client.status ? client.status.toLowerCase() : "";
        matchesStatus = clientStatus.includes(statusQuery);
      }

      return matchesText && matchesStatus;
    });

    renderTable(filtered);
  }
  function exportToCsv() {
    const headers = ["ID", "Imię", "Nazwisko", "PESEL", "NIP", "Email", "Telefon", "Adres"];
    const rows = data.map(client => [
      client.id, client.firstName, client.lastName, client.pesel,
      client.nip, client.email, client.phone, client.address
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(";")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "clients.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- Funkcja sortująca ---
  function sortData(column) {
    if (sortColumn === column) {
      sortAscending = !sortAscending;
    } else {
      sortColumn = column;
      sortAscending = true;
    }

    data.sort((a, b) => {
      let valA = a[column];
      let valB = b[column];

      // Zabezpieczenie przed pustymi wartościami
      if (valA == null) valA = "";
      if (valB == null) valB = "";

      // Sortuj ID jako liczby, a resztę jako tekst
      if (column === "id") {
        valA = parseInt(valA) || 0;
        valB = parseInt(valB) || 0;
      } else {
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
      }

      if (valA < valB) return sortAscending ? -1 : 1;
      if (valA > valB) return sortAscending ? 1 : -1;
      return 0;
    });

    currentPage = 1;
    applyFilter();
  }

  // Podpinanie akcji pod przyciski i input
  searchInput.addEventListener("input", () => {
    currentPage = 1;
    applyFilter();
  });
statusFilter.addEventListener("change", () => {
    currentPage = 1;
    applyFilter();
  });
  prevPageBtn.addEventListener("click", () => {
    currentPage--;
    applyFilter();
  });

  nextPageBtn.addEventListener("click", () => {
    currentPage++;
    applyFilter();
  });

  exportBtn.addEventListener("click", exportToCsv);

  // --- Podpinanie akcji pod nagłówki tabeli ---
  document.querySelectorAll("th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const column = th.getAttribute("data-sort");
      sortData(column);
    });
  });

  // Pobranie danych na start
  fetchData();
});



document.addEventListener("DOMContentLoaded", () => {
  let data = [];
  let sortOrder = { insurance: 1, production: 1 };
  let currentPage = 1;
  const itemsPerPage = 10;

  const tbody = document.getElementById("vehicles-table-body");
  const searchInput = document.getElementById("search");
  const resultCount = document.getElementById("result-count");
  const headers = document.querySelectorAll(".sortable");
  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");
  const exportBtn = document.getElementById("exportCsv");

  // ---- FE08.3: historia serwisowa pojazdu ----
  const SERVICE_HISTORY_KEY = "vehicleServiceHistory";
  const serviceModal = document.getElementById("serviceModal");
  const serviceModalTitle = document.getElementById("serviceModalTitle");
  const serviceHistoryList = document.getElementById("serviceHistoryList");
  const serviceEntryDate = document.getElementById("serviceEntryDate");
  const serviceEntryDesc = document.getElementById("serviceEntryDesc");
  const addServiceEntryBtn = document.getElementById("addServiceEntryBtn");
  const closeServiceModalBtn = document.getElementById("closeServiceModal");
  let currentServiceVehicleId = null;

  function getAllServiceHistory() {
    try {
      return JSON.parse(localStorage.getItem(SERVICE_HISTORY_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }
  function saveAllServiceHistory(all) {
    localStorage.setItem(SERVICE_HISTORY_KEY, JSON.stringify(all));
  }

  function renderServiceHistoryList(vehicleId) {
    const all = getAllServiceHistory();
    const entries = (all[vehicleId] || []).slice().sort((a, b) => a.date < b.date ? 1 : -1);
    serviceHistoryList.innerHTML = entries.length
      ? entries.map(e => `<li>${e.date} — ${e.description}</li>`).join("")
      : `<li class="text-gray-400 list-none">Brak wpisów w historii serwisowej.</li>`;
  }

  function openServiceModal(car) {
    currentServiceVehicleId = car.id;
    serviceModalTitle.textContent = `Historia serwisowa — ${car.brand} ${car.model} (${car.regNumber})`;
    serviceEntryDate.value = "";
    serviceEntryDesc.value = "";
    renderServiceHistoryList(car.id);
    serviceModal.classList.remove("hidden");
  }

  function closeServiceModal() {
    serviceModal.classList.add("hidden");
    currentServiceVehicleId = null;
  }

  closeServiceModalBtn.addEventListener("click", closeServiceModal);

  addServiceEntryBtn.addEventListener("click", () => {
    if (currentServiceVehicleId === null) return;
    const date = serviceEntryDate.value;
    const description = serviceEntryDesc.value.trim();
    if (!date || !description) {
      alert("Podaj datę oraz opis wykonanej czynności serwisowej.");
      return;
    }
    const all = getAllServiceHistory();
    if (!all[currentServiceVehicleId]) all[currentServiceVehicleId] = [];
    all[currentServiceVehicleId].push({ date, description });
    saveAllServiceHistory(all);
    serviceEntryDate.value = "";
    serviceEntryDesc.value = "";
    renderServiceHistoryList(currentServiceVehicleId);
  });

  function fetchData() {
    fetch("data/vehicles.json")
      .then(response => response.json())
      .then(json => {
        data = json;
        applyFilter();
      });
  }

  function renderTable(filteredData) {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    currentPage = Math.min(Math.max(currentPage, 1), totalPages);

    const startIdx = (currentPage - 1) * itemsPerPage;
    const pageData = filteredData.slice(startIdx, startIdx + itemsPerPage);

    tbody.innerHTML = "";
    const today = new Date();
    pageData.forEach(car => {
      const insuranceDate = new Date(car.insurance);
      const diffDays = Math.ceil((insuranceDate - today) / (1000 * 60 * 60 * 24));
      const rowClass = diffDays <= 30 ? ' border-b hover:bg-black-50 bg-red-100' : '';

      const clientText = car.client ? car.client : 'wolny';
      const row = document.createElement("tr");
      row.className = `border-b hover:bg-black-50 ${rowClass}`;
      row.innerHTML = `
        <td class="px-6 py-4">${car.id}</td>
        <td class="px-6 py-4">${car.brand}</td>
        <td class="px-6 py-4">${car.model}</td>
        <td class="px-6 py-4">${clientText}</td>
        <td class="px-6 py-4">${car.regNumber}</td>
        <td class="px-6 py-4">${car.insurance}</td>
        <td class="px-6 py-4">${car.vin}</td>
        <td class="px-6 py-4">${car.production}</td>
        <td class="px-6 py-4">
          <button class="service-history-btn px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs" data-id="${car.id}">
            Historia
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });

    tbody.querySelectorAll(".service-history-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const car = data.find(c => String(c.id) === String(btn.dataset.id));
        if (car) openServiceModal(car);
      });
    });

    resultCount.textContent = `Liczba wyników: ${filteredData.length}`;
    pageInfo.textContent = `Strona ${currentPage} z ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
  }

  function sortData(field) {
    data.sort((a, b) => {
      if (field === 'insurance') return sortOrder.insurance * (new Date(a.insurance) - new Date(b.insurance));
      if (field === 'production') return sortOrder.production * (new Date(a.production) - new Date(b.production));
    });

    headers.forEach(header => {
      if (header.dataset.sort === field) {
        header.textContent = header.textContent.replace(/⬍|⬆|⬇/, sortOrder[field] === 1 ? '⬆' : '⬇');
      } else {
        header.textContent = header.textContent.replace(/⬍|⬆|⬇/, '⬍');
      }
    });

    sortOrder[field] *= -1;
    applyFilter();
  }

  function applyFilter() {
    const query = searchInput.value.toLowerCase();
    const filtered = data.filter(car =>
      car.brand.toLowerCase().includes(query) ||
      car.model.toLowerCase().includes(query) ||
      car.regNumber.toLowerCase().includes(query)
    );
    renderTable(filtered);
  }

  function exportToCsv() {
    const headers = ["ID", "Marka", "Model", "Przypisany klient", "Numer rejestracyjny", "Ubezpieczenie", "Numer VIN", "Data produkcji"];
    const rows = data.map(car => [
      car.id, car.brand, car.model, car.client || 'wolny', car.regNumber, car.insurance, car.vin, car.production
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(";")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "vehicles.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  searchInput.addEventListener("input", () => {
    currentPage = 1;
    applyFilter();
  });

  headers.forEach(header => {
    header.addEventListener("click", () => {
      sortData(header.dataset.sort);
    });
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

  fetchData();
});

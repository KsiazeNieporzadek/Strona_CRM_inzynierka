document.addEventListener("DOMContentLoaded", () => {
  let data = [];
  let currentPage = 1;
  const itemsPerPage = 10;

  const tbody = document.getElementById("contracts-table-body");
  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");
  const exportBtn = document.getElementById("exportCsv");

  // ---- FE06.1: harmonogram spłat (terminy, kwoty, statusy poszczególnych rat) ----
  const scheduleModal = document.getElementById("scheduleModal");
  const scheduleModalTitle = document.getElementById("scheduleModalTitle");
  const scheduleTableBody = document.getElementById("scheduleTableBody");
  const closeScheduleModalBtn = document.getElementById("closeScheduleModal");

  // Umowa przechowuje tylko zagregowane dane (rata, czas trwania, kwota do spłaty),
  // a nie listę poszczególnych rat. Harmonogram budujemy więc na podstawie tych pól:
  // liczba rat = liczba miesięcy z "duration", terminy = kolejne miesiące od startDate,
  // a liczbę już opłaconych/pozostałych rat wyliczamy z relacji remainingAmount / monthlyInstallment.
  function computeInstallmentSchedule(contract) {
    const monthsMatch = String(contract.duration).match(/\d+/);
    const monthsCount = monthsMatch ? parseInt(monthsMatch[0], 10) : 0;
    const start = new Date(contract.startDate);
    const monthly = Number(contract.monthlyInstallment) || 0;

    let unpaidCount = 0;
    if (monthly > 0) {
      unpaidCount = Math.round(Number(contract.remainingAmount) / monthly);
      unpaidCount = Math.min(monthsCount, Math.max(0, unpaidCount));
    }

    const installments = [];
    for (let i = 1; i <= monthsCount; i++) {
      const due = new Date(start.getFullYear(), start.getMonth() + i, start.getDate());
      const isUnpaid = i > (monthsCount - unpaidCount);
      installments.push({
        number: i,
        dueDate: due.toISOString().slice(0, 10),
        amount: monthly,
        status: isUnpaid ? "Do zapłaty" : "Opłacona"
      });
    }
    return installments;
  }

  function openScheduleModal(contract) {
    scheduleModalTitle.textContent = `Harmonogram spłat — umowa ${contract.contractId} (${contract.clientName})`;
    const schedule = computeInstallmentSchedule(contract);
    scheduleTableBody.innerHTML = schedule.length
      ? schedule.map(row => `
          <tr class="border-b border-gray-700">
            <td class="px-3 py-2">${row.number}</td>
            <td class="px-3 py-2">${row.dueDate}</td>
            <td class="px-3 py-2">${row.amount.toLocaleString()} PLN</td>
            <td class="px-3 py-2 ${row.status === "Do zapłaty" ? "text-red-400" : "text-green-400"}">${row.status}</td>
          </tr>
        `).join("")
      : `<tr><td colspan="4" class="px-3 py-2 text-gray-400">Brak danych do zbudowania harmonogramu.</td></tr>`;
    scheduleModal.classList.remove("hidden");
  }

  closeScheduleModalBtn.addEventListener("click", () => {
    scheduleModal.classList.add("hidden");
  });

  fetch("data/contracts-finance.json")
    .then(response => response.json())
    .then(json => {
      data = json;
      renderTable();
    });

  function renderTable() {
    const totalPages = Math.ceil(data.length / itemsPerPage);
    currentPage = Math.min(Math.max(currentPage, 1), totalPages);

    const startIdx = (currentPage - 1) * itemsPerPage;
    const pageData = data.slice(startIdx, startIdx + itemsPerPage);

    tbody.innerHTML = "";
    pageData.forEach(item => {
      const tr = document.createElement("tr");
      tr.className = "border-b border-gray-700 hover:bg-gray-700";
      tr.innerHTML = `
        <td class="px-6 py-4">${item.contractId}</td>
        <td class="px-6 py-4">${item.clientName}</td>
        <td class="px-6 py-4">${item.clientId}</td>
        <td class="px-6 py-4">${item.startDate}</td>
        <td class="px-6 py-4">${item.endDate}</td>
        <td class="px-6 py-4">${item.financingAmount}</td>
        <td class="px-6 py-4">${item.duration}</td>
        <td class="px-6 py-4">${item.monthlyInstallment}</td>
        <td class="px-6 py-4">${item.contractValue}</td>
        <td class="px-6 py-4">${item.roi}</td>
        <td class="px-6 py-4">${item.remainingAmount}</td>
        <td class="px-6 py-4">
          <button class="schedule-btn px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs" data-id="${item.contractId}">
            Harmonogram
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".schedule-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const contract = data.find(c => c.contractId === btn.dataset.id);
        if (contract) openScheduleModal(contract);
      });
    });

    pageInfo.textContent = `Strona ${currentPage} z ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
  }

  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });

  nextPageBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(data.length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderTable();
    }
  });

  exportBtn.addEventListener("click", () => {
    let csv = "ID umowy,Imię i Nazwisko,ID klienta,Data zawarcia,Data zakończenia,Kwota finansowania,Czas trwania,Rata netto,Wartość umowy,ROI,Kwota do spłaty\n";
    data.forEach(item => {
      csv += `${item.contractId},"${item.clientName}",${item.clientId},${item.startDate},${item.endDate},${item.financingAmount},${item.duration},${item.monthlyInstallment},${item.contractValue},${item.roi},${item.remainingAmount}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "umowy_finanse.csv");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});

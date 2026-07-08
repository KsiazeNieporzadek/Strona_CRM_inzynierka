document.addEventListener("DOMContentLoaded", () => {
  let data = [];
  let currentPage = 1;
  const itemsPerPage = 10;

  const tbody = document.getElementById("contracts-table-body");
  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");
  const exportBtn = document.getElementById("exportCsv");

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
      `;
      tbody.appendChild(tr);
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

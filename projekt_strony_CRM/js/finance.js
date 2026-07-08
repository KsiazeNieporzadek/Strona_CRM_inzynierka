document.addEventListener("DOMContentLoaded", () => {
  let data = [];
  let currentPage = 1;
  const itemsPerPage = 10;

  const tbody = document.getElementById("finance-table-body");
  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");

fetch("data/finance.json")
  .then(response => response.json())
  .then(json => {
    const assigned = JSON.parse(localStorage.getItem("assignedPayments") || "[]");
    data = json.concat(assigned); // połącz dane z pliku z tymi z localStorage
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
      tr.className = `border-b hover:bg-gray-700 ${item.delayDays > 0 ? 'border-[#e0597f] bg-red-100' : ''}`;
      tr.innerHTML = `
        <td class="px-6 py-4">${item.id}</td>
        <td class="px-6 py-4">${item.invoice}</td>
        <td class="px-6 py-4">${item.amount}</td>
        <td class="px-6 py-4">${item.delayDays}</td>
      `;
      tbody.appendChild(tr);
    });

    pageInfo.textContent = `Strona ${currentPage} z ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
  }
    const exportBtn = document.getElementById("exportCsv");

  exportBtn.addEventListener("click", () => {
    let csv = "ID,Faktura,Kwota,Opóźnienie dni\n";
    data.forEach(item => {
      csv += `${item.id},${item.invoice},${item.amount},${item.delayDays}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "finanse.csv");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });


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
});

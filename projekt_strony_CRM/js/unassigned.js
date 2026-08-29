
Unassigned · JS
document.addEventListener("DOMContentLoaded", () => {
  let data = [];

  const tbody = document.getElementById("unassigned-table-body");
  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");
  const itemsPerPage = 10;
  let currentPage = 1;

  fetch("data/unassigned_transfers.json")
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
        <td class="px-6 py-4">${item.title}</td>
        <td class="px-6 py-4">${item.transferDate}</td>
        <td class="px-6 py-4">${item.accountNumber}</td>
        <td class="px-6 py-4">${item.amount}</td>
        <td class="px-6 py-4">${item.currency}</td>
        <td class="px-6 py-4">
          <button class="assign-btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" data-id="${item.id}">Przypisz</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    pageInfo.textContent = `Strona ${currentPage} z ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    document.querySelectorAll(".assign-btn").forEach(button => {
      button.addEventListener("click", (e) => {
        const id = parseInt(e.target.dataset.id);
        const record = data.find(item => item.id === id);

        const clientId = prompt("Podaj ID klienta do przypisania:");
        if (clientId) {
          record.clientId = clientId;

          // Zmapuj rekord na strukturę oczekiwaną przez widok "Wpłaty" (finance.js).
          // Rekord z nieprzypisanych wpłat opisuje przelew bankowy (title, transferDate,
          // accountNumber, currency), a nie wpłatę powiązaną z fakturą (invoice, delayDays) -
          // bez tego mapowania pola "invoice" i "delayDays" były po stronie finance.js
          // niezdefiniowane, przez co przypisana wpłata traciła nazwę faktury i liczbę dni
          // opóźnienia (zob. TC-08).
          const mappedRecord = {
            id: record.id,
            invoice: record.title,
            amount: record.amount,
            delayDays: 0,
            clientId: record.clientId
          };

          // Przenieś do przypisanych w localStorage
          const assigned = JSON.parse(localStorage.getItem("assignedPayments") || "[]");
          assigned.push(mappedRecord);
          localStorage.setItem("assignedPayments", JSON.stringify(assigned));

          // Usuń z nieprzypisanych
          data = data.filter(item => item.id !== id);
          renderTable();
        }
      });
    });
  }

  prevPageBtn.addEventListener("click", () => {
    currentPage--;
    renderTable();
  });

  nextPageBtn.addEventListener("click", () => {
    currentPage++;
    renderTable();
  });
});

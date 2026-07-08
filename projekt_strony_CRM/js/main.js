document.addEventListener("DOMContentLoaded", () => {
    fetch("data/clients.json")
      .then(response => response.json())
      .then(data => {
        const tbody = document.getElementById("clients-table-body");
        data.forEach(client => {
          const row = document.createElement("tr");
          row.className = "border-b hover:bg-gray-50";
  
          row.innerHTML = `
            <td class="px-6 py-4">${client.id}</td>
            <td class="px-6 py-4">${client.name}</td>
            <td class="px-6 py-4">${client.email}</td>
            <td class="px-6 py-4">${client.phone}</td>
            <td class="px-6 py-4">
              <span class="text-xs px-2 py-1 rounded-full ${
                client.status === "Aktywny"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-200 text-gray-700"
              }">${client.status}</span>
            </td>
            <td class="px-6 py-4 space-x-2">
              <button class="text-blue-600 hover:underline">Edytuj</button>
              <button class="text-red-600 hover:underline">Usuń</button>
            </td>
          `;
          tbody.appendChild(row);
        });
      })
      .catch(error => console.error("Błąd ładowania klientów:", error));
  });
  
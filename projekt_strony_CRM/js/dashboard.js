document.addEventListener("DOMContentLoaded", () => {
  const ctxRevenue = document.getElementById("revenueChart").getContext("2d");
  const ctxIndustry = document.getElementById("industryChart").getContext("2d");

  // ---- FE10.2: widoczność paneli i układ dashboardu ----
  const TILE_IDS = ["roiCard", "revenueCard", "topClientsCard", "paymentDelaysCard", "fleetCard", "industryCard"];

  function loadDashboardSettings() {
    try {
      return JSON.parse(localStorage.getItem("dashboardSettings") || "{}");
    } catch (e) {
      return {};
    }
  }
  function saveDashboardSettings(settings) {
    localStorage.setItem("dashboardSettings", JSON.stringify(settings));
  }

  const settings = loadDashboardSettings();
  const visibleTiles = settings.visibleTiles || {};
  const layout = settings.layout || "3";

  document.querySelectorAll(".tile-toggle").forEach(checkbox => {
    const tileId = checkbox.dataset.tile;
    const isVisible = visibleTiles[tileId] !== false; // domyślnie widoczny
    checkbox.checked = isVisible;
    document.getElementById(tileId).classList.toggle("hidden", !isVisible);

    checkbox.addEventListener("change", () => {
      document.getElementById(tileId).classList.toggle("hidden", !checkbox.checked);
      const current = loadDashboardSettings();
      current.visibleTiles = current.visibleTiles || {};
      current.visibleTiles[tileId] = checkbox.checked;
      saveDashboardSettings(current);
    });
  });

  const dashboardGrid = document.getElementById("dashboardGrid");
  const layoutSelect = document.getElementById("layoutSelect");
  const LAYOUT_CLASSES = {
    "1": ["grid-cols-1"],
    "2": ["grid-cols-1", "md:grid-cols-2"],
    "3": ["grid-cols-1", "md:grid-cols-2", "xl:grid-cols-3"]
  };
  function applyLayout(value) {
    dashboardGrid.classList.remove("grid-cols-1", "md:grid-cols-2", "xl:grid-cols-3");
    LAYOUT_CLASSES[value].forEach(c => dashboardGrid.classList.add(c));
  }
  layoutSelect.value = layout;
  applyLayout(layout);
  layoutSelect.addEventListener("change", () => {
    applyLayout(layoutSelect.value);
    const current = loadDashboardSettings();
    current.layout = layoutSelect.value;
    saveDashboardSettings(current);
  });

  // ---- FE10.3: filtrowanie danych wg przedziału czasu i innych kryteriów ----
  let revenueChartInstance = null;
  let fullRevenueData = null;

  function renderRevenueChart(months, values) {
    const chartData = {
      labels: months,
      datasets: [{
        label: 'Przychody brutto',
        data: values,
        backgroundColor: '#60a5fa' // blue-400
      }]
    };
    if (revenueChartInstance) {
      revenueChartInstance.data = chartData;
      revenueChartInstance.update();
      return;
    }
    revenueChartInstance = new Chart(ctxRevenue, {
      type: 'bar',
      data: chartData,
      options: {
        scales: {
          x: { ticks: { color: '#d1d5db' } },
          y: { ticks: { color: '#d1d5db' } }
        },
        plugins: {
          legend: { labels: { color: '#d1d5db' } }
        }
      }
    });
  }

  function applyRevenueRangeFilter() {
    const fromIdx = parseInt(document.getElementById("revenueFromMonth").value, 10);
    const toIdx = parseInt(document.getElementById("revenueToMonth").value, 10);
    if (!fullRevenueData || isNaN(fromIdx) || isNaN(toIdx) || fromIdx > toIdx) return;
    const months = fullRevenueData.months.slice(fromIdx, toIdx + 1);
    const values = fullRevenueData.values.slice(fromIdx, toIdx + 1);
    renderRevenueChart(months, values);
  }

fetch('data/revenue.json')
  .then(response => response.json())
  .then(revenueData => {
    fullRevenueData = revenueData;

    const fromSelect = document.getElementById("revenueFromMonth");
    const toSelect = document.getElementById("revenueToMonth");
    revenueData.months.forEach((month, idx) => {
      fromSelect.add(new Option(month, idx));
      toSelect.add(new Option(month, idx));
    });
    toSelect.value = String(revenueData.months.length - 1);

    fromSelect.addEventListener("change", applyRevenueRangeFilter);
    toSelect.addEventListener("change", applyRevenueRangeFilter);

    renderRevenueChart(revenueData.months, revenueData.values);
  });


  let industryChartInstance = null;
  let fullCityData = null;

  function renderIndustryChart(cities, values) {
    const chartData = {
      labels: cities,
      datasets: [{
        label: 'Aktywne leasingi',
        data: values,
        backgroundColor: '#3b82f6'
      }]
    };
    if (industryChartInstance) {
      industryChartInstance.data = chartData;
      industryChartInstance.update();
      return;
    }
    industryChartInstance = new Chart(ctxIndustry, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        scales: {
          x: { ticks: { color: '#d1d5db' } },
          y: { ticks: { color: '#d1d5db' }, beginAtZero: true }
        },
        plugins: {
          legend: { labels: { color: '#d1d5db' } }
        }
      }
    });
  }

  function applyCityFilter() {
    const checked = Array.from(document.querySelectorAll(".city-toggle:checked")).map(cb => cb.value);
    if (!fullCityData) return;
    const cities = [];
    const values = [];
    fullCityData.cities.forEach((city, idx) => {
      if (checked.includes(city)) {
        cities.push(city);
        values.push(fullCityData.values[idx]);
      }
    });
    renderIndustryChart(cities, values);
  }

fetch('data/industry_revenue.json')
  .then(response => response.json())
  .then(cityData => {
    fullCityData = cityData;
    const cityFilterEl = document.getElementById("cityFilter");
    cityData.cities.forEach(city => {
      const label = document.createElement("label");
      label.className = "flex items-center gap-1";
      label.innerHTML = `<input type="checkbox" class="city-toggle" value="${city}" checked> ${city}`;
      cityFilterEl.appendChild(label);
    });
    cityFilterEl.querySelectorAll(".city-toggle").forEach(cb => {
      cb.addEventListener("change", applyCityFilter);
    });

    renderIndustryChart(cityData.cities, cityData.values);
  });


  // Dalsze kafelki → bez zmian w danych, tylko pobieranie z JSON
 fetch('data/roi.json')
  .then(response => response.json())
  .then(roiData => {
    document.getElementById("roiCard").innerHTML = `
      <h2 class="text-lg font-bold mb-2">Podsumowanie ROI</h2>
      <p>Średnie ROI: <span class="font-semibold text-green-400">${roiData.average}%</span></p>
      <canvas id="roiChart" height="200"></canvas>
    `;

    const ctxRoi = document.getElementById("roiChart").getContext("2d");

    new Chart(ctxRoi, {
      type: 'bar',
      data: {
        labels: roiData.trend.months,
        datasets: [{
          label: 'ROI (%)',
          data: roiData.trend.roiValues,
          backgroundColor: '#4ade80' // green-400
        }]
      },
      options: {
        indexAxis: 'y', // <-- poziomy wykres
        scales: {
          x: { ticks: { color: '#d1d5db' } },
          y: { ticks: { color: '#d1d5db' } }
        },
        plugins: {
          legend: { labels: { color: '#d1d5db' } }
        }
      }
    });
  });


fetch('data/top_clients.json')
  .then(response => response.json())
  .then(topClientsData => {
    let tableRows = topClientsData.map(client => {
      const roiClass = client.roi >= 25 ? 'text-green-400' : client.roi >= 20 ? 'text-yellow-400' : 'text-red-400';
      const delayClass = client.avgDelay <= 1 ? 'text-green-400' : client.avgDelay <= 3 ? 'text-yellow-400' : 'text-red-400';
      return `
        <tr>
          <td class="px-2 py-1">${client.name}</td>
          <td class="px-2 py-1">${client.revenue.toLocaleString()} PLN</td>
          <td class="px-2 py-1 ${roiClass}">${client.roi}%</td>
          <td class="px-2 py-1 ${delayClass}">${client.avgDelay} dni</td>
        </tr>
      `;
    }).join('');

    document.getElementById("topClientsCard").innerHTML = `
      <h2 class="text-lg font-bold mb-2">Top 10 klientów</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-gray-400">
              <th class="px-2 py-1 text-left">Klient</th>
              <th class="px-2 py-1 text-left">Przychód</th>
              <th class="px-2 py-1 text-left">ROI</th>
              <th class="px-2 py-1 text-left">Opóźnienie</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    `;
  });



fetch('data/payment_delays.json')
  .then(response => response.json())
  .then(paymentDelaysData => {
    document.getElementById("paymentDelaysCard").innerHTML = `
      <h2 class="text-lg font-bold mb-2">Opóźnienia w płatnościach</h2>
      <p>Na czas: <span class="font-semibold text-green-400">${paymentDelaysData.onTime}%</span></p>
      <p>Opóźnione faktury: <span class="font-semibold text-red-400">${paymentDelaysData.late}</span></p>
      <p>Średnie opóźnienie: ${paymentDelaysData.averageDelayDays} dni</p>
      <canvas id="paymentDelayChart" height="150"></canvas>
    `;

    const ctxDelay = document.getElementById("paymentDelayChart").getContext("2d");

    new Chart(ctxDelay, {
      type: 'line',
      data: {
        labels: paymentDelaysData.trend.months,
        datasets: [{
          label: 'Opóźnione faktury',
          data: paymentDelaysData.trend.lateCounts,
          fill: false,
          borderColor: '#f87171', // red-400
          backgroundColor: '#f87171',
          tension: 0.3,
          pointBackgroundColor: '#f87171'
        }]
      },
      options: {
        scales: {
          x: { ticks: { color: '#d1d5db' } },
          y: { ticks: { color: '#d1d5db' } }
        },
        plugins: {
          legend: { labels: { color: '#d1d5db' } }
        }
      }
    });
  });



fetch('data/fleet_summary.json')
  .then(response => response.json())
  .then(fleetData => {
    const availablePercent = Math.round((fleetData.available / fleetData.total) * 100);
    const ageClass = fleetData.averageAge < 3
      ? 'text-green-400'
      : fleetData.averageAge <= 6
      ? 'text-yellow-400'
      : 'text-red-400';

    const topModelsList = fleetData.topModels
      .map(model => `<li>🌟 ${model.model} (${model.count})</li>`)
      .join('');

    const longestFreeList = fleetData.longestFree
      .map(car => `<li>🔑 ${car.regNumber} (${car.daysFree} dni wolne)</li>`)
      .join('');

    document.getElementById("fleetCard").innerHTML = `
      <h2 class="text-lg font-bold mb-4 text-gray-200">🚗 Podsumowanie floty</h2>
      <p class="text-gray-300">Pojazdy: <span class="font-semibold text-white">${fleetData.total}</span></p>
      <p class="text-gray-300">Średni wiek: <span class="font-semibold ${ageClass}">${fleetData.averageAge} lat</span></p>
      <p class="text-gray-300">Dostępne: <span class="font-semibold text-white">${fleetData.available}</span></p>

      <div class="mt-2 bg-gray-700 rounded-full h-2 w-full">
        <div class="bg-green-400 h-2 rounded-full" style="width: ${availablePercent}%"></div>
      </div>

      <h3 class="mt-4 font-semibold text-gray-300">🌟 Top modele:</h3>
      <ul class="list-disc list-inside text-sm text-gray-300">
        ${topModelsList}
      </ul>

      <h3 class="mt-4 font-semibold text-gray-300">🔑 Najdłużej wolne auta:</h3>
      <ul class="list-disc list-inside text-sm text-gray-300">
        ${longestFreeList}
      </ul>
    `;
  });



});

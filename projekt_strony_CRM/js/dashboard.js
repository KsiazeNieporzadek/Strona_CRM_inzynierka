document.addEventListener("DOMContentLoaded", () => {
  const ctxRevenue = document.getElementById("revenueChart").getContext("2d");
  const ctxIndustry = document.getElementById("industryChart").getContext("2d");

fetch('data/revenue.json')
  .then(response => response.json())
  .then(revenueData => {
    const chartData = {
      labels: revenueData.months,
      datasets: [{
        label: 'Przychody brutto',
        data: revenueData.values,
        backgroundColor: '#60a5fa' // blue-400
      }]
    };

    new Chart(ctxRevenue, {
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
  });


fetch('data/industry_revenue.json')
  .then(response => response.json())
  .then(cityData => {
    const chartData = {
      labels: cityData.cities,
      datasets: [{
        label: 'Aktywne leasingi',
        data: cityData.values,
        backgroundColor: '#3b82f6'
      }]
    };

    new Chart(ctxIndustry, {
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

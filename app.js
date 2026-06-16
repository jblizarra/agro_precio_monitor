const basePrices = [
  { product: "Tomate pera", category: "Hortalizas", retailer: "Mercadona", producer: 0.72, shelf: 2.29, weekly: 4.6, province: "Valencia" },
  { product: "Tomate pera", category: "Hortalizas", retailer: "Carrefour", producer: 0.72, shelf: 2.49, weekly: 7.1, province: "Madrid" },
  { product: "Tomate pera", category: "Hortalizas", retailer: "Alcampo", producer: 0.72, shelf: 2.15, weekly: 2.2, province: "Madrid" },
  { product: "Patata lavada", category: "Tuberculos", retailer: "Mercadona", producer: 0.38, shelf: 1.59, weekly: 1.4, province: "Castilla y Leon" },
  { product: "Patata lavada", category: "Tuberculos", retailer: "Dia", producer: 0.38, shelf: 1.79, weekly: 5.2, province: "Madrid" },
  { product: "Leche entera", category: "Lacteos", retailer: "Carrefour", producer: 0.51, shelf: 0.98, weekly: 0.6, province: "Galicia" },
  { product: "Leche entera", category: "Lacteos", retailer: "Eroski", producer: 0.51, shelf: 1.04, weekly: 1.1, province: "Pais Vasco" },
  { product: "Aceite oliva virgen extra", category: "Aceites", retailer: "Mercadona", producer: 5.92, shelf: 9.85, weekly: -2.5, province: "Jaen" },
  { product: "Aceite oliva virgen extra", category: "Aceites", retailer: "Alcampo", producer: 5.92, shelf: 9.39, weekly: -3.1, province: "Madrid" },
  { product: "Naranja mesa", category: "Fruta", retailer: "Lidl", producer: 0.46, shelf: 1.99, weekly: 3.7, province: "Valencia" },
  { product: "Naranja mesa", category: "Fruta", retailer: "Carrefour", producer: 0.46, shelf: 2.19, weekly: 4.4, province: "Sevilla" },
  { product: "Pollo entero", category: "Carne", retailer: "Mercadona", producer: 1.58, shelf: 3.49, weekly: 1.8, province: "Aragon" },
  { product: "Pollo entero", category: "Carne", retailer: "Dia", producer: 1.58, shelf: 3.79, weekly: 6.3, province: "Madrid" }
];

let priceData = [...basePrices];

const euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
const percent = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 });

const els = {
  productFilter: document.querySelector("#product-filter"),
  categoryFilter: document.querySelector("#category-filter"),
  retailerFilter: document.querySelector("#retailer-filter"),
  marginFilter: document.querySelector("#margin-filter"),
  marginLabel: document.querySelector("#margin-label"),
  table: document.querySelector("#price-table"),
  chart: document.querySelector("#price-chart"),
  insights: document.querySelector("#insights"),
  resultCount: document.querySelector("#result-count"),
  chartCount: document.querySelector("#chart-count"),
  metricProducts: document.querySelector("#metric-products"),
  metricRetailers: document.querySelector("#metric-retailers"),
  metricMargin: document.querySelector("#metric-margin"),
  metricAlerts: document.querySelector("#metric-alerts"),
  lastSync: document.querySelector("#last-sync"),
  refreshData: document.querySelector("#refresh-data"),
  exportCsv: document.querySelector("#export-csv"),
  csvInput: document.querySelector("#csv-input")
};

function marginOf(item) {
  return ((item.shelf - item.producer) / item.producer) * 100;
}

function statusOf(item) {
  const margin = marginOf(item);
  if (margin >= 250 || item.weekly >= 6) return { label: "Alerta", className: "alert" };
  if (margin >= 150 || item.weekly >= 3) return { label: "Vigilar", className: "watch" };
  return { label: "Normal", className: "ok" };
}

function unique(key) {
  return [...new Set(priceData.map((item) => item[key]))].sort((a, b) => a.localeCompare(b, "es"));
}

function populateSelect(select, values, allLabel) {
  const current = select.value;
  select.innerHTML = [`<option value="">${allLabel}</option>`, ...values.map((value) => `<option value="${value}">${value}</option>`)].join("");
  select.value = values.includes(current) ? current : "";
}

function refreshFilters() {
  populateSelect(els.productFilter, unique("product"), "Todos los productos");
  populateSelect(els.categoryFilter, unique("category"), "Todas las categorias");
  populateSelect(els.retailerFilter, unique("retailer"), "Todos los supermercados");
}

function getFilteredData() {
  const minMargin = Number(els.marginFilter.value);
  return priceData.filter((item) => {
    return (!els.productFilter.value || item.product === els.productFilter.value)
      && (!els.categoryFilter.value || item.category === els.categoryFilter.value)
      && (!els.retailerFilter.value || item.retailer === els.retailerFilter.value)
      && marginOf(item) >= minMargin;
  });
}

function updateMetrics(data) {
  const products = new Set(priceData.map((item) => item.product));
  const retailers = new Set(priceData.map((item) => item.retailer));
  const avgMargin = priceData.reduce((sum, item) => sum + marginOf(item), 0) / priceData.length;
  const alerts = priceData.filter((item) => statusOf(item).className === "alert").length;

  els.metricProducts.textContent = products.size;
  els.metricRetailers.textContent = retailers.size;
  els.metricMargin.textContent = `${percent.format(avgMargin)}%`;
  els.metricAlerts.textContent = alerts;
  els.resultCount.textContent = `${data.length} filas`;
  els.chartCount.textContent = `${data.length} registros`;
}

function renderTable(data) {
  if (!data.length) {
    els.table.innerHTML = `<tr><td colspan="8">No hay registros con los filtros actuales.</td></tr>`;
    return;
  }

  els.table.innerHTML = data.map((item) => {
    const status = statusOf(item);
    return `
      <tr>
        <td><strong>${item.product}</strong><br><small>${item.province}</small></td>
        <td>${item.category}</td>
        <td>${item.retailer}</td>
        <td>${euro.format(item.producer)}</td>
        <td>${euro.format(item.shelf)}</td>
        <td><strong>${percent.format(marginOf(item))}%</strong></td>
        <td>${item.weekly > 0 ? "+" : ""}${item.weekly.toFixed(1)}%</td>
        <td><span class="status ${status.className}">${status.label}</span></td>
      </tr>
    `;
  }).join("");
}

function renderChart(data) {
  const limited = [...data]
    .sort((a, b) => marginOf(b) - marginOf(a))
    .slice(0, 8);
  const maxPrice = Math.max(...limited.flatMap((item) => [item.shelf, item.producer]), 1);

  if (!limited.length) {
    els.chart.innerHTML = `<div class="insight"><strong>Sin datos</strong><span>Ajusta los filtros o importa un CSV con nuevas lecturas.</span></div>`;
    return;
  }

  els.chart.innerHTML = limited.map((item) => {
    const shelfWidth = (item.shelf / maxPrice) * 100;
    const producerWidth = (item.producer / maxPrice) * 100;
    return `
      <div class="bar-row">
        <div class="bar-label">${item.product}<br><small>${item.retailer}</small></div>
        <div>
          <div class="bar-track" title="Precio supermercado">
            <div class="bar-fill" style="width: ${shelfWidth}%"></div>
          </div>
          <div class="bar-track" title="Precio productor">
            <div class="bar-fill origin" style="width: ${producerWidth}%"></div>
          </div>
        </div>
        <div class="bar-value">${euro.format(item.shelf)}<br><small>${euro.format(item.producer)}</small></div>
      </div>
    `;
  }).join("");
}

function renderInsights(data) {
  if (!data.length) {
    els.insights.innerHTML = `<div class="insight"><strong>Sin lectura</strong><span>No hay comparaciones disponibles para estos filtros.</span></div>`;
    return;
  }

  const highestMargin = [...data].sort((a, b) => marginOf(b) - marginOf(a))[0];
  const fastestRise = [...data].sort((a, b) => b.weekly - a.weekly)[0];
  const closestToOrigin = [...data].sort((a, b) => marginOf(a) - marginOf(b))[0];

  els.insights.innerHTML = [
    {
      title: "Mayor brecha",
      text: `${highestMargin.product} en ${highestMargin.retailer}: ${percent.format(marginOf(highestMargin))}% sobre origen.`
    },
    {
      title: "Mayor subida semanal",
      text: `${fastestRise.product} en ${fastestRise.retailer}: ${fastestRise.weekly > 0 ? "+" : ""}${fastestRise.weekly.toFixed(1)}%.`
    },
    {
      title: "Precio mas cercano al productor",
      text: `${closestToOrigin.product} en ${closestToOrigin.retailer}: ${percent.format(marginOf(closestToOrigin))}% de margen.`
    }
  ].map((item) => `
    <div class="insight">
      <strong>${item.title}</strong>
      <span>${item.text}</span>
    </div>
  `).join("");
}

function render() {
  els.marginLabel.textContent = `${els.marginFilter.value}%`;
  const data = getFilteredData();
  updateMetrics(data);
  renderTable(data);
  renderChart(data);
  renderInsights(data);
}

function randomizeData() {
  priceData = priceData.map((item) => {
    const drift = 1 + ((Math.random() - 0.42) * 0.08);
    const weekly = item.weekly + ((Math.random() - 0.5) * 2.2);
    return {
      ...item,
      shelf: Number(Math.max(item.producer * 1.05, item.shelf * drift).toFixed(2)),
      weekly: Number(weekly.toFixed(1))
    };
  });
  els.lastSync.textContent = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
  render();
}

function exportCsv() {
  const header = "product,categoria,supermercado,precio_productor,precio_lineal,variacion_semanal,provincia";
  const rows = priceData.map((item) => [
    item.product,
    item.category,
    item.retailer,
    item.producer,
    item.shelf,
    item.weekly,
    item.province
  ].join(","));
  const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "agroprecio-datos.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function importCsv(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const rows = String(reader.result).split(/\r?\n/).slice(1).filter(Boolean);
    const imported = rows.map((row) => {
      const [product, category, retailer, producer, shelf, weekly, province] = row.split(",").map((value) => value.trim());
      return {
        product,
        category,
        retailer,
        producer: Number(producer),
        shelf: Number(shelf),
        weekly: Number(weekly),
        province
      };
    }).filter((item) => item.product && item.retailer && Number.isFinite(item.producer) && Number.isFinite(item.shelf));

    if (imported.length) {
      priceData = imported;
      refreshFilters();
      render();
    }
  };
  reader.readAsText(file);
}

["change", "input"].forEach((eventName) => {
  [els.productFilter, els.categoryFilter, els.retailerFilter, els.marginFilter].forEach((control) => {
    control.addEventListener(eventName, render);
  });
});

els.refreshData.addEventListener("click", randomizeData);
els.exportCsv.addEventListener("click", exportCsv);
els.csvInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (file) importCsv(file);
});

refreshFilters();
render();

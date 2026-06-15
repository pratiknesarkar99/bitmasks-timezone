import { loadCities } from "./data.js";
import { searchByOffset, searchExcludingOffset } from "./search.js";

const input = document.getElementById("gmt-input");
const findBtn = document.getElementById("find-btn");
const resultsSection = document.getElementById("results-section");
const resultsHeading = document.getElementById("results-heading");
const resultsList = document.getElementById("results-list");
const errorMsg = document.getElementById("error-msg");
const filterSection = document.getElementById("filter-section");
const pillContainer = document.getElementById("pill-container");
const showMoreBtn = document.getElementById("show-more-btn");

const PAGE_SIZE = 50;
const PILL_LIMIT = 10;

let cities = [];
let currentResults = [];
let filteredResults = [];
let activePills = new Set();
let showingAllPills = false;
let allIanaIds = [];
let currentPage = 1;

// --- Formatting ---

function formatOffset(offset) {
  const sign = offset < 0 ? "-" : "+";
  const abs = Math.abs(offset);
  const hours = Math.floor(abs);
  const minutes = Math.round((abs - hours) * 60);
  const paddedMin = String(minutes).padStart(2, "0");
  return `GMT ${sign}${hours}:${paddedMin}`;
}

function formatIanaId(id) {
  return id.replace(/\//g, " · ");
}

function cityRow(city) {
  return `
    <li>
      <span class="city-name">${city.name}</span>
      <span class="city-offset">${formatOffset(city.gmtOffset)}</span>
    </li>
  `;
}

// --- Stats ---

function populateStats() {
  const total = cities.length;
  const offsets = [...new Set(cities.map(c => c.gmtOffset))].sort((a, b) => a - b);
  const min = offsets[0];
  const max = offsets[offsets.length - 1];

  const countByOffset = {};
  for (const city of cities) {
    countByOffset[city.gmtOffset] = (countByOffset[city.gmtOffset] || 0) + 1;
  }
  const busiestOffset = Object.entries(countByOffset).sort((a, b) => b[1] - a[1])[0];

  document.getElementById("stat-total").textContent = total.toLocaleString();
  document.getElementById("stat-offsets").textContent = offsets.length;
  document.getElementById("stat-range").textContent = `${formatOffset(min)} to ${formatOffset(max)}`;
  document.getElementById("stat-largest").textContent = `${formatOffset(Number(busiestOffset[0]))} (${busiestOffset[1].toLocaleString()})`;
}

// --- Pills ---

function buildPills(results) {
  const countById = {};
  for (const city of results) {
    countById[city.timezoneId] = (countById[city.timezoneId] || 0) + 1;
  }

  allIanaIds = Object.keys(countById).sort();
  activePills.clear();
  showingAllPills = false;

  if (allIanaIds.length <= 1) {
    filterSection.hidden = true;
    return;
  }

  filterSection.hidden = false;
  renderPills(countById);
}

function renderPills(countById) {
  const visibleIds = showingAllPills ? allIanaIds : allIanaIds.slice(0, PILL_LIMIT);

  pillContainer.innerHTML = visibleIds.map(id => `
    <span class="pill ${activePills.has(id) ? "active" : ""}" data-id="${id}">
      ${formatIanaId(id)}
      <span class="pill-count">${countById[id].toLocaleString()}</span>
    </span>
  `).join("");

  if (allIanaIds.length > PILL_LIMIT) {
    const remaining = allIanaIds.length - PILL_LIMIT;
    showMoreBtn.hidden = false;
    showMoreBtn.textContent = showingAllPills ? "Show less" : `Show ${remaining} more`;
  } else {
    showMoreBtn.hidden = true;
  }
}

function refreshPills() {
  const countById = {};
  for (const city of currentResults) {
    countById[city.timezoneId] = (countById[city.timezoneId] || 0) + 1;
  }
  renderPills(countById);
}

// --- Pagination ---

function getPagination(total, page) {
  return {
    totalPages: Math.ceil(total / PAGE_SIZE),
    start: (page - 1) * PAGE_SIZE,
    end: page * PAGE_SIZE,
  };
}

function renderPagination(total) {
  const existing = document.getElementById("pagination");
  if (existing) existing.remove();

  if (total <= PAGE_SIZE) return;

  const { totalPages } = getPagination(total, currentPage);

  const nav = document.createElement("div");
  nav.id = "pagination";
  nav.className = "pagination";
  nav.innerHTML = `
    <button id="prev-btn" ${currentPage === 1 ? "disabled" : ""}>← Prev</button>
    <span class="page-info">Page ${currentPage} of ${totalPages}</span>
    <button id="next-btn" ${currentPage === totalPages ? "disabled" : ""}>Next →</button>
  `;

  resultsSection.appendChild(nav);

  document.getElementById("prev-btn").addEventListener("click", () => {
    currentPage--;
    renderPage();
  });

  document.getElementById("next-btn").addEventListener("click", () => {
    currentPage++;
    renderPage();
  });
}

function renderPage() {
  const total = filteredResults.length;
  const { start, end } = getPagination(total, currentPage);
  const pageResults = filteredResults.slice(start, end);

  resultsList.innerHTML = pageResults.map(cityRow).join("");
  renderPagination(total);

  // Scroll back to results heading when page changes.
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

// --- Filter ---

function applyFilter() {
  filteredResults = activePills.size === 0
    ? currentResults
    : currentResults.filter(city => activePills.has(city.timezoneId));

  currentPage = 1;

  const count = filteredResults.length;
  const mode = getSelectedMode();
  const offsetLabel = formatOffset(parseFloat(input.value));
  const cityWord = count === 1 ? "city" : "cities";
  const context = mode === "include" ? `in ${offsetLabel}` : `outside ${offsetLabel}`;

  resultsHeading.innerHTML = count === 0
    ? `No cities match the selected filters`
    : `<span class="count-number">${count.toLocaleString()}</span> ${cityWord} ${context}`;

  renderPage();
}

// --- Event listeners ---

pillContainer.addEventListener("click", e => {
  const pill = e.target.closest(".pill");
  if (!pill) return;

  const id = pill.dataset.id;
  if (activePills.has(id)) {
    activePills.delete(id);
    pill.classList.remove("active");
  } else {
    activePills.add(id);
    pill.classList.add("active");
  }

  applyFilter();
});

showMoreBtn.addEventListener("click", () => {
  showingAllPills = !showingAllPills;
  refreshPills();
});

function clearResults() {
  resultsSection.hidden = true;
  resultsList.innerHTML = "";
  filterSection.hidden = true;
  pillContainer.innerHTML = "";
  showMoreBtn.hidden = true;
  activePills.clear();
  currentResults = [];
  filteredResults = [];
  currentPage = 1;
  const existing = document.getElementById("pagination");
  if (existing) existing.remove();
  errorMsg.hidden = true;
  errorMsg.textContent = "";
}

function getSelectedMode() {
  return document.querySelector('input[name="search-mode"]:checked').value;
}

function handleSearch() {
  clearResults();

  const mode = getSelectedMode();
  const { results, error } = mode === "include"
    ? searchByOffset(cities, input.value)
    : searchExcludingOffset(cities, input.value);

  if (error) {
    errorMsg.textContent = error;
    errorMsg.hidden = false;
    return;
  }

  resultsSection.hidden = false;
  currentResults = results;
  filteredResults = results;

  const offsetLabel = formatOffset(parseFloat(input.value));
  const count = results.length;

  if (count === 0) {
    resultsHeading.innerHTML = `No cities found`;
    resultsList.innerHTML = `<li style="color:#6b6b6b; font-size:0.88rem;">No cities in our list match this search.</li>`;
    return;
  }

  const cityWord = count === 1 ? "city" : "cities";
  const context = mode === "include" ? `in ${offsetLabel}` : `outside ${offsetLabel}`;
  resultsHeading.innerHTML = `<span class="count-number">${count.toLocaleString()}</span> ${cityWord} ${context}`;

  buildPills(results);
  renderPage();
}

findBtn.addEventListener("click", handleSearch);
input.addEventListener("keydown", e => {
  if (e.key === "Enter") handleSearch();
});

loadCities().then(loaded => {
  cities = loaded;
  populateStats();
  findBtn.disabled = false;
}).catch(() => {
  errorMsg.textContent = "Failed to load city data. Make sure cities.json is in the same folder and you are running a local server.";
  errorMsg.hidden = false;
});

findBtn.disabled = true;
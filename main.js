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

const LIMIT = 100;
const PILL_LIMIT = 10;

let cities = [];
let currentResults = [];
let activePills = new Set();
let showingAllPills = false;
let allIanaIds = [];

// --- Formatting ---

function formatOffset(offset) {
  const sign = offset < 0 ? "-" : "+";
  const abs = Math.abs(offset);
  const hours = Math.floor(abs);
  const minutes = Math.round((abs - hours) * 60);
  const paddedMin = String(minutes).padStart(2, "0");
  return `GMT ${sign}${hours}:${paddedMin}`;
}

// Africa/Algiers -> Africa · Algiers
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

  // Show more / show less button
  if (allIanaIds.length > PILL_LIMIT) {
    const remaining = allIanaIds.length - PILL_LIMIT;
    showMoreBtn.hidden = false;
    showMoreBtn.textContent = showingAllPills
      ? "Show less"
      : `Show ${remaining} more`;
  } else {
    showMoreBtn.hidden = true;
  }
}

// Re-render pills keeping the same countById, called when toggling show more.
function refreshPills() {
  const countById = {};
  for (const city of currentResults) {
    countById[city.timezoneId] = (countById[city.timezoneId] || 0) + 1;
  }
  renderPills(countById);
}

// --- Result rendering ---

function renderResults(results) {
  const count = results.length;
  const visible = results.slice(0, LIMIT);

  resultsList.innerHTML = visible.map(cityRow).join("");

  if (count > LIMIT) {
    resultsList.innerHTML += `
      <li class="result-cap-note">
        Showing ${LIMIT} of ${count.toLocaleString()} cities.
      </li>
    `;
  }
}

// Apply active pill filters to currentResults and re-render.
function applyFilter() {
  const filtered = activePills.size === 0
    ? currentResults
    : currentResults.filter(city => activePills.has(city.timezoneId));

  const count = filtered.length;
  const mode = getSelectedMode();
  const offsetLabel = formatOffset(parseFloat(input.value));
  const cityWord = count === 1 ? "city" : "cities";
  const context = mode === "include" ? `in ${offsetLabel}` : `outside ${offsetLabel}`;

  resultsHeading.innerHTML = count === 0
    ? `No cities match the selected filters`
    : `<span class="count-number">${count.toLocaleString()}</span> ${cityWord} ${context}`;

  renderResults(filtered);
}

// --- Event listeners ---

// Pill clicks: toggle active state and re-filter.
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

// Show more / show less toggle.
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
  renderResults(results);
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
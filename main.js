import { loadCities } from "./data.js";
import { searchByOffset, searchExcludingOffset } from "./search.js";

const input = document.getElementById("gmt-input");
const findBtn = document.getElementById("find-btn");
const resultsSection = document.getElementById("results-section");
const resultsHeading = document.getElementById("results-heading");
const resultsList = document.getElementById("results-list");
const errorMsg = document.getElementById("error-msg");

// Cities are loaded once at startup and held in memory for all searches.
let cities = [];

function formatOffset(offset) {
  const sign = offset < 0 ? "-" : "+";
  const abs = Math.abs(offset);
  const hours = Math.floor(abs);
  const minutes = Math.round((abs - hours) * 60);
  const paddedMin = String(minutes).padStart(2, "0");
  return `GMT ${sign}${hours}:${paddedMin}`;
}

function cityRow(city) {
  return `
    <li>
      <span class="city-name">${city.name}</span>
      <span class="city-offset">${formatOffset(city.gmtOffset)}</span>
    </li>
  `;
}

function populateStats() {
  const total = cities.length;
  const offsets = [...new Set(cities.map(c => c.gmtOffset))].sort((a, b) => a - b);
  const min = offsets[0];
  const max = offsets[offsets.length - 1];

  const countByOffset = {};
  for (const city of cities) {
    countByOffset[city.gmtOffset] = (countByOffset[city.gmtOffset] || 0) + 1;
  }
  const busiestOffset = Object.entries(countByOffset)
    .sort((a, b) => b[1] - a[1])[0];

  document.getElementById("stat-total").textContent = total.toLocaleString();
  document.getElementById("stat-offsets").textContent = offsets.length;
  document.getElementById("stat-range").textContent = `${formatOffset(min)} to ${formatOffset(max)}`;
  document.getElementById("stat-largest").textContent = `${formatOffset(Number(busiestOffset[0]))} (${busiestOffset[1].toLocaleString()})`;
}

function clearResults() {
  resultsSection.hidden = true;
  resultsList.innerHTML = "";
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

  resultsList.innerHTML = results.map(cityRow).join("");
}

findBtn.addEventListener("click", handleSearch);
input.addEventListener("keydown", e => {
  if (e.key === "Enter") handleSearch();
});

// Load cities on startup, then populate stats and enable the UI.
loadCities().then(loaded => {
  cities = loaded;
  populateStats();
  findBtn.disabled = false;
}).catch(err => {
  console.error("Failed to load cities.json:", err);
  errorMsg.textContent = "Failed to load city data. Make sure cities.json is in the same folder and you are running a local server.";
  errorMsg.hidden = false;
});

// Disable the button until data is ready.
findBtn.disabled = true;
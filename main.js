import { citiesWithMasks } from "./data.js";
import { searchByOffset, searchExcludingOffset } from "./search.js";

const input = document.getElementById("gmt-input");
const findBtn = document.getElementById("find-btn");
const cityList = document.getElementById("city-list");
const resultsSection = document.getElementById("results-section");
const resultsHeading = document.getElementById("results-heading");
const resultsList = document.getElementById("results-list");
const errorMsg = document.getElementById("error-msg");

function renderAllCities() {
  cityList.innerHTML = citiesWithMasks
    .map(city => `
      <li>
        <span class="city-name">${city.name}</span>
        <span class="city-offset">GMT ${city.gmtOffset >= 0 ? "+" : ""}${city.gmtOffset}</span>
      </li>
    `)
    .join("");
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

function formatOffset(val) {
  return `GMT ${Number(val) >= 0 ? "+" : ""}${val}`;
}

function handleSearch() {
  clearResults();

  const mode = getSelectedMode();
  const { results, error } = mode === "include"
    ? searchByOffset(input.value)
    : searchExcludingOffset(input.value);

  if (error) {
    errorMsg.textContent = error;
    errorMsg.hidden = false;
    return;
  }

  resultsSection.hidden = false;

  const offsetLabel = formatOffset(input.value);
  const count = results.length;

  if (count === 0) {
    resultsHeading.innerHTML = `No cities found`;
    resultsList.innerHTML = `<li style="color:#6b6b6b; font-size:0.88rem;">No cities in our list match this search.</li>`;
    return;
  }

  const cityWord = count === 1 ? "city" : "cities";
  const context = mode === "include" ? `in ${offsetLabel}` : `outside ${offsetLabel}`;
  resultsHeading.innerHTML = `<span class="count-number">${count}</span> ${cityWord} ${context}`;

  resultsList.innerHTML = results
    .map(city => `
      <li>
        <span class="city-name">${city.name}</span>
        <span class="city-offset">GMT ${city.gmtOffset >= 0 ? "+" : ""}${city.gmtOffset}</span>
      </li>
    `)
    .join("");
}

findBtn.addEventListener("click", handleSearch);

input.addEventListener("keydown", e => {
  if (e.key === "Enter") handleSearch();
});

renderAllCities();
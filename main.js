import { citiesWithMasks } from "./data.js";
import { searchByOffset } from "./search.js";

const input = document.getElementById("gmt-input");
const findBtn = document.getElementById("find-btn");
const cityList = document.getElementById("city-list");
const resultsSection = document.getElementById("results-section");
const resultsHeading = document.getElementById("results-heading");
const resultsList = document.getElementById("results-list");
const errorMsg = document.getElementById("error-msg");

// Render all cities on load so the user can see what's available.
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

function handleSearch() {
  clearResults();

  const { results, error } = searchByOffset(input.value);

  if (error) {
    errorMsg.textContent = error;
    errorMsg.hidden = false;
    return;
  }

  resultsSection.hidden = false;

  if (results.length === 0) {
    resultsHeading.textContent = `No cities found for GMT ${input.value}`;
    resultsList.innerHTML = `<li style="color:#6b6b6b; font-size:0.88rem;">No cities in our list match this offset.</li>`;
    return;
  }

  resultsHeading.textContent = `${results.length} ${results.length === 1 ? "city" : "cities"} at GMT ${Number(input.value) >= 0 ? "+" : ""}${input.value}`;

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

// Also allow pressing Enter from the input.
input.addEventListener("keydown", e => {
  if (e.key === "Enter") handleSearch();
});

renderAllCities();
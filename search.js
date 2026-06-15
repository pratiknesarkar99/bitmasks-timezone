import { getBitmask } from "./data.js";

function validateOffset(gmtOffset) {
  const offset = parseFloat(gmtOffset);
  if (isNaN(offset) || offset < -14 || offset > 14 || (offset * 4) % 1 !== 0) {
    return { error: "Please enter a valid GMT offset between -14 and +14 (e.g. 5.5 for GMT+5:30, 5.75 for GMT+5:45)." };
  }
  return { offset };
}

function searchByOffset(cities, gmtOffset) {
  const { offset, error } = validateOffset(gmtOffset);
  if (error) return { error };

  const searchMask = getBitmask(offset);
  const results = cities.filter(city => (city.bitmask & searchMask) !== 0n);
  return { results };
}

function searchExcludingOffset(cities, gmtOffset) {
  const { offset, error } = validateOffset(gmtOffset);
  if (error) return { error };

  const searchMask = getBitmask(offset);
  const exclusionMask = ~searchMask;
  const results = cities.filter(city => (city.bitmask & exclusionMask) !== 0n);
  return { results };
}

export { searchByOffset, searchExcludingOffset };
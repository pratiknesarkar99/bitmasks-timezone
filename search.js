import { citiesWithMasks, getBitmask } from "./data.js";

// Takes a GMT offset (integer between -12 and +12).
// Returns an array of city objects whose bitmask matches the search mask.
function searchByOffset(gmtOffset) {
  const offset = parseInt(gmtOffset, 10);

  if (isNaN(offset) || offset < -12 || offset > 12) {
    return { error: "Please enter a valid GMT offset between -12 and +12." };
  }

  const searchMask = getBitmask(offset);

  const results = citiesWithMasks.filter(city => (city.bitmask & searchMask) !== 0);

  return { results };
}

// Takes a GMT offset and returns all cities NOT in that timezone.
// ~searchMask flips every bit, so AND-ing against it matches any city
// whose bit is set somewhere other than the target timezone position.
function searchExcludingOffset(gmtOffset) {
  const offset = parseInt(gmtOffset, 10);

  if (isNaN(offset) || offset < -12 || offset > 12) {
    return { error: "Please enter a valid GMT offset between -12 and +12." };
  }

  const searchMask = getBitmask(offset);
  const exclusionMask = ~searchMask;

  const results = citiesWithMasks.filter(city => (city.bitmask & exclusionMask) !== 0);

  return { results };
}

export { searchByOffset, searchExcludingOffset };
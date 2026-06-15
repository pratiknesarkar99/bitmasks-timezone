import { citiesWithMasks, getBitmask } from "./data.js";

function validateOffset(gmtOffset) {
  const offset = parseFloat(gmtOffset);
  // Real offsets go down to 15-minute increments (e.g. Kathmandu +5:45 = 5.75).
  if (isNaN(offset) || offset < -12 || offset > 12 || (offset * 4) % 1 !== 0) {
    return { error: "Please enter a valid GMT offset between -12 and +12 (e.g. 5.5 for GMT+5:30, 5.75 for GMT+5:45)." };
  }
  return { offset };
}

function searchByOffset(gmtOffset) {
  const { offset, error } = validateOffset(gmtOffset);
  if (error) return { error };

  const searchMask = getBitmask(offset);
  const results = citiesWithMasks.filter(city => (city.bitmask & searchMask) !== 0n);
  return { results };
}

function searchExcludingOffset(gmtOffset) {
  const { offset, error } = validateOffset(gmtOffset);
  if (error) return { error };

  const searchMask = getBitmask(offset);
  const exclusionMask = ~searchMask;
  const results = citiesWithMasks.filter(city => (city.bitmask & exclusionMask) !== 0n);
  return { results };
}

export { searchByOffset, searchExcludingOffset };
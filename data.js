// Each city has a name and a GMT offset (integer).
// We'll compute its bitmask from the offset using:
//   bitPosition = gmtOffset + 12
//   bitmask = 1 << bitPosition
//
// This maps GMT -12 -> bit 0, GMT 0 -> bit 12, GMT +12 -> bit 24.

const cities = [
    { name: "Moscow", gmtOffset: 3 },
    { name: "Paris", gmtOffset: 2 },
    { name: "Berlin", gmtOffset: 2 },
    { name: "Brussels", gmtOffset: 2 },
    { name: "Amsterdam", gmtOffset: 2 },
    { name: "Rome", gmtOffset: 2 },
    { name: "London", gmtOffset: 1 },
    { name: "Dublin", gmtOffset: 1 },
    { name: "New York", gmtOffset: -4 },
    { name: "Washington DC", gmtOffset: -4 },
    { name: "St. Louis", gmtOffset: -5 },
    { name: "Los Angeles", gmtOffset: -7 },
    { name: "Tokyo", gmtOffset: 9 },
    { name: "Beijing", gmtOffset: 8 },
    { name: "Ho Chi Minh City", gmtOffset: 7 },
    { name: "Mumbai", gmtOffset: 5 },
];

function getBitmask(gmtOffset) {
    const bitPosition = gmtOffset + 12;
    return 1 << bitPosition;
}

// Attach the computed bitmask to each city.
const citiesWithMasks = cities.map(city => ({
    ...city,
    bitmask: getBitmask(city.gmtOffset),
}));

export { citiesWithMasks, getBitmask };
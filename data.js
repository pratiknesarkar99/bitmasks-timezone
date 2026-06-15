// Offsets are stored as decimals: GMT+5:30 = 5.5, GMT-3:30 = -3.5
// Bitmask formula (BigInt):
//   bitPosition = (gmtOffset * 2) + 24
//   bitmask = 1n << BigInt(bitPosition)
//
// Multiplying by 2 converts to half-hour slots.
// Adding 24 shifts everything positive (GMT-12 = slot 0, GMT 0 = slot 24, GMT+12 = slot 48).
// BigInt is required because 48 bit positions exceed JS's 32-bit limit for bitwise ops.

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
    { name: "Mumbai", gmtOffset: 5.5 },
];

function getBitmask(gmtOffset) {
    const bitPosition = (gmtOffset * 2) + 24;
    return 1n << BigInt(bitPosition);
}

const citiesWithMasks = cities.map(city => ({
    ...city,
    bitmask: getBitmask(city.gmtOffset),
}));

export { citiesWithMasks, getBitmask };
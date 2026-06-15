// Offsets are stored as decimals: GMT+5:30 = 5.5, GMT+5:45 = 5.75
// Bitmask formula (BigInt):
//   bitPosition = (gmtOffset * 4) + 56
//   bitmask = 1n << BigInt(bitPosition)
//
// Multiplying by 4 converts to quarter-hour slots (covers :00, :15, :30, :45).
// Adding 56 shifts everything positive so GMT-14 = slot 0, GMT 0 = slot 56, GMT+14 = slot 112.
// Extended to +/-14 to cover real-world offsets like Tonga (GMT+13) and Kiribati (GMT+14).
// BigInt handles the full 112 bit range with no issues.

function getBitmask(gmtOffset) {
    const bitPosition = (gmtOffset * 4) + 56;
    return 1n << BigInt(bitPosition);
}

async function loadCities() {
    const response = await fetch("./cities.json");
    const citiesData = await response.json();
    return citiesData.map(city => ({
        ...city,
        bitmask: getBitmask(city.gmtOffset),
    }));
}

export { loadCities, getBitmask };
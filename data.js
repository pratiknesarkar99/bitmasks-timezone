// Offsets are stored as decimals: GMT+5:30 = 5.5, GMT+5:45 = 5.75
// Bitmask formula (BigInt):
//   bitPosition = (gmtOffset * 4) + 48
//   bitmask = 1n << BigInt(bitPosition)
//
// Multiplying by 4 converts to quarter-hour slots (covers :00, :15, :30, :45).
// Adding 48 shifts everything positive (GMT-12 = slot 0, GMT 0 = slot 48, GMT+12 = slot 96).
// BigInt handles the full 96 bit range with no issues.

const cities = [
    // GMT -12
    { name: "Baker Island", gmtOffset: -12 },

    // GMT -11
    { name: "Pago Pago", gmtOffset: -11 },
    { name: "Niue", gmtOffset: -11 },

    // GMT -10
    { name: "Honolulu", gmtOffset: -10 },
    { name: "Tahiti", gmtOffset: -10 },

    // GMT -9:30
    { name: "Marquesas Islands", gmtOffset: -9.5 },

    // GMT -9
    { name: "Anchorage", gmtOffset: -9 },
    { name: "Juneau", gmtOffset: -9 },

    // GMT -8
    { name: "Los Angeles", gmtOffset: -8 },
    { name: "San Francisco", gmtOffset: -8 },
    { name: "Seattle", gmtOffset: -8 },
    { name: "Vancouver", gmtOffset: -8 },
    { name: "Las Vegas", gmtOffset: -8 },

    // GMT -7
    { name: "Denver", gmtOffset: -7 },
    { name: "Phoenix", gmtOffset: -7 },
    { name: "Calgary", gmtOffset: -7 },

    // GMT -6
    { name: "Chicago", gmtOffset: -6 },
    { name: "Houston", gmtOffset: -6 },
    { name: "Mexico City", gmtOffset: -6 },
    { name: "St. Louis", gmtOffset: -6 },
    { name: "Winnipeg", gmtOffset: -6 },

    // GMT -5
    { name: "New York", gmtOffset: -5 },
    { name: "Washington DC", gmtOffset: -5 },
    { name: "Toronto", gmtOffset: -5 },
    { name: "Miami", gmtOffset: -5 },
    { name: "Boston", gmtOffset: -5 },
    { name: "Lima", gmtOffset: -5 },
    { name: "Bogota", gmtOffset: -5 },

    // GMT -4:30
    { name: "Caracas", gmtOffset: -4.5 },

    // GMT -4
    { name: "Santiago", gmtOffset: -4 },
    { name: "La Paz", gmtOffset: -4 },
    { name: "Halifax", gmtOffset: -4 },
    { name: "Manaus", gmtOffset: -4 },

    // GMT -3:30
    { name: "St. John's", gmtOffset: -3.5 },

    // GMT -3
    { name: "São Paulo", gmtOffset: -3 },
    { name: "Rio de Janeiro", gmtOffset: -3 },
    { name: "Buenos Aires", gmtOffset: -3 },
    { name: "Montevideo", gmtOffset: -3 },

    // GMT -2
    { name: "South Georgia", gmtOffset: -2 },

    // GMT -1
    { name: "Azores", gmtOffset: -1 },
    { name: "Cape Verde", gmtOffset: -1 },

    // GMT 0
    { name: "London", gmtOffset: 0 },
    { name: "Dublin", gmtOffset: 0 },
    { name: "Lisbon", gmtOffset: 0 },
    { name: "Reykjavik", gmtOffset: 0 },
    { name: "Accra", gmtOffset: 0 },
    { name: "Dakar", gmtOffset: 0 },

    // GMT +1
    { name: "Paris", gmtOffset: 1 },
    { name: "Berlin", gmtOffset: 1 },
    { name: "Brussels", gmtOffset: 1 },
    { name: "Amsterdam", gmtOffset: 1 },
    { name: "Rome", gmtOffset: 1 },
    { name: "Madrid", gmtOffset: 1 },
    { name: "Vienna", gmtOffset: 1 },
    { name: "Warsaw", gmtOffset: 1 },
    { name: "Lagos", gmtOffset: 1 },
    { name: "Tunis", gmtOffset: 1 },

    // GMT +2
    { name: "Cairo", gmtOffset: 2 },
    { name: "Athens", gmtOffset: 2 },
    { name: "Bucharest", gmtOffset: 2 },
    { name: "Helsinki", gmtOffset: 2 },
    { name: "Kyiv", gmtOffset: 2 },
    { name: "Johannesburg", gmtOffset: 2 },
    { name: "Jerusalem", gmtOffset: 2 },
    { name: "Beirut", gmtOffset: 2 },

    // GMT +3
    { name: "Moscow", gmtOffset: 3 },
    { name: "Nairobi", gmtOffset: 3 },
    { name: "Riyadh", gmtOffset: 3 },
    { name: "Baghdad", gmtOffset: 3 },
    { name: "Addis Ababa", gmtOffset: 3 },
    { name: "Kuwait City", gmtOffset: 3 },

    // GMT +3:30
    { name: "Tehran", gmtOffset: 3.5 },

    // GMT +4
    { name: "Dubai", gmtOffset: 4 },
    { name: "Abu Dhabi", gmtOffset: 4 },
    { name: "Baku", gmtOffset: 4 },
    { name: "Muscat", gmtOffset: 4 },
    { name: "Tbilisi", gmtOffset: 4 },

    // GMT +4:30
    { name: "Kabul", gmtOffset: 4.5 },

    // GMT +5
    { name: "Karachi", gmtOffset: 5 },
    { name: "Tashkent", gmtOffset: 5 },
    { name: "Yekaterinburg", gmtOffset: 5 },

    // GMT +5:30
    { name: "Mumbai", gmtOffset: 5.5 },
    { name: "New Delhi", gmtOffset: 5.5 },
    { name: "Bangalore", gmtOffset: 5.5 },
    { name: "Colombo", gmtOffset: 5.5 },

    // GMT +5:45
    { name: "Kathmandu", gmtOffset: 5.75 },

    // GMT +6
    { name: "Dhaka", gmtOffset: 6 },
    { name: "Almaty", gmtOffset: 6 },
    { name: "Bishkek", gmtOffset: 6 },

    // GMT +6:30
    { name: "Yangon", gmtOffset: 6.5 },
    { name: "Cocos Islands", gmtOffset: 6.5 },

    // GMT +7
    { name: "Bangkok", gmtOffset: 7 },
    { name: "Ho Chi Minh City", gmtOffset: 7 },
    { name: "Jakarta", gmtOffset: 7 },
    { name: "Hanoi", gmtOffset: 7 },
    { name: "Phnom Penh", gmtOffset: 7 },

    // GMT +8
    { name: "Beijing", gmtOffset: 8 },
    { name: "Shanghai", gmtOffset: 8 },
    { name: "Singapore", gmtOffset: 8 },
    { name: "Kuala Lumpur", gmtOffset: 8 },
    { name: "Hong Kong", gmtOffset: 8 },
    { name: "Taipei", gmtOffset: 8 },
    { name: "Manila", gmtOffset: 8 },
    { name: "Perth", gmtOffset: 8 },

    // GMT +8:45
    { name: "Eucla", gmtOffset: 8.75 },

    // GMT +9
    { name: "Tokyo", gmtOffset: 9 },
    { name: "Seoul", gmtOffset: 9 },
    { name: "Pyongyang", gmtOffset: 9 },

    // GMT +9:30
    { name: "Adelaide", gmtOffset: 9.5 },
    { name: "Darwin", gmtOffset: 9.5 },

    // GMT +10
    { name: "Sydney", gmtOffset: 10 },
    { name: "Melbourne", gmtOffset: 10 },
    { name: "Brisbane", gmtOffset: 10 },
    { name: "Port Moresby", gmtOffset: 10 },

    // GMT +10:30
    { name: "Lord Howe Island", gmtOffset: 10.5 },

    // GMT +11
    { name: "Noumea", gmtOffset: 11 },
    { name: "Honiara", gmtOffset: 11 },

    // GMT +12
    { name: "Auckland", gmtOffset: 12 },
    { name: "Fiji", gmtOffset: 12 },
    { name: "Suva", gmtOffset: 12 },
];

function getBitmask(gmtOffset) {
    const bitPosition = (gmtOffset * 4) + 48;
    return 1n << BigInt(bitPosition);
}

const citiesWithMasks = cities.map(city => ({
    ...city,
    bitmask: getBitmask(city.gmtOffset),
}));

export { citiesWithMasks, getBitmask };
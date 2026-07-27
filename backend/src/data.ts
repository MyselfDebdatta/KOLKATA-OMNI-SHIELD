// Mock urban dataset for Kolkata Omni-Shield
export type LatLng = { lat: number; lng: number };

export type Zone = {
  id: string;
  name: string;
  ward: string;
  center: LatLng;
  crime: number; aqi: number; heat: number; flood: number;
  population?: number;
};

export const KOLKATA_CENTER: LatLng = { lat: 22.5726, lng: 88.3639 };
export const ZONES: Zone[] = [
  { id: "z1", name: "Park Street", ward: "Local", center: { lat: 22.554, lng: 88.3517 }, crime: 57, aqi: 212, heat: 37, flood: 52, population: 31992 },
  { id: "z2", name: "Esplanade", ward: "Local", center: { lat: 22.5638, lng: 88.352 }, crime: 59, aqi: 214, heat: 39, flood: 54, population: 31994 },
  { id: "z3", name: "Maidan", ward: "Local", center: { lat: 22.555, lng: 88.347 }, crime: 59, aqi: 214, heat: 39, flood: 54, population: 31994 },
  { id: "z4", name: "Bowbazar", ward: "Local", center: { lat: 22.571, lng: 88.362 }, crime: 62, aqi: 217, heat: 42, flood: 57, population: 31997 },
  { id: "z5", name: "Burra Bazar", ward: "Local", center: { lat: 22.58, lng: 88.354 }, crime: 64, aqi: 219, heat: 38, flood: 59, population: 31999 },
  { id: "z6", name: "College Street", ward: "Local", center: { lat: 22.5755, lng: 88.3635 }, crime: 64, aqi: 219, heat: 38, flood: 59, population: 31999 },
  { id: "z7", name: "Shyambazar", ward: "Local", center: { lat: 22.5996, lng: 88.3733 }, crime: 68, aqi: 123, heat: 42, flood: 63, population: 32003 },
  { id: "z8", name: "Hatibagan", ward: "Local", center: { lat: 22.595, lng: 88.37 }, crime: 68, aqi: 123, heat: 42, flood: 63, population: 32003 },
  { id: "z9", name: "Bagbazar", ward: "Local", center: { lat: 22.602, lng: 88.365 }, crime: 70, aqi: 125, heat: 38, flood: 65, population: 32005 },
  { id: "z10", name: "Manicktala", ward: "Local", center: { lat: 22.587, lng: 88.387 }, crime: 70, aqi: 125, heat: 38, flood: 65, population: 32005 },
  { id: "z11", name: "Phoolbagan", ward: "Local", center: { lat: 22.568, lng: 88.385 }, crime: 69, aqi: 124, heat: 37, flood: 64, population: 32004 },
  { id: "z12", name: "Beleghata", ward: "Local", center: { lat: 22.568, lng: 88.396 }, crime: 70, aqi: 125, heat: 38, flood: 65, population: 32005 },
  { id: "z13", name: "Topsia", ward: "Local", center: { lat: 22.55, lng: 88.393 }, crime: 70, aqi: 125, heat: 38, flood: 65, population: 32005 },
  { id: "z14", name: "Tangra", ward: "Local", center: { lat: 22.557, lng: 88.388 }, crime: 71, aqi: 126, heat: 39, flood: 66, population: 32006 },
  { id: "z15", name: "Tiljala", ward: "Local", center: { lat: 22.529, lng: 88.387 }, crime: 70, aqi: 125, heat: 38, flood: 65, population: 32005 },
  { id: "z16", name: "Park Circus", ward: "Local", center: { lat: 22.545, lng: 88.376 }, crime: 72, aqi: 127, heat: 40, flood: 67, population: 32007 },
  { id: "z17", name: "Beck Bagan", ward: "Local", center: { lat: 22.541, lng: 88.37 }, crime: 72, aqi: 127, heat: 40, flood: 67, population: 32007 },
  { id: "z18", name: "Ballygunge", ward: "Local", center: { lat: 22.532, lng: 88.365 }, crime: 73, aqi: 128, heat: 41, flood: 68, population: 32008 },
  { id: "z19", name: "Gariahat", ward: "Local", center: { lat: 22.518, lng: 88.368 }, crime: 72, aqi: 127, heat: 40, flood: 67, population: 32007 },
  { id: "z20", name: "Rashbehari", ward: "Local", center: { lat: 22.516, lng: 88.359 }, crime: 73, aqi: 128, heat: 41, flood: 68, population: 32008 },
  { id: "z21", name: "Hazra", ward: "Local", center: { lat: 22.526, lng: 88.354 }, crime: 75, aqi: 130, heat: 37, flood: 70, population: 32010 },
  { id: "z22", name: "Bhowanipore", ward: "Local", center: { lat: 22.532, lng: 88.347 }, crime: 76, aqi: 131, heat: 38, flood: 71, population: 32011 },
  { id: "z23", name: "Alipore", ward: "Local", center: { lat: 22.536, lng: 88.331 }, crime: 77, aqi: 132, heat: 39, flood: 72, population: 32012 },
  { id: "z24", name: "New Alipore", ward: "Local", center: { lat: 22.516, lng: 88.326 }, crime: 76, aqi: 131, heat: 38, flood: 71, population: 32011 },
  { id: "z25", name: "Behala", ward: "Local", center: { lat: 22.504, lng: 88.312 }, crime: 76, aqi: 131, heat: 38, flood: 71, population: 32011 },
  { id: "z26", name: "Thakurpukur", ward: "Local", center: { lat: 22.483, lng: 88.305 }, crime: 75, aqi: 130, heat: 37, flood: 70, population: 32010 },
  { id: "z27", name: "Joka", ward: "Local", center: { lat: 22.463, lng: 88.307 }, crime: 74, aqi: 129, heat: 42, flood: 69, population: 32009 },
  { id: "z28", name: "Sarsuna", ward: "Local", center: { lat: 22.494, lng: 88.292 }, crime: 78, aqi: 133, heat: 40, flood: 73, population: 32013 },
  { id: "z29", name: "Taratala", ward: "Local", center: { lat: 22.516, lng: 88.303 }, crime: 16, aqi: 136, heat: 37, flood: 11, population: 32016 },
  { id: "z30", name: "Khidirpur", ward: "Local", center: { lat: 22.541, lng: 88.315 }, crime: 19, aqi: 139, heat: 40, flood: 14, population: 32019 },
  { id: "z31", name: "Watgunge", ward: "Local", center: { lat: 22.552, lng: 88.32 }, crime: 21, aqi: 141, heat: 42, flood: 16, population: 32021 },
  { id: "z32", name: "Mominpur", ward: "Local", center: { lat: 22.54, lng: 88.322 }, crime: 21, aqi: 141, heat: 42, flood: 16, population: 32021 },
  { id: "z33", name: "Tollygunge", ward: "Local", center: { lat: 22.491, lng: 88.347 }, crime: 19, aqi: 139, heat: 40, flood: 14, population: 32019 },
  { id: "z34", name: "Kalighat", ward: "Local", center: { lat: 22.5193, lng: 88.3424 }, crime: 22, aqi: 142, heat: 37, flood: 17, population: 32022 },
  { id: "z35", name: "Lake Gardens", ward: "Local", center: { lat: 22.504, lng: 88.353 }, crime: 22, aqi: 142, heat: 37, flood: 17, population: 32022 },
  { id: "z36", name: "Jadavpur", ward: "Local", center: { lat: 22.499, lng: 88.3712 }, crime: 23, aqi: 143, heat: 38, flood: 18, population: 32023 },
  { id: "z37", name: "Garia", ward: "Local", center: { lat: 22.463, lng: 88.399 }, crime: 21, aqi: 141, heat: 42, flood: 16, population: 32021 },
  { id: "z38", name: "Sonarpur", ward: "Local", center: { lat: 22.438, lng: 88.422 }, crime: 21, aqi: 141, heat: 42, flood: 16, population: 32021 },
  { id: "z39", name: "Patuli", ward: "Local", center: { lat: 22.457, lng: 88.394 }, crime: 23, aqi: 143, heat: 38, flood: 18, population: 32023 },
  { id: "z40", name: "Baghajatin", ward: "Local", center: { lat: 22.479, lng: 88.382 }, crime: 25, aqi: 145, heat: 40, flood: 20, population: 32025 },
  { id: "z41", name: "Santoshpur", ward: "Local", center: { lat: 22.483, lng: 88.376 }, crime: 26, aqi: 146, heat: 41, flood: 21, population: 32026 },
  { id: "z42", name: "Dhakuria", ward: "Local", center: { lat: 22.506, lng: 88.37 }, crime: 29, aqi: 149, heat: 38, flood: 24, population: 32029 },
  { id: "z43", name: "Kasba", ward: "Local", center: { lat: 22.517, lng: 88.39 }, crime: 32, aqi: 152, heat: 41, flood: 27, population: 32032 },
  { id: "z44", name: "Anandapur", ward: "Local", center: { lat: 22.51, lng: 88.402 }, crime: 32, aqi: 152, heat: 41, flood: 27, population: 32032 },
  { id: "z45", name: "Mukundapur", ward: "Local", center: { lat: 22.5, lng: 88.403 }, crime: 33, aqi: 153, heat: 42, flood: 28, population: 32033 },
  { id: "z46", name: "EM Bypass", ward: "Local", center: { lat: 22.54, lng: 88.397 }, crime: 37, aqi: 157, heat: 40, flood: 32, population: 32037 },
  { id: "z47", name: "Salt Lake Sector I", ward: "Local", center: { lat: 22.578, lng: 88.417 }, crime: 42, aqi: 162, heat: 39, flood: 37, population: 32042 },
  { id: "z48", name: "Salt Lake Sector II", ward: "Local", center: { lat: 22.58, lng: 88.415 }, crime: 43, aqi: 163, heat: 40, flood: 38, population: 32043 },
  { id: "z49", name: "Salt Lake Sector III", ward: "Local", center: { lat: 22.58, lng: 88.407 }, crime: 44, aqi: 164, heat: 41, flood: 39, population: 32044 },
  { id: "z50", name: "Salt Lake Sector V", ward: "Local", center: { lat: 22.579, lng: 88.434 }, crime: 45, aqi: 165, heat: 42, flood: 40, population: 32045 },
  { id: "z51", name: "Karunamoyee", ward: "Local", center: { lat: 22.576, lng: 88.417 }, crime: 46, aqi: 166, heat: 37, flood: 41, population: 32046 },
  { id: "z52", name: "City Centre Salt Lake", ward: "Local", center: { lat: 22.58, lng: 88.4205 }, crime: 47, aqi: 167, heat: 38, flood: 42, population: 32047 },
  { id: "z53", name: "New Town Action Area I", ward: "Local", center: { lat: 22.587, lng: 88.471 }, crime: 50, aqi: 170, heat: 41, flood: 45, population: 32050 },
  { id: "z54", name: "New Town Action Area II", ward: "Local", center: { lat: 22.62, lng: 88.46 }, crime: 53, aqi: 173, heat: 38, flood: 48, population: 32053 },
  { id: "z55", name: "New Town Action Area III", ward: "Local", center: { lat: 22.63, lng: 88.49 }, crime: 56, aqi: 176, heat: 41, flood: 51, population: 32056 },
  { id: "z56", name: "Rajarhat", ward: "Local", center: { lat: 22.63, lng: 88.45 }, crime: 56, aqi: 176, heat: 41, flood: 51, population: 32056 },
  { id: "z57", name: "Baguiati", ward: "Local", center: { lat: 22.624, lng: 88.425 }, crime: 56, aqi: 176, heat: 41, flood: 51, population: 32056 },
  { id: "z58", name: "VIP Road", ward: "Local", center: { lat: 22.616, lng: 88.41 }, crime: 56, aqi: 176, heat: 41, flood: 51, population: 32056 },
  { id: "z59", name: "Lake Town", ward: "Local", center: { lat: 22.608, lng: 88.407 }, crime: 56, aqi: 176, heat: 41, flood: 51, population: 32056 },
  { id: "z60", name: "Kestopur", ward: "Local", center: { lat: 22.608, lng: 88.428 }, crime: 58, aqi: 178, heat: 37, flood: 53, population: 32058 },
  { id: "z61", name: "Dum Dum", ward: "Local", center: { lat: 22.6235, lng: 88.4017 }, crime: 59, aqi: 179, heat: 38, flood: 54, population: 32059 },
  { id: "z62", name: "Nagerbazar", ward: "Local", center: { lat: 22.631, lng: 88.417 }, crime: 61, aqi: 181, heat: 40, flood: 56, population: 32061 },
  { id: "z63", name: "Belgharia", ward: "Local", center: { lat: 22.6635, lng: 88.397 }, crime: 65, aqi: 185, heat: 38, flood: 60, population: 32065 },
  { id: "z64", name: "Sodepur", ward: "Local", center: { lat: 22.7028, lng: 88.3878 }, crime: 69, aqi: 189, heat: 42, flood: 64, population: 32069 },
  { id: "z65", name: "Barrackpore", ward: "Local", center: { lat: 22.76, lng: 88.37 }, crime: 75, aqi: 195, heat: 42, flood: 70, population: 32075 },
  { id: "z66", name: "Khardah", ward: "Local", center: { lat: 22.724, lng: 88.376 }, crime: 73, aqi: 193, heat: 40, flood: 68, population: 32073 },
  { id: "z67", name: "Howrah Maidan", ward: "Local", center: { lat: 22.587, lng: 88.321 }, crime: 60, aqi: 180, heat: 39, flood: 55, population: 32060 },
  { id: "z68", name: "Howrah Sadar", ward: "Local", center: { lat: 22.587, lng: 88.31 }, crime: 61, aqi: 181, heat: 40, flood: 56, population: 32061 },
  { id: "z69", name: "Salkia", ward: "Local", center: { lat: 22.603, lng: 88.338 }, crime: 64, aqi: 184, heat: 37, flood: 59, population: 32064 },
  { id: "z70", name: "Liluah", ward: "Local", center: { lat: 22.616, lng: 88.334 }, crime: 66, aqi: 186, heat: 39, flood: 61, population: 32066 },
  { id: "z71", name: "Bally", ward: "Local", center: { lat: 22.645, lng: 88.345 }, crime: 70, aqi: 190, heat: 37, flood: 65, population: 32070 },
  { id: "z72", name: "Belur", ward: "Local", center: { lat: 22.631, lng: 88.336 }, crime: 70, aqi: 190, heat: 37, flood: 65, population: 32070 },
  { id: "z73", name: "Shibpur", ward: "Local", center: { lat: 22.564, lng: 88.312 }, crime: 64, aqi: 184, heat: 37, flood: 59, population: 32064 },
  { id: "z74", name: "Ramrajatala", ward: "Local", center: { lat: 22.567, lng: 88.301 }, crime: 65, aqi: 185, heat: 38, flood: 60, population: 32065 },
  { id: "z75", name: "Santragachi", ward: "Local", center: { lat: 22.5825, lng: 88.263 }, crime: 67, aqi: 187, heat: 40, flood: 62, population: 32067 },
  { id: "z76", name: "Sealdah", ward: "Local", center: { lat: 22.5675, lng: 88.37 }, crime: 69, aqi: 189, heat: 42, flood: 64, population: 32069 },
  { id: "z77", name: "Entally", ward: "Local", center: { lat: 22.563, lng: 88.376 }, crime: 70, aqi: 190, heat: 37, flood: 65, population: 32070 },
  { id: "z78", name: "Beniapukur", ward: "Local", center: { lat: 22.552, lng: 88.37 }, crime: 69, aqi: 189, heat: 42, flood: 64, population: 32069 },
  { id: "z79", name: "Tiretti Bazar", ward: "Local", center: { lat: 22.5755, lng: 88.359 }, crime: 72, aqi: 192, heat: 39, flood: 67, population: 32072 },
  { id: "z80", name: "Bagri Market", ward: "Local", center: { lat: 22.58, lng: 88.354 }, crime: 74, aqi: 194, heat: 41, flood: 69, population: 32074 },
  { id: "z81", name: "Chinar Park", ward: "Local", center: { lat: 22.58, lng: 88.43 }, crime: 48, aqi: 168, heat: 39, flood: 43, population: 32048 },
  { id: "z82", name: "Banasree", ward: "Local", center: { lat: 22.5930, lng: 88.4470 }, crime: 52, aqi: 172, heat: 40, flood: 47, population: 32052 },
  { id: "z83", name: "Dakshineswar", ward: "Local", center: { lat: 22.6540, lng: 88.3650 }, crime: 71, aqi: 191, heat: 39, flood: 66, population: 32071 },
  { id: "z84", name: "Uttarpara", ward: "Local", center: { lat: 22.6750, lng: 88.3520 }, crime: 73, aqi: 193, heat: 41, flood: 68, population: 32073 },
  { id: "z85", name: "Serampore", ward: "Local", center: { lat: 22.7350, lng: 88.3930 }, crime: 74, aqi: 194, heat: 42, flood: 69, population: 32074 },
  { id: "z86", name: "Panihati", ward: "Local", center: { lat: 22.6850, lng: 88.3980 }, crime: 72, aqi: 192, heat: 40, flood: 67, population: 32072 },
  { id: "z87", name: "Kamarhati", ward: "Local", center: { lat: 22.7050, lng: 88.3850 }, crime: 70, aqi: 190, heat: 38, flood: 65, population: 32070 },
  { id: "z88", name: "Konnagar", ward: "Local", center: { lat: 22.6250, lng: 88.3250 }, crime: 68, aqi: 188, heat: 37, flood: 63, population: 32068 },
  { id: "z89", name: "Diamond Harbor", ward: "Local", center: { lat: 22.1950, lng: 88.2050 }, crime: 42, aqi: 162, heat: 35, flood: 37, population: 32042 },
  { id: "z90", name: "Budge Budge", ward: "Local", center: { lat: 22.1550, lng: 88.1850 }, crime: 40, aqi: 160, heat: 34, flood: 35, population: 32040 },
  { id: "z91", name: "Tollygunj", ward: "Local", center: { lat: 22.4780, lng: 88.3650 }, crime: 45, aqi: 165, heat: 36, flood: 40, population: 32045 },
  { id: "z92", name: "Narkeldanga", ward: "Local", center: { lat: 22.6600, lng: 88.3600 }, crime: 69, aqi: 189, heat: 38, flood: 64, population: 32069 },
  { id: "z93", name: "Ultadanga", ward: "Local", center: { lat: 22.6900, lng: 88.3900 }, crime: 70, aqi: 190, heat: 39, flood: 65, population: 32070 },
  { id: "z94", name: "Tala", ward: "Local", center: { lat: 22.7200, lng: 88.3750 }, crime: 71, aqi: 191, heat: 39, flood: 66, population: 32071 },
  { id: "z95", name: "Shyampur", ward: "Local", center: { lat: 22.6450, lng: 88.4250 }, crime: 51, aqi: 171, heat: 39, flood: 46, population: 32051 },
  { id: "z96", name: "Bidhan Nagar", ward: "Local", center: { lat: 22.6050, lng: 88.4050 }, crime: 49, aqi: 169, heat: 38, flood: 44, population: 32049 },
  { id: "z97", name: "Ariadaha", ward: "Local", center: { lat: 22.6650, lng: 88.4150 }, crime: 54, aqi: 174, heat: 40, flood: 49, population: 32054 },
  { id: "z98", name: "Dakshineswar Extension", ward: "Local", center: { lat: 22.6650, lng: 88.3750 }, crime: 70, aqi: 190, heat: 38, flood: 65, population: 32070 },
  { id: "z99", name: "Howrah Bridge", ward: "Local", center: { lat: 22.5851, lng: 88.3468 }, crime: 65, aqi: 185, heat: 37, flood: 60, population: 32065 },
  { id: "z100", name: "Fort William", ward: "Local", center: { lat: 22.5560, lng: 88.3380 }, crime: 58, aqi: 178, heat: 36, flood: 53, population: 32058 },
];

export const POLICE_STATIONS: (LatLng & { name: string })[] = [
  { name: "Park Street PS", lat: 22.555, lng: 88.35069999999999 },
  { name: "Hare Street PS", lat: 22.4650, lng: 88.3150 },
  { name: "Bowbazar PS", lat: 22.572000000000003, lng: 88.36099999999999 },
  { name: "Burrabazar PS", lat: 22.581, lng: 88.353 },
  { name: "Jorasanko PS", lat: 22.5100, lng: 88.3600 },
  { name: "Shyampukur PS", lat: 22.5250, lng: 88.3750 },
  { name: "Burtolla PS", lat: 22.5400, lng: 88.3900 },
  { name: "Amherst Street PS", lat: 22.5550, lng: 88.4050 },
  { name: "Muchipara PS", lat: 22.5700, lng: 88.4200 },
  { name: "Sealdah PS", lat: 22.5685, lng: 88.369 },
  { name: "Entally PS", lat: 22.564, lng: 88.375 },
  { name: "Beniapukur PS", lat: 22.553, lng: 88.369 },
  { name: "Phoolbagan PS", lat: 22.569000000000003, lng: 88.384 },
  { name: "Beliaghata PS", lat: 22.6450, lng: 88.3450 },
  { name: "Narkeldanga PS", lat: 22.6600, lng: 88.3600 },
  { name: "Manicktala PS", lat: 22.588, lng: 88.386 },
  { name: "Ultadanga PS", lat: 22.6900, lng: 88.3900 },
  { name: "Chitpur PS", lat: 22.7050, lng: 88.4050 },
  { name: "Cossipore PS", lat: 22.7200, lng: 88.4200 },
  { name: "Sinthee PS", lat: 22.7350, lng: 88.4350 },
  { name: "Tallah PS", lat: 22.4500, lng: 88.3000 },
  { name: "Bhowanipore PS", lat: 22.533, lng: 88.34599999999999 },
  { name: "Alipore PS", lat: 22.537000000000003, lng: 88.33 },
  { name: "Kalighat PS", lat: 22.520300000000002, lng: 88.3414 },
  { name: "Tollygunge PS", lat: 22.492, lng: 88.34599999999999 },
  { name: "Jadavpur PS", lat: 22.5, lng: 88.3702 },
  { name: "Garia PS", lat: 22.464000000000002, lng: 88.398 },
  { name: "Kasba PS", lat: 22.518, lng: 88.389 },
  { name: "Garfa PS", lat: 22.5700, lng: 88.4200 },
  { name: "Patuli PS", lat: 22.458000000000002, lng: 88.393 },
  { name: "Lake PS", lat: 22.505000000000003, lng: 88.35199999999999 },
  { name: "Ballygunge PS", lat: 22.533, lng: 88.36399999999999 },
  { name: "Gariahat PS", lat: 22.519000000000002, lng: 88.36699999999999 },
  { name: "Topsia PS", lat: 22.551000000000002, lng: 88.392 },
  { name: "Tangra PS", lat: 22.558, lng: 88.387 },
  { name: "Pragati Maidan PS", lat: 22.556, lng: 88.34599999999999 },
  { name: "Tiljala PS", lat: 22.53, lng: 88.386 },
  { name: "Karaya PS", lat: 22.7050, lng: 88.4050 },
  { name: "Hastings PS", lat: 22.7200, lng: 88.4200 },
  { name: "Maidan PS", lat: 22.556, lng: 88.34599999999999 },
  { name: "South Port PS", lat: 22.4500, lng: 88.3000 },
  { name: "North Port PS", lat: 22.4650, lng: 88.3150 },
  { name: "West Port PS", lat: 22.4800, lng: 88.3300 },
  { name: "Watgunge PS", lat: 22.553, lng: 88.31899999999999 },
  { name: "Garden Reach PS", lat: 22.5100, lng: 88.3600 },
  { name: "Behala PS", lat: 22.505000000000003, lng: 88.31099999999999 },
  { name: "Thakurpukur PS", lat: 22.484, lng: 88.304 },
  { name: "Parnasree PS", lat: 22.5550, lng: 88.4050 },
  { name: "Haridevpur PS", lat: 22.5700, lng: 88.4200 },
  { name: "Bidhannagar North PS", lat: 22.5850, lng: 88.4350 },
  { name: "Bidhannagar South PS", lat: 22.6000, lng: 88.3000 },
  { name: "Bidhannagar East PS", lat: 22.6150, lng: 88.3150 },
  { name: "Lake Town PS", lat: 22.505000000000003, lng: 88.35199999999999 },
  { name: "Baguiati PS", lat: 22.625, lng: 88.42399999999999 },
  { name: "Airport PS", lat: 22.6600, lng: 88.3600 },
  { name: "New Town PS", lat: 22.517, lng: 88.32499999999999 },
  { name: "Eco Park PS", lat: 22.555, lng: 88.35069999999999 },
  { name: "Rajarhat PS", lat: 22.631, lng: 88.449 },
  { name: "Howrah PS", lat: 22.588, lng: 88.32 },
  { name: "Shibpur PS", lat: 22.565, lng: 88.31099999999999 },
  { name: "Bally PS", lat: 22.646, lng: 88.344 },
  { name: "Liluah PS", lat: 22.617, lng: 88.333 },
  { name: "Chinsurah PS", lat: 22.65, lng: 88.37 },
  { name: "Serampore PS", lat: 22.735, lng: 88.393 },
  { name: "Uttarpara PS", lat: 22.675, lng: 88.352 },
  { name: "Panihati PS", lat: 22.685, lng: 88.398 },
  { name: "Kamarhati PS", lat: 22.705, lng: 88.385 },
  { name: "Banasree PS", lat: 22.593, lng: 88.447 },
  { name: "Chinar Park PS", lat: 22.58, lng: 88.43 },
  { name: "Dakshineswar Extension PS", lat: 22.665, lng: 88.375 },
  { name: "Shyampur PS", lat: 22.645, lng: 88.425 },
  { name: "Bidhan Nagar Extension PS", lat: 22.605, lng: 88.405 },
  { name: "Ariadaha PS", lat: 22.665, lng: 88.415 },
  { name: "Narkeldanga Extension PS", lat: 22.67, lng: 88.37 },
  { name: "Ultadanga Extension PS", lat: 22.69, lng: 88.39 },
  { name: "Tala PS", lat: 22.72, lng: 88.375 },
  { name: "Diamond Harbor PS", lat: 22.195, lng: 88.205 },
  { name: "Budge Budge PS", lat: 22.155, lng: 88.185 },
  { name: "Fort William PS", lat: 22.556, lng: 88.338 },
  { name: "Howrah Bridge PS", lat: 22.585, lng: 88.346 },
  { name: "Konnagar PS", lat: 22.625, lng: 88.325 },
  { name: "Tollygunj Extension PS", lat: 22.478, lng: 88.365 },
];

export type Hub = LatLng & {
  name: string;
  type: "Cooling" | "Shelter";
  capacity: number;
  amenities: string[];
  neighborhood: string;
  phone?: string;
};

export const RESILIENCE_HUBS: Hub[] = [
  // Central Kolkata Hubs
  { name: "Maidan Cooling Center",       lat: 22.5500, lng: 88.3450, type: "Cooling",  capacity: 800,  amenities: ["AC", "ORS", "Medic"], neighborhood: "Maidan", phone: "033-2223-1234" },
  { name: "Victoria Memorial Shelter",   lat: 22.5448, lng: 88.3426, type: "Shelter",  capacity: 600,  amenities: ["Power", "Water", "Food"], neighborhood: "Bhowanipore", phone: "033-2223-5678" },
  { name: "Park Street Wellness Hub",    lat: 22.5540, lng: 88.3517, type: "Cooling",  capacity: 350,  amenities: ["AC", "Medic", "Wi-Fi"], neighborhood: "Park Street", phone: "033-2288-1111" },
  { name: "Esplanade Relief Center",     lat: 22.5638, lng: 88.3520, type: "Shelter",  capacity: 700,  amenities: ["Power", "Water", "Food"], neighborhood: "Esplanade", phone: "033-2223-2222" },
  
  // North Kolkata Hubs
  { name: "College Square Cooling",      lat: 22.5760, lng: 88.3640, type: "Cooling",  capacity: 400,  amenities: ["AC", "Water"], neighborhood: "College Street", phone: "033-2241-3344" },
  { name: "Shyambazar Community Shelter", lat: 22.5996, lng: 88.3733, type: "Shelter",  capacity: 900,  amenities: ["Power", "Water", "Food"], neighborhood: "Shyambazar", phone: "033-2356-4455" },
  { name: "Bagbazar Cooling Center",     lat: 22.6020, lng: 88.3650, type: "Cooling",  capacity: 500,  amenities: ["AC", "Medic", "ORS"], neighborhood: "Bagbazar", phone: "033-2360-5566" },
  { name: "Manicktala Relief Hub",       lat: 22.5870, lng: 88.3870, type: "Shelter",  capacity: 1000, amenities: ["Power", "Water", "Food", "Medic"], neighborhood: "Manicktala", phone: "033-2356-6677" },
  
  // East Kolkata Hubs
  { name: "Salt Lake Resilience Hub",    lat: 22.5820, lng: 88.4150, type: "Shelter",  capacity: 2400, amenities: ["Power", "Water", "Food"], neighborhood: "Salt Lake Sector II", phone: "033-4090-7788" },
  { name: "New Town Wellness Hub",       lat: 22.6210, lng: 88.4580, type: "Cooling",  capacity: 600,  amenities: ["AC", "Medic", "Wi-Fi"], neighborhood: "New Town Action Area II", phone: "033-4096-8899" },
  { name: "Rajarhat Resilience Hub",     lat: 22.6300, lng: 88.4500, type: "Shelter",  capacity: 1700, amenities: ["Power", "Water", "Medic"], neighborhood: "Rajarhat", phone: "033-4090-9900" },
  { name: "Eco Park Cooling Pavilion",   lat: 22.6090, lng: 88.4640, type: "Cooling",  capacity: 500,  amenities: ["AC", "Wi-Fi"], neighborhood: "Eco Park", phone: "033-4096-1010" },
  { name: "Dum Dum Municipal Shelter",   lat: 22.6230, lng: 88.4250, type: "Shelter",  capacity: 1100, amenities: ["Power", "Water", "Food"], neighborhood: "Dum Dum", phone: "033-4031-1111" },
  { name: "Chinar Park Community Hub",   lat: 22.5800, lng: 88.4300, type: "Cooling",  capacity: 450,  amenities: ["AC", "ORS"], neighborhood: "Chinar Park", phone: "033-4090-1212" },
  
  // South Kolkata Hubs
  { name: "Jadavpur Cyclone Shelter",    lat: 22.4970, lng: 88.3710, type: "Shelter",  capacity: 2000, amenities: ["Power", "Water", "Food"], neighborhood: "Jadavpur", phone: "033-2476-1313" },
  { name: "Tollygunge Cooling Centre",   lat: 22.4910, lng: 88.3460, type: "Cooling",  capacity: 450,  amenities: ["AC", "ORS"], neighborhood: "Tollygunge", phone: "033-2473-1414" },
  { name: "Lake Gardens Shelter Hub",    lat: 22.5040, lng: 88.3530, type: "Shelter",  capacity: 900,  amenities: ["Power", "Water", "Medic"], neighborhood: "Lake Gardens", phone: "033-2400-1515" },
  { name: "Behala Community Shelter",    lat: 22.5040, lng: 88.3120, type: "Shelter",  capacity: 1500, amenities: ["Power", "Water"], neighborhood: "Behala", phone: "033-2447-1616" },
  { name: "Garia Cyclone Shelter",       lat: 22.4630, lng: 88.3990, type: "Shelter",  capacity: 1200, amenities: ["Power", "Water"], neighborhood: "Garia", phone: "033-2436-1717" },
  { name: "Kalighat Wellness Center",    lat: 22.5193, lng: 88.3424, type: "Cooling",  capacity: 350,  amenities: ["AC", "Medic", "ORS"], neighborhood: "Kalighat", phone: "033-2476-1818" },
  
  // West Kolkata & Howrah Hubs
  { name: "Howrah Relief Point",         lat: 22.5870, lng: 88.3100, type: "Shelter",  capacity: 1800, amenities: ["Power", "Water"], neighborhood: "Howrah Sadar", phone: "033-2641-1919" },
  { name: "Shibpur Community Center",    lat: 22.5640, lng: 88.3120, type: "Cooling",  capacity: 400,  amenities: ["AC", "Water"], neighborhood: "Shibpur", phone: "033-2662-2020" },
  { name: "Bally Relief Centre",         lat: 22.6450, lng: 88.3450, type: "Shelter",  capacity: 1400, amenities: ["Power", "Water"], neighborhood: "Bally", phone: "033-2610-2121" },
  { name: "Barrackpore Cantonment Hub",  lat: 22.7580, lng: 88.3680, type: "Shelter",  capacity: 1900, amenities: ["Power", "Water", "Medic"], neighborhood: "Barrackpore", phone: "033-2592-2222" },
  { name: "Dakshineswar Relief Hub",     lat: 22.6540, lng: 88.3650, type: "Cooling",  capacity: 350,  amenities: ["AC", "Medic"], neighborhood: "Dakshineswar", phone: "033-2555-2323" },
  
  // Distributed neighborhood hubs
  { name: "Anandapur Cooling Center",    lat: 22.5100, lng: 88.4020, type: "Cooling",  capacity: 300,  amenities: ["AC", "ORS"], neighborhood: "Anandapur", phone: "033-4014-2424" },
  { name: "Topsia Community Shelter",    lat: 22.5500, lng: 88.3930, type: "Shelter",  capacity: 800,  amenities: ["Power", "Water"], neighborhood: "Topsia", phone: "033-4408-2525" },
  { name: "Kasba Wellness Hub",          lat: 22.5170, lng: 88.3900, type: "Cooling",  capacity: 400,  amenities: ["AC", "Medic"], neighborhood: "Kasba", phone: "033-4014-2626" },
  { name: "Dhakuria Relief Center",      lat: 22.5060, lng: 88.3700, type: "Cooling",  capacity: 300,  amenities: ["AC", "Water"], neighborhood: "Dhakuria", phone: "033-2473-2727" },
  { name: "Ballygunge Community Hub",    lat: 22.5320, lng: 88.3650, type: "Cooling",  capacity: 350,  amenities: ["AC", "ORS"], neighborhood: "Ballygunge", phone: "033-2466-2828" },
  { name: "Gariahat Relief Shelter",     lat: 22.5180, lng: 88.3680, type: "Shelter",  capacity: 700,  amenities: ["Power", "Water"], neighborhood: "Gariahat", phone: "033-2466-2929" },
  { name: "Hazra Cooling Center",        lat: 22.5260, lng: 88.3540, type: "Cooling",  capacity: 300,  amenities: ["AC", "Medic"], neighborhood: "Hazra", phone: "033-2466-3030" },
  { name: "Alipore Community Shelter",   lat: 22.5360, lng: 88.3310, type: "Shelter",  capacity: 750,  amenities: ["Power", "Water"], neighborhood: "Alipore", phone: "033-2466-3131" },
  { name: "New Alipore Relief Hub",      lat: 22.5160, lng: 88.3260, type: "Cooling",  capacity: 350,  amenities: ["AC", "ORS"], neighborhood: "New Alipore", phone: "033-2447-3232" },
  { name: "Thakurpukur Community Hub",   lat: 22.4830, lng: 88.3050, type: "Shelter",  capacity: 900,  amenities: ["Power", "Water", "Food"], neighborhood: "Thakurpukur", phone: "033-2447-3333" },
  { name: "Joka Shelter Center",         lat: 22.4630, lng: 88.3070, type: "Shelter",  capacity: 1000, amenities: ["Power", "Water"], neighborhood: "Joka", phone: "033-2447-3434" },
];

export type BloodType = "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";
export type Hospital = LatLng & {
  name: string;
  beds: number;
  oxygen: "available" | "limited" | "critical";
  blood: BloodType[];
  phone: string;
  neighborhood: string;
  emergency: boolean;
};

// Expanded hospital network across Kolkata
export const HOSPITALS: Hospital[] = [
  { name: "SSKM (PG) Hospital", lat: 22.5410, lng: 88.3430, beds: 0, oxygen: "available", blood: ["A+","A-","B+","O+","O-","AB+"], phone: "033-2223-3526", neighborhood: "Bhowanipore", emergency: true },
  { name: "Apollo Gleneagles Hospital", lat: 22.5470, lng: 88.4050, beds: 18, oxygen: "limited", blood: ["A+","O+","B+"], phone: "1860-500-1066", neighborhood: "Salt Lake Sector III", emergency: true },
  { name: "AMRI Salt Lake", lat: 22.5790, lng: 88.4280, beds: 2, oxygen: "available", blood: ["B+","O+","AB+","A+"], phone: "033-6680-0000", neighborhood: "Salt Lake Sector I", emergency: true },
  { name: "AMRI Dhakuria", lat: 22.5050, lng: 88.3700, beds: 31, oxygen: "available", blood: ["A+","B+","O+","O-"], phone: "033-6606-3800", neighborhood: "Dhakuria", emergency: true },
  { name: "AMRI Mukundapur", lat: 22.4990, lng: 88.4030, beds: 27, oxygen: "available", blood: ["A+","O+","AB+","B-"], phone: "033-6606-3000", neighborhood: "Mukundapur", emergency: true },
  { name: "NRS Medical College", lat: 22.5650, lng: 88.3700, beds: 0, oxygen: "available", blood: ["A+","B+","O+","AB+","O-"], phone: "033-2284-4626", neighborhood: "Sealdah", emergency: true },
  { name: "Calcutta Medical College", lat: 22.5740, lng: 88.3620, beds: 51, oxygen: "available", blood: ["A+","O+","AB+","B+"], phone: "033-2241-6401", neighborhood: "College Street", emergency: true },
  { name: "Fortis Anandapur", lat: 22.5070, lng: 88.4030, beds: 12, oxygen: "critical", blood: ["O+","A+"], phone: "033-6628-4444", neighborhood: "Anandapur", emergency: true },
  { name: "Belle Vue Clinic", lat: 22.5400, lng: 88.3550, beds: 0, oxygen: "available", blood: ["A+","O+","B+"], phone: "033-2287-2321", neighborhood: "Park Street", emergency: true },
  { name: "Woodlands Hospital", lat: 22.5340, lng: 88.3540, beds: 19, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-4040-7300", neighborhood: "Alipore", emergency: true },
  { name: "RN Tagore International", lat: 22.5020, lng: 88.4080, beds: 33, oxygen: "available", blood: ["A+","B+","O+","AB+","O-"], phone: "033-7122-5000", neighborhood: "Mukundapur", emergency: true },
  { name: "Peerless Hospital", lat: 22.4830, lng: 88.3940, beds: 22, oxygen: "available", blood: ["A+","O+","B+"], phone: "033-4011-1222", neighborhood: "Panchasayar", emergency: true },
  { name: "Ruby General Hospital", lat: 22.5160, lng: 88.4010, beds: 17, oxygen: "limited", blood: ["O+","A+","B+"], phone: "033-4014-8000", neighborhood: "Kasba", emergency: true },
  { name: "ILS Salt Lake", lat: 22.5870, lng: 88.4170, beds: 14, oxygen: "available", blood: ["A+","O+"], phone: "033-4090-3000", neighborhood: "Salt Lake Sector I", emergency: true },
  { name: "Desun Hospital", lat: 22.5085, lng: 88.4060, beds: 21, oxygen: "available", blood: ["A+","B+","O+","AB+"], phone: "1800-1024-444", neighborhood: "Anandapur", emergency: true },
  { name: "BM Birla Heart Research", lat: 22.5400, lng: 88.3580, beds: 11, oxygen: "available", blood: ["O+","A+"], phone: "033-3040-3040", neighborhood: "Bhowanipore", emergency: true },
  { name: "RG Kar Medical College", lat: 22.6080, lng: 88.3790, beds: 58, oxygen: "available", blood: ["A+","B+","O+","AB+","B-"], phone: "033-2555-7656", neighborhood: "Shyambazar", emergency: true },
  { name: "Chittaranjan National Cancer Inst.", lat: 22.5190, lng: 88.3650, beds: 8, oxygen: "available", blood: ["O+","A+"], phone: "033-2476-5101", neighborhood: "Hazra", emergency: false },
  { name: "Calcutta National Medical College", lat: 22.5440, lng: 88.3700, beds: 44, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-2284-1031", neighborhood: "Beniapukur", emergency: true },
  { name: "ESI Hospital Manicktala", lat: 22.5870, lng: 88.3870, beds: 28, oxygen: "limited", blood: ["A+","O+","B+"], phone: "033-2356-2902", neighborhood: "Manicktala", emergency: true },
  { name: "ESI Hospital Sealdah", lat: 22.5660, lng: 88.3690, beds: 19, oxygen: "available", blood: ["A+","O+"], phone: "033-2350-6303", neighborhood: "Sealdah", emergency: true },
  { name: "MR Bangur Hospital", lat: 22.4940, lng: 88.3490, beds: 36, oxygen: "available", blood: ["A+","B+","O+","AB+"], phone: "033-2473-1666", neighborhood: "Tollygunge", emergency: true },
  { name: "BC Roy Children's Hospital", lat: 22.5870, lng: 88.3830, beds: 22, oxygen: "available", blood: ["A+","O+"], phone: "033-2356-1500", neighborhood: "Phoolbagan", emergency: true },
  { name: "School of Tropical Medicine", lat: 22.5670, lng: 88.3690, beds: 14, oxygen: "limited", blood: ["O+","A+"], phone: "033-2353-1170", neighborhood: "Sealdah", emergency: false },
  { name: "ILS Hospitals Dum Dum", lat: 22.6210, lng: 88.4180, beds: 15, oxygen: "available", blood: ["A+","O+","B+"], phone: "033-4031-5000", neighborhood: "Dum Dum", emergency: true },
  { name: "BN Bose Sub Divisional Hospital", lat: 22.7630, lng: 88.3750, beds: 42, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-2592-0022", neighborhood: "Barrackpore", emergency: true },
  { name: "Howrah General Hospital", lat: 22.5870, lng: 88.3100, beds: 39, oxygen: "available", blood: ["A+","B+","O+","AB+"], phone: "033-2641-2200", neighborhood: "Howrah Sadar", emergency: true },
  { name: "Narayana Multispecialty Howrah", lat: 22.5810, lng: 88.3000, beds: 17, oxygen: "available", blood: ["A+","O+","B+"], phone: "033-7122-5400", neighborhood: "Howrah Sadar", emergency: true },
  { name: "Charnock Hospital New Town", lat: 22.5850, lng: 88.4670, beds: 26, oxygen: "available", blood: ["A+","B+","O+","AB+","O-"], phone: "033-3989-5050", neighborhood: "New Town Action Area I", emergency: true },
  { name: "Tata Medical Center Rajarhat", lat: 22.5750, lng: 88.4830, beds: 12, oxygen: "available", blood: ["O+","A+","O-"], phone: "033-6605-7000", neighborhood: "Rajarhat", emergency: false },
  { name: "ILS New Town", lat: 22.5810, lng: 88.4690, beds: 18, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-4090-3500", neighborhood: "New Town Action Area I", emergency: true },
  { name: "Park Clinic", lat: 22.5520, lng: 88.3680, beds: 9, oxygen: "available", blood: ["A+","O+"], phone: "033-2287-7715", neighborhood: "Park Circus", emergency: true },
  { name: "ICARE Eye Hospital", lat: 22.5760, lng: 88.4140, beds: 6, oxygen: "limited", blood: ["O+"], phone: "033-4096-3000", neighborhood: "Salt Lake Sector I", emergency: false },
  { name: "Genesis Hospital", lat: 22.5410, lng: 88.3950, beds: 13, oxygen: "available", blood: ["A+","O+","B+"], phone: "033-4408-8888", neighborhood: "Topsia", emergency: true },
  { name: "Spandan Hospital Behala", lat: 22.5050, lng: 88.3110, beds: 11, oxygen: "available", blood: ["A+","O+"], phone: "033-2447-2200", neighborhood: "Behala", emergency: true },
  { name: "BP Poddar Hospital", lat: 22.5005, lng: 88.3580, beds: 24, oxygen: "available", blood: ["A+","B+","O+","AB+"], phone: "033-2400-5500", neighborhood: "Lake Gardens", emergency: true },
  { name: "Belle Vue Annexe (Garia)", lat: 22.4630, lng: 88.3990, beds: 10, oxygen: "limited", blood: ["A+","O+"], phone: "033-2436-7700", neighborhood: "Garia", emergency: true },
  { name: "ILS Hospital Dum Dum", lat: 22.6190, lng: 88.4030, beds: 16, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-4090-3100", neighborhood: "Dum Dum", emergency: true },
  { name: "Disha Eye Hospital Barrackpore", lat: 22.7600, lng: 88.3700, beds: 5, oxygen: "limited", blood: ["O+"], phone: "033-2592-4444", neighborhood: "Barrackpore", emergency: false },
  { name: "Apex Institute of Sports Med.", lat: 22.5400, lng: 88.4080, beds: 9, oxygen: "available", blood: ["A+","O+"], phone: "033-4042-2222", neighborhood: "Park Circus", emergency: false },
  { name: "Rabindra Sarobar Medical Center", lat: 22.5085, lng: 88.3470, beds: 20, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-2473-5500", neighborhood: "Rabindra Sarobar", emergency: true },
  { name: "Mukundapur Multispecialty Hub", lat: 22.5000, lng: 88.4030, beds: 28, oxygen: "available", blood: ["A+","B+","O+","AB+"], phone: "033-4014-6000", neighborhood: "Mukundapur", emergency: true },
  { name: "Anandapur Community Hospital", lat: 22.5070, lng: 88.4030, beds: 16, oxygen: "limited", blood: ["O+","A+","B+"], phone: "033-4014-7000", neighborhood: "Anandapur", emergency: true },
  { name: "Kasba Medicare Center", lat: 22.5170, lng: 88.3900, beds: 14, oxygen: "available", blood: ["A+","O+","B+"], phone: "033-4014-8000", neighborhood: "Kasba", emergency: true },
  { name: "Topsia General Hospital", lat: 22.5500, lng: 88.3930, beds: 22, oxygen: "available", blood: ["A+","B+","O+","AB+"], phone: "033-4408-9000", neighborhood: "Topsia", emergency: true },
  { name: "Tangra Medical Clinic", lat: 22.5570, lng: 88.3880, beds: 10, oxygen: "available", blood: ["A+","O+"], phone: "033-4408-9100", neighborhood: "Tangra", emergency: false },
  { name: "Tiljala Community Hospital", lat: 22.5290, lng: 88.3870, beds: 12, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-2466-1111", neighborhood: "Tiljala", emergency: true },
  { name: "Park Circus Medical Hub", lat: 22.5450, lng: 88.3760, beds: 15, oxygen: "available", blood: ["A+","O+","B+"], phone: "033-2287-2000", neighborhood: "Park Circus", emergency: true },
  { name: "Beck Bagan Clinic", lat: 22.5410, lng: 88.3700, beds: 8, oxygen: "available", blood: ["O+","A+"], phone: "033-2287-2100", neighborhood: "Beck Bagan", emergency: false },
  { name: "Gariahat Medicare Center", lat: 22.5180, lng: 88.3680, beds: 18, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-2466-2000", neighborhood: "Gariahat", emergency: true },
  { name: "Ballygunge Medical Complex", lat: 22.5320, lng: 88.3650, beds: 24, oxygen: "available", blood: ["A+","B+","O+","AB+"], phone: "033-2466-2100", neighborhood: "Ballygunge", emergency: true },
  { name: "Hazra Healthcare Hub", lat: 22.5260, lng: 88.3540, beds: 12, oxygen: "available", blood: ["A+","O+"], phone: "033-2466-2200", neighborhood: "Hazra", emergency: true },
  { name: "Rashbehari Community Hospital", lat: 22.5160, lng: 88.3590, beds: 16, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-2466-2300", neighborhood: "Rashbehari", emergency: true },
  { name: "Bhowanipore Medical Center", lat: 22.5320, lng: 88.3470, beds: 20, oxygen: "available", blood: ["A+","B+","O+","AB+"], phone: "033-2466-2400", neighborhood: "Bhowanipore", emergency: true },
  { name: "Alipore Community Hospital", lat: 22.5360, lng: 88.3310, beds: 18, oxygen: "available", blood: ["A+","O+","B+"], phone: "033-2466-2500", neighborhood: "Alipore", emergency: true },
  { name: "New Alipore Medical Clinic", lat: 22.5160, lng: 88.3260, beds: 10, oxygen: "available", blood: ["A+","O+"], phone: "033-2447-1111", neighborhood: "New Alipore", emergency: false },
  { name: "Behala Medicare Center", lat: 22.5040, lng: 88.3120, beds: 20, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-2447-2000", neighborhood: "Behala", emergency: true },
  { name: "Thakurpukur Community Hospital", lat: 22.4830, lng: 88.3050, beds: 22, oxygen: "available", blood: ["A+","B+","O+","AB+"], phone: "033-2447-2100", neighborhood: "Thakurpukur", emergency: true },
  { name: "Joka Medical Complex", lat: 22.4630, lng: 88.3070, beds: 18, oxygen: "available", blood: ["A+","O+","B+"], phone: "033-2447-2200", neighborhood: "Joka", emergency: true },
  { name: "Lake Gardens Health Center", lat: 22.5040, lng: 88.3530, beds: 15, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-2400-1111", neighborhood: "Lake Gardens", emergency: true },
  { name: "Jade avpur Medical Hub", lat: 22.4990, lng: 88.3712, beds: 20, oxygen: "available", blood: ["A+","B+","O+","AB+"], phone: "033-2476-2000", neighborhood: "Jadavpur", emergency: true },
  { name: "Garia Community Hospital", lat: 22.4630, lng: 88.3990, beds: 16, oxygen: "available", blood: ["A+","O+","B+"], phone: "033-2436-1111", neighborhood: "Garia", emergency: true },
  { name: "Sonarpur Medical Center", lat: 22.4380, lng: 88.4220, beds: 12, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-2436-2000", neighborhood: "Sonarpur", emergency: true },
  { name: "Tollygunge Healthcare Hub", lat: 22.4910, lng: 88.3470, beds: 18, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-2473-2000", neighborhood: "Tollygunge", emergency: true },
  { name: "Kalighat Spiritual Hospital", lat: 22.5193, lng: 88.3424, beds: 12, oxygen: "available", blood: ["A+","O+","B+"], phone: "033-2476-1111", neighborhood: "Kalighat", emergency: true },
  { name: "Sealdah Central Hospital", lat: 22.5675, lng: 88.3700, beds: 26, oxygen: "available", blood: ["A+","B+","O+","AB+"], phone: "033-2350-1111", neighborhood: "Sealdah", emergency: true },
  { name: "Entally Medical Center", lat: 22.5630, lng: 88.3760, beds: 14, oxygen: "available", blood: ["A+","O+","B+"], phone: "033-2350-2000", neighborhood: "Entally", emergency: true },
  { name: "Beniapukur Community Hospital", lat: 22.5520, lng: 88.3700, beds: 16, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-2350-3000", neighborhood: "Beniapukur", emergency: true },
  { name: "Phoolbagan Medical Hub", lat: 22.5680, lng: 88.3850, beds: 18, oxygen: "available", blood: ["A+","B+","O+","AB+"], phone: "033-2356-1111", neighborhood: "Phoolbagan", emergency: true },
  { name: "Beleghata Community Hospital", lat: 22.5680, lng: 88.3960, beds: 14, oxygen: "available", blood: ["A+","O+","B+"], phone: "033-4408-1000", neighborhood: "Beleghata", emergency: true },
  { name: "Manicktala General Hospital", lat: 22.5870, lng: 88.3870, beds: 24, oxygen: "available", blood: ["A+","B+","O+","AB+"], phone: "033-2356-2111", neighborhood: "Manicktala", emergency: true },
  { name: "Hatibagan Medical Clinic", lat: 22.5950, lng: 88.3700, beds: 10, oxygen: "available", blood: ["A+","O+"], phone: "033-2360-1111", neighborhood: "Hatibagan", emergency: false },
  { name: "Bagbazar Community Hospital", lat: 22.6020, lng: 88.3650, beds: 16, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-2360-2111", neighborhood: "Bagbazar", emergency: true },
  { name: "Shyambazar Medical Hub", lat: 22.5996, lng: 88.3733, beds: 20, oxygen: "available", blood: ["A+","B+","O+","AB+"], phone: "033-2356-3111", neighborhood: "Shyambazar", emergency: true },
  { name: "Bowbazar Community Hospital", lat: 22.5710, lng: 88.3620, beds: 15, oxygen: "available", blood: ["A+","O+","B+"], phone: "033-2241-1111", neighborhood: "Bowbazar", emergency: true },
  { name: "Park Street Medical Center", lat: 22.5540, lng: 88.3517, beds: 18, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-2288-2000", neighborhood: "Park Street", emergency: true },
  { name: "Esplanade Healthcare Hub", lat: 22.5638, lng: 88.3520, beds: 20, oxygen: "available", blood: ["A+","B+","O+","AB+"], phone: "033-2223-1111", neighborhood: "Esplanade", emergency: true },
  { name: "Fort William Military Hospital", lat: 22.5560, lng: 88.3380, beds: 30, oxygen: "available", blood: ["A+","B+","O+","AB+","O-","A-"], phone: "033-2223-5555", neighborhood: "Fort William", emergency: true },
  { name: "Howrah General Healthcare", lat: 22.5870, lng: 88.3100, beds: 28, oxygen: "available", blood: ["A+","B+","O+","AB+"], phone: "033-2641-1111", neighborhood: "Howrah Sadar", emergency: true },
  { name: "Shibpur Medical Complex", lat: 22.5640, lng: 88.3120, beds: 16, oxygen: "available", blood: ["A+","O+","B+"], phone: "033-2662-1111", neighborhood: "Shibpur", emergency: true },
  { name: "Howrah Bridge Emergency Center", lat: 22.5851, lng: 88.3468, beds: 12, oxygen: "available", blood: ["O+","A+"], phone: "033-2350-4000", neighborhood: "Howrah Bridge", emergency: true },
  { name: "Dakshineswar Spiritual Hospital", lat: 22.6540, lng: 88.3650, beds: 14, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-2555-1111", neighborhood: "Dakshineswar", emergency: true },
  { name: "Barrackpore Military Hospital", lat: 22.7580, lng: 88.3680, beds: 35, oxygen: "available", blood: ["A+","B+","O+","AB+","O-"], phone: "033-2592-1111", neighborhood: "Barrackpore", emergency: true },
  { name: "Bally Community Hospital", lat: 22.6450, lng: 88.3450, beds: 18, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-2610-1111", neighborhood: "Bally", emergency: true },
  { name: "Ultadanga Medical Center", lat: 22.6900, lng: 88.3900, beds: 12, oxygen: "available", blood: ["A+","O+"], phone: "033-2567-1111", neighborhood: "Ultadanga", emergency: false },
  { name: "Narkeldanga Community Hospital", lat: 22.6600, lng: 88.3600, beds: 16, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-2555-2222", neighborhood: "Narkeldanga", emergency: true },
  { name: "Dum Dum Military Hospital", lat: 22.6235, lng: 88.4017, beds: 25, oxygen: "available", blood: ["A+","B+","O+","AB+"], phone: "033-4031-1111", neighborhood: "Dum Dum", emergency: true },
  { name: "Bidhan Nagar Community Hospital", lat: 22.6050, lng: 88.4050, beds: 18, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-4090-2000", neighborhood: "Bidhan Nagar", emergency: true },
  { name: "Lake Town Medical Center", lat: 22.6080, lng: 88.4070, beds: 14, oxygen: "available", blood: ["A+","O+","B+"], phone: "033-4090-2100", neighborhood: "Lake Town", emergency: true },
  { name: "Rajarhat Healthcare Hub", lat: 22.6300, lng: 88.4500, beds: 24, oxygen: "available", blood: ["A+","B+","O+","AB+"], phone: "033-4090-3000", neighborhood: "Rajarhat", emergency: true },
  { name: "New Town Advanced Hospital", lat: 22.6210, lng: 88.4580, beds: 20, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-4096-1111", neighborhood: "New Town Action Area II", emergency: true },
  { name: "Banasree Medical Center", lat: 22.5930, lng: 88.4470, beds: 16, oxygen: "available", blood: ["A+","O+","B+"], phone: "033-4090-2200", neighborhood: "Banasree", emergency: true },
  { name: "Chinar Park Wellness Hub", lat: 22.5800, lng: 88.4300, beds: 12, oxygen: "available", blood: ["A+","B+","O+"], phone: "033-4090-2300", neighborhood: "Chinar Park", emergency: false },
  { name: "Konnagar Community Hospital", lat: 22.6250, lng: 88.3250, beds: 14, oxygen: "available", blood: ["A+","O+","B+"], phone: "033-2610-2222", neighborhood: "Konnagar", emergency: true },
];

export const METRO_STATIONS: (LatLng & { name: string; line: "Blue" | "Green" | "Purple" | "Orange"; lastTrain: string })[] = [
  // North (Blue Line)
  { name: "Dakshineswar",  lat: 22.6540, lng: 88.3650, line: "Blue",   lastTrain: "22:30" },
  { name: "Baranagar",     lat: 22.6455, lng: 88.3755, line: "Blue",   lastTrain: "22:32" },
  { name: "Noapara",       lat: 22.6390, lng: 88.3940, line: "Blue",   lastTrain: "22:34" },
  { name: "Dum Dum",       lat: 22.6220, lng: 88.3950, line: "Blue",   lastTrain: "22:35" },
  { name: "Belgachia",     lat: 22.6022, lng: 88.3936, line: "Blue",   lastTrain: "22:38" },
  { name: "Shyambazar",    lat: 22.6010, lng: 88.3740, line: "Blue",   lastTrain: "22:40" },
  { name: "Shobhabazar",   lat: 22.5950, lng: 88.3640, line: "Blue",   lastTrain: "22:41" },
  { name: "Girish Park",   lat: 22.5850, lng: 88.3610, line: "Blue",   lastTrain: "22:42" },
  // Central (Blue Line)
  { name: "MG Road",       lat: 22.5800, lng: 88.3590, line: "Blue",   lastTrain: "22:44" },
  { name: "Central",       lat: 22.5705, lng: 88.3530, line: "Blue",   lastTrain: "22:46" },
  { name: "Chandni Chowk", lat: 22.5680, lng: 88.3520, line: "Blue",   lastTrain: "22:48" },
  { name: "Esplanade",     lat: 22.5621, lng: 88.3505, line: "Blue",   lastTrain: "22:50" },
  { name: "Park Street",   lat: 22.5540, lng: 88.3517, line: "Blue",   lastTrain: "22:52" },
  { name: "Maidan",        lat: 22.5580, lng: 88.3495, line: "Blue",   lastTrain: "22:54" },
  { name: "Rabindra Sadan",lat: 22.5470, lng: 88.3490, line: "Blue",   lastTrain: "22:56" },
  { name: "Netaji Bhavan", lat: 22.5380, lng: 88.3475, line: "Blue",   lastTrain: "22:57" },
  { name: "Jatin Das Park",lat: 22.5300, lng: 88.3460, line: "Blue",   lastTrain: "22:58" },
  // South (Blue Line)
  { name: "Kalighat",      lat: 22.5230, lng: 88.3450, line: "Blue",   lastTrain: "22:58" },
  { name: "Rabindra Sarobar",lat: 22.5085, lng: 88.3470, line: "Blue", lastTrain: "23:00" },
  { name: "Mahanayak Uttam Kumar",lat: 22.4910, lng: 88.3470, line: "Blue",   lastTrain: "23:02" },
  { name: "Netaji",        lat: 22.4775, lng: 88.3460, line: "Blue",   lastTrain: "23:04" },
  { name: "Masterda Surya Sen",lat: 22.4670, lng: 88.3430, line: "Blue", lastTrain: "23:06" },
  { name: "Gitanjali",     lat: 22.4570, lng: 88.3400, line: "Blue",   lastTrain: "23:08" },
  { name: "Kavi Nazrul",   lat: 22.4500, lng: 88.3380, line: "Blue",   lastTrain: "23:09" },
  { name: "Kavi Subhash",  lat: 22.4700, lng: 88.3850, line: "Blue",   lastTrain: "23:10" },
  
  // Green Line (East-West)
  { name: "Howrah Maidan", lat: 22.5900, lng: 88.3300, line: "Green",  lastTrain: "22:20" },
  { name: "Howrah Station",lat: 22.5830, lng: 88.3420, line: "Green",  lastTrain: "22:23" },
  { name: "Mahakaran",     lat: 22.5740, lng: 88.3480, line: "Green",  lastTrain: "22:26" },
  { name: "Esplanade",     lat: 22.5621, lng: 88.3505, line: "Green",  lastTrain: "22:28" },
  { name: "Sealdah",       lat: 22.5670, lng: 88.3700, line: "Green",  lastTrain: "22:30" },
  { name: "Phoolbagan",    lat: 22.5680, lng: 88.3850, line: "Green",  lastTrain: "22:32" },
  { name: "Salt Lake Stadium",lat: 22.5750, lng: 88.4060, line: "Green",lastTrain: "22:33" },
  { name: "Bengal Chemical",lat: 22.5800, lng: 88.4110, line: "Green", lastTrain: "22:34" },
  { name: "City Centre",   lat: 22.5830, lng: 88.4160, line: "Green",  lastTrain: "22:35" },
  { name: "Central Park",  lat: 22.5780, lng: 88.4220, line: "Green",  lastTrain: "22:36" },
  { name: "Karunamoyee",   lat: 22.5760, lng: 88.4170, line: "Green",  lastTrain: "22:37" },
  { name: "Salt Lake Sector V", lat: 22.5790, lng: 88.4340, line: "Green", lastTrain: "22:38" },
  
  // Purple Line (Joka to Majerhat operational)
  { name: "Joka",          lat: 22.4450, lng: 88.3150, line: "Purple", lastTrain: "22:00" },
  { name: "Thakurpukur",   lat: 22.4570, lng: 88.3155, line: "Purple", lastTrain: "22:02" },
  { name: "Sakher Bazar",  lat: 22.4670, lng: 88.3150, line: "Purple", lastTrain: "22:04" },
  { name: "Behala Chowrasta",lat: 22.4830, lng: 88.3140, line: "Purple",lastTrain: "22:06" },
  { name: "Behala Bazar",  lat: 22.4930, lng: 88.3130, line: "Purple", lastTrain: "22:08" },
  { name: "Taratala",      lat: 22.5110, lng: 88.3120, line: "Purple", lastTrain: "22:11" },
  { name: "Majerhat",      lat: 22.5220, lng: 88.3240, line: "Purple", lastTrain: "22:15" },
  
  // Orange Line (Kavi Subhash to Hemanta Mukhopadhyay operational)
  { name: "Kavi Subhash (New Garia)", lat: 22.4700, lng: 88.3850, line: "Orange", lastTrain: "22:00" },
  { name: "Satyajit Ray",  lat: 22.4840, lng: 88.3880, line: "Orange", lastTrain: "22:03" },
  { name: "Jyotirindra Nandi",lat: 22.4980, lng: 88.3970, line: "Orange",lastTrain: "22:06" },
  { name: "Kavi Sukanta",  lat: 22.5070, lng: 88.4030, line: "Orange", lastTrain: "22:08" },
  { name: "Hemanta Mukhopadhyay",lat: 22.5160, lng: 88.4010, line: "Orange",lastTrain: "22:12" },
  
  // Extended Network - Future Lines
  { name: "Chinar Park", lat: 22.5800, lng: 88.4300, line: "Blue", lastTrain: "22:40" },
  { name: "Banasree", lat: 22.5930, lng: 88.4470, line: "Blue", lastTrain: "22:42" },
  { name: "Bidhan Nagar", lat: 22.6050, lng: 88.4050, line: "Green", lastTrain: "22:39" },
  { name: "Ariadaha", lat: 22.6650, lng: 88.4150, line: "Green", lastTrain: "22:40" },
  { name: "Dakshineswar Extension", lat: 22.6650, lng: 88.3750, line: "Blue", lastTrain: "22:33" },
  { name: "Uttarpara", lat: 22.6750, lng: 88.3520, line: "Blue", lastTrain: "22:35" },
  { name: "Serampore", lat: 22.7350, lng: 88.3930, line: "Blue", lastTrain: "22:36" },
  { name: "Panihati", lat: 22.6850, lng: 88.3980, line: "Blue", lastTrain: "22:34" },
  { name: "Kamarhati", lat: 22.7050, lng: 88.3850, line: "Blue", lastTrain: "22:33" },
  { name: "Tala", lat: 22.7200, lng: 88.3750, line: "Blue", lastTrain: "22:32" },
  { name: "Konnagar", lat: 22.6250, lng: 88.3250, line: "Green", lastTrain: "22:25" },
  { name: "Diamond Harbor", lat: 22.1950, lng: 88.2050, line: "Purple", lastTrain: "21:00" },
  { name: "Budge Budge", lat: 22.1550, lng: 88.1850, line: "Purple", lastTrain: "20:55" },
];

export const METRO_LINES: { name: string; color: string; coords: [number, number][] }[] = [
  { name: "Blue Line (N-S)", color: "#3b82f6", coords: [[22.6540, 88.3650], [22.6455, 88.3755], [22.6390, 88.3940], [22.6220, 88.3950], [22.6022, 88.3936], [22.6010, 88.3740], [22.5950, 88.3640], [22.5850, 88.3610], [22.5800, 88.3590], [22.5705, 88.3530], [22.5680, 88.3520], [22.5621, 88.3505], [22.5580, 88.3495], [22.5540, 88.3517], [22.5470, 88.3490], [22.5380, 88.3475], [22.5300, 88.3460], [22.5230, 88.3450], [22.5085, 88.3470], [22.4910, 88.3470], [22.4775, 88.3460], [22.4670, 88.3430], [22.4570, 88.3400], [22.4500, 88.3380], [22.4700, 88.3850], [22.6650, 88.3750], [22.6750, 88.3520], [22.7350, 88.3930], [22.6850, 88.3980], [22.7050, 88.3850], [22.7200, 88.3750]] },
  { name: "Green Line (E-W)", color: "#22c55e", coords: [[22.5900, 88.3300], [22.5830, 88.3420], [22.5740, 88.3480], [22.5621, 88.3505], [22.5670, 88.3700], [22.5680, 88.3850], [22.5750, 88.4060], [22.5800, 88.4110], [22.5830, 88.4160], [22.5780, 88.4220], [22.5760, 88.4170], [22.5790, 88.4340], [22.6050, 88.4050], [22.6650, 88.4150], [22.6250, 88.3250]] },
  { name: "Purple Line (S-SW)", color: "#a855f7", coords: [[22.4450, 88.3150], [22.4570, 88.3155], [22.4670, 88.3150], [22.4830, 88.3140], [22.4930, 88.3130], [22.5110, 88.3120], [22.5220, 88.3240], [22.1950, 88.2050], [22.1550, 88.1850]] },
  { name: "Orange Line", color: "#f97316", coords: [[22.4700, 88.3850], [22.4840, 88.3880], [22.4980, 88.3970], [22.5070, 88.4030], [22.5160, 88.4010]] },
  { name: "Extended North Line", color: "#06b6d4", coords: [[22.6540, 88.3650], [22.6650, 88.3750], [22.6750, 88.3520], [22.7050, 88.3850], [22.7200, 88.3750], [22.7350, 88.3930]] },
  { name: "Extended East Line", color: "#8b5cf6", coords: [[22.5790, 88.4340], [22.5800, 88.4300], [22.5930, 88.4470], [22.6050, 88.4050], [22.6300, 88.4500], [22.6650, 88.4150]] },
];

export const WOMEN_COACH_TIMINGS = [
  { period: "Morning rush", times: "07:30 – 10:30", coach: "Front + middle coach" },
  { period: "Evening rush", times: "17:00 – 20:30", coach: "Front + middle coach" },
  { period: "Late night",   times: "After 21:00",  coach: "Front coach only" },
];

export const HELPLINES = [
  { number: "112", label: "All-India Emergency", desc: "Police, fire, ambulance" },
  { number: "100", label: "Kolkata Police",     desc: "Crime, accidents" },
  { number: "108", label: "Ambulance",          desc: "Medical emergencies" },
  { number: "1091", label: "Women Helpline",    desc: "24×7 distress" },
  { number: "1098", label: "Childline",         desc: "Children in distress" },
  { number: "1916", label: "KMC Control",       desc: "Civic complaints, flooding" },
];

export function aqiCategory(aqi: number) {
  if (aqi <= 50) return { label: "Good", color: "#22c55e" };
  if (aqi <= 100) return { label: "Moderate", color: "#eab308" };
  if (aqi <= 150) return { label: "Unhealthy (Sensitive)", color: "#f97316" };
  if (aqi <= 200) return { label: "Unhealthy", color: "#ef4444" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "#a855f7" };
  return { label: "Hazardous", color: "#7f1d1d" };
}

export function maskAdvisory(aqi: number) {
  if (aqi <= 100) return { needMask: false, msg: "No mask required", color: "#22c55e" };
  if (aqi <= 200) return { needMask: true, msg: "Wear surgical mask outdoors", color: "#f97316" };
  return { needMask: true, msg: "N95 strongly recommended · limit outdoor time", color: "#ef4444" };
}

export function predictAt(base: number, hoursAhead: number, amplitude = 0.18) {
  const t = hoursAhead / 6;
  const factor = 1 + Math.sin(t * Math.PI) * amplitude - hoursAhead * 0.005;
  return Math.max(0, Math.round(base * factor));
}

export function resilienceScore(z: Zone): number {
  const crimeInv = 100 - z.crime;
  const aqiInv = Math.max(0, 100 - (z.aqi - 50) * 0.4);
  const heatInv = Math.max(0, 100 - (z.heat - 35) * 8);
  const floodInv = 100 - z.flood;
  return Math.round(crimeInv * 0.35 + aqiInv * 0.25 + heatInv * 0.15 + floodInv * 0.25);
}

// Ensure complete coverage across all zones
ZONES.forEach(z => {
  // Add a police station if one doesn't exist for this neighborhood
  if (!POLICE_STATIONS.some(p => p.name.includes(z.name))) {
    POLICE_STATIONS.push({ name: `${z.name} PS`, lat: z.center.lat + 0.002, lng: z.center.lng - 0.001 });
  }
  // Add a resilience hub if one doesn't exist
  if (!RESILIENCE_HUBS.some(h => h.neighborhood === z.name || h.name.includes(z.name))) {
    RESILIENCE_HUBS.push({
      name: `${z.name} Relief Centre`,
      lat: z.center.lat - 0.002,
      lng: z.center.lng + 0.002,
      type: z.flood > 50 ? "Shelter" : "Cooling",
      capacity: 1200 + (z.population || 50000) % 800,
      amenities: ["Power", "Water", "Medic"],
      neighborhood: z.name
    });
  }
  // Add a hospital if one doesn't exist
  if (!HOSPITALS.some(h => h.neighborhood === z.name)) {
    HOSPITALS.push({
      name: `${z.name} General Hospital`,
      lat: z.center.lat + 0.003,
      lng: z.center.lng + 0.003,
      beds: 35 + (z.population || 50000) % 25,
      oxygen: z.aqi > 200 ? "limited" : "available",
      blood: ["A+", "O+", "B+"],
      phone: "108",
      neighborhood: z.name,
      emergency: true
    });
  }
  // Add a metro station if one doesn't exist
  if (!METRO_STATIONS.some(m => m.name.includes(z.name))) {
    METRO_STATIONS.push({
      name: `${z.name} Metro`,
      lat: z.center.lat + 0.001,
      lng: z.center.lng + 0.001,
      line: "Blue",
      lastTrain: "22:30"
    });
  }
});

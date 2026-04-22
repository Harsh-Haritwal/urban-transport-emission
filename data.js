// data.js — All static data for Urban Transport Carbon Emissions

const EMISSION_FACTORS = {
  car: {
    petrol:   192,  // g CO2 per km
    diesel:   171,
    cng:      120,
    electric:  50
  },
  bus: {
    petrol:    82,
    diesel:    68,
    cng:       52,
    electric:  18
  },
  metro: {
    petrol:    0,
    diesel:    0,
    cng:       0,
    electric:  14   // grid average
  },
  bike: {
    petrol:    88,
    diesel:    72,
    cng:       55,
    electric:  22
  },
  cycle: {
    petrol:    0,
    diesel:    0,
    cng:       0,
    electric:  0
  }
};

const MODE_LABELS = {
  car:   "🚗 Car",
  bus:   "🚌 Bus",
  metro: "🚇 Metro",
  bike:  "🛵 Two-Wheeler",
  cycle: "🚲 Bicycle"
};

// Emission equivalents for UX messaging
const EQUIVALENTS = [
  { threshold: 2000, text: "≈ Running a laptop for a week" },
  { threshold: 1000, text: "≈ Charging your phone 80 times" },
  { threshold: 500,  text: "≈ Boiling water for 30 cups of tea" },
  { threshold: 200,  text: "≈ Watching TV for 3 hours" },
  { threshold: 50,   text: "≈ A 10-minute hot shower" },
  { threshold: 0,    text: "✅ Zero direct emissions — great choice!" }
];

// Rating system
const RATINGS = [
  { threshold: 0,    label: "Zero Emission", stars: "🌿🌿🌿🌿🌿", color: "#00e87a" },
  { threshold: 50,   label: "Excellent",     stars: "🌿🌿🌿🌿",   color: "#4caf50" },
  { threshold: 150,  label: "Good",          stars: "🌿🌿🌿",     color: "#8bc34a" },
  { threshold: 500,  label: "Average",       stars: "🌿🌿",       color: "#ffd700" },
  { threshold: 1000, label: "High",          stars: "🌿",         color: "#ff8c42" },
  { threshold: Infinity, label: "Very High", stars: "⚠️",         color: "#ff2d2d" }
];

// Heatmap: emission intensity by zone (row) x hour (col)
// 7 zones (rows), 24 hours (cols); value 0-100
const HEATMAP_DATA = {
  zones: ["Zone A", "Zone B", "Zone C", "Zone D", "Zone E", "Zone F", "Zone G"],
  hours: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`),
  values: [
    // Zone A – Central Business District
    [10,5,3,2,2,8,35,72,91,85,60,55,70,65,58,55,80,95,88,70,45,30,18,12],
    // Zone B – Industrial Area
    [8,4,2,2,3,15,40,68,80,82,85,80,75,78,80,82,78,72,60,45,30,20,14,10],
    // Zone C – Residential North
    [5,3,2,1,1,5,20,55,70,50,35,30,45,40,35,38,55,75,68,50,30,18,10,7],
    // Zone D – Market/Commercial
    [7,4,2,2,3,10,28,60,78,88,92,95,90,92,88,85,80,75,68,55,40,25,14,9],
    // Zone E – Highway Corridor
    [12,6,4,3,4,18,50,80,95,88,75,72,78,80,82,85,90,96,90,75,55,35,22,15],
    // Zone F – Airport Zone
    [15,8,5,4,5,12,30,55,70,65,60,62,68,70,72,75,70,65,58,52,40,30,20,16],
    // Zone G – Suburban South
    [4,2,1,1,1,4,15,40,58,45,30,28,35,32,30,32,45,60,55,40,22,12,7,5]
  ]
};

// Weekly trend data (tons CO2 per day per mode)
const TREND_DATA = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: {
    car:   [1820, 1950, 1870, 1920, 2100, 1650, 980],
    bus:   [620,  680,  650,  700,  750,  580,  320],
    metro: [180,  195,  188,  200,  220,  170,  95],
    bike:  [540,  580,  560,  590,  640,  480,  290],
    cycle: [0,    0,    0,    0,    0,    0,    0]
  }
};

// Traffic mode share (%)
const MODE_SHARE = {
  labels: ["Car", "Bus", "Metro", "Two-Wheeler", "Bicycle"],
  values: [42, 18, 15, 22, 3],
  colors: ["#ff5733", "#ffd700", "#00e87a", "#4fc3f7", "#a5d6a7"]
};

// Hero stats targets (animated counters)
const HERO_STATS = {
  totalCO2: 4280,    // tons per day city avg
  savedPct: 92,      // % saved metro vs car
  tripsToday: 14835
};

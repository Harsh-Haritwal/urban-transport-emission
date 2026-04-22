# Urban Transport Carbon Emission Dashboard

A full-stack web project analyzing CO₂ emissions from urban transport modes.

---

## 📁 File Structure

```
urban-carbon/
├── index.html     → Main HTML structure & layout
├── styles.css     → All CSS (variables, components, responsive)
├── data.js        → Static data (emission factors, heatmap, chart data)
├── app.js         → JavaScript logic (calculator, charts, animations)
├── schema.sql     → SQL database schema, views & indexes
└── README.md      → This file
```

---

## 🛠 Technologies Used

| File         | Technology        |
|--------------|-------------------|
| index.html   | HTML5             |
| styles.css   | CSS3 / Tailwind concepts |
| data.js      | JavaScript / JSON |
| app.js       | JavaScript (ES6+) |
| app.js       | Chart.js (CDN)    |
| schema.sql   | SQL (PostgreSQL)  |

---

## 🎯 Features

- **Emission Calculator** — Select transport mode, fuel type, distance, and passengers to get CO₂ output in grams with a rating and equivalence message.
- **Mode Comparison Chart** — Bar chart comparing CO₂ across all transport modes for a given distance.
- **Pollution Heatmap** — 7 city zones × 24 hours grid showing emission intensity throughout the day.
- **Trend Charts** — Weekly line chart showing daily CO₂ by mode, plus a donut chart of mode share in city traffic.
- **Hero Stats** — Animated counters for city-wide daily CO₂, % saved by metro, and trips analyzed.

---

## 🚀 How to Run

Just open `index.html` in any modern browser — no build step required.

For the SQL backend:
1. Run `schema.sql` in PostgreSQL to create tables and views.
2. Connect your backend (Node.js / Python / etc.) to the database.
3. Replace static `data.js` values with live API calls as needed.

---

## 📊 Data Sources (replace with real data)

- Emission factors: IPCC, Ministry of Road Transport (India), CPCB
- City zone coordinates: Open Street Map / municipal GIS data
- Hourly readings: IoT sensors / traffic counting stations

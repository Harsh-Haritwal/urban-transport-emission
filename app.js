// app.js — Urban Transport Carbon Emissions Dashboard

//  DOM References ──
const modeSelector     = document.getElementById('modeSelector');
const fuelTypeEl       = document.getElementById('fuelType');
const fuelGroup        = document.getElementById('fuelGroup');
const distanceEl       = document.getElementById('distance');
const distanceVal      = document.getElementById('distanceVal');
const passengersEl     = document.getElementById('passengers');
const calcBtn          = document.getElementById('calcBtn');
const resultCO2El      = document.getElementById('resultCO2');
const resultEquivEl    = document.getElementById('resultEquiv');
const resultRatingEl   = document.getElementById('resultRating');
const compareDistEl    = document.getElementById('compareDistance');
const compareBtn       = document.getElementById('compareBtn');
const heatmapGrid      = document.getElementById('heatmapGrid');
const heatmapXAxis     = document.getElementById('heatmapXAxis');
const heatmapInfo      = document.getElementById('heatmapInfo');

//  State ──
let selectedMode = 'car';
let compareChartInstance = null;
let trendChartInstance   = null;
let donutChartInstance   = null;

//  Helpers 
function lerp(a, b, t) { return a + (b - a) * t; }

function animateCounter(el, target, duration = 1800, suffix = '') {
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.floor(lerp(0, target, eased)).toLocaleString() + suffix;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function getEmissionColor(value) {
  if (value === 0)    return '#00e87a';
  if (value < 50)     return '#4caf50';
  if (value < 150)    return '#8bc34a';
  if (value < 500)    return '#ffd700';
  if (value < 1000)   return '#ff8c42';
  return '#ff2d2d';
}

function getRating(value) {
  for (const r of RATINGS) {
    if (value <= r.threshold) return r;
  }
  return RATINGS[RATINGS.length - 1];
}

function getEquivalent(value) {
  for (const e of EQUIVALENTS) {
    if (value >= e.threshold) return e.text;
  }
  return EQUIVALENTS[EQUIVALENTS.length - 1].text;
}

//  Mode Selector 
modeSelector.addEventListener('click', (e) => {
  const btn = e.target.closest('.mode-btn');
  if (!btn) return;
  modeSelector.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedMode = btn.dataset.mode;

  // Show/hide fuel selector
  const noFuel = ['metro', 'cycle'];
  fuelGroup.style.display = noFuel.includes(selectedMode) ? 'none' : '';
});

//  Distance slider ─
distanceEl.addEventListener('input', () => {
  distanceVal.textContent = distanceEl.value;
});

//  Calculator 
calcBtn.addEventListener('click', calculateEmission);

function calculateEmission() {
  const mode       = selectedMode;
  const fuel       = fuelTypeEl.value;
  const distKm     = parseFloat(distanceEl.value);
  const passengers = Math.max(1, parseInt(passengersEl.value) || 1);

  const factor = (EMISSION_FACTORS[mode]?.[fuel]) ?? 0;
  let totalGrams = factor * distKm;

  // Divide by passengers for shared modes
  if (['bus', 'metro'].includes(mode)) {
    totalGrams = totalGrams / passengers;
  }

  const rounded = Math.round(totalGrams);
  const rating  = getRating(rounded);
  const equiv   = getEquivalent(rounded);

  // Animate the number
  animateCounterEl(resultCO2El, rounded);
  // resultEquivEl.textContent = equiv;
  resultRatingEl.innerHTML  = `<span style="color:${rating.color}">${rating.stars} ${rating.label}</span>`;

  drawMeterChart(rounded);
}

function animateCounterEl(el, target, duration = 800) {
  const start = performance.now();
  const from  = parseInt(el.textContent) || 0;
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(lerp(from, target, eased)).toLocaleString();
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

//  Meter semi-donut 
function drawMeterChart(value) {
  const canvas = document.getElementById('resultMeter');
  const ctx    = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const max     = 2000;
  const ratio   = Math.min(value / max, 1);
  const cx = W / 2, cy = H - 8;
  const r  = H - 20;

  // Background arc
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 0);
  ctx.strokeStyle = '#1c2820';
  ctx.lineWidth = 14;
  ctx.stroke();

  // Value arc
  const endAngle = Math.PI + ratio * Math.PI;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, endAngle);
  ctx.strokeStyle = getEmissionColor(value);
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Label
  ctx.fillStyle = '#6b8a72';
  ctx.font = '10px Space Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`0`, cx - r + 8, cy + 2);
  ctx.fillText(`${max}+`, cx + r - 8, cy + 2);
}

//  Compare Chart 
function buildCompareChart(distKm) {
  const canvas = document.getElementById('compareChart');
  if (compareChartInstance) compareChartInstance.destroy();

  const modes  = Object.keys(EMISSION_FACTORS);
  const fuels  = ['petrol', 'petrol', 'electric', 'petrol', 'petrol'];
  const labels = modes.map(m => MODE_LABELS[m]);
  const values = modes.map((m, i) => {
    const f = fuels[i];
    return Math.round((EMISSION_FACTORS[m][f] ?? 0) * distKm);
  });
  const colors = values.map(v => getEmissionColor(v));

  compareChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: `CO₂ (g) over ${distKm}km`,
        data: values,
        backgroundColor: colors,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.y.toLocaleString()} g CO₂`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#6b8a72', font: { family: 'Space Mono', size: 11 } },
          grid: { color: '#1c2820' }
        },
        y: {
          ticks: { color: '#6b8a72', font: { family: 'Space Mono', size: 11 } },
          grid: { color: '#1c2820' }
        }
      }
    }
  });
}

compareBtn.addEventListener('click', () => {
  buildCompareChart(parseFloat(compareDistEl.value) || 20);
});

//  Heatmap 
function buildHeatmap() {
  heatmapGrid.innerHTML   = '';
  heatmapXAxis.innerHTML  = '';

  const { zones, hours, values } = HEATMAP_DATA;
  const totalRows = zones.length;
  const totalCols = hours.length;

  // Update grid columns
  heatmapGrid.style.gridTemplateColumns = `repeat(${totalCols}, 1fr)`;
  heatmapXAxis.style.gridTemplateColumns = `repeat(${totalCols}, 1fr)`;

  for (let r = 0; r < totalRows; r++) {
    for (let c = 0; c < totalCols; c++) {
      const v    = values[r][c];
      const cell = document.createElement('div');
      cell.className = 'heatmap-cell';
      cell.style.background = heatColor(v);
      cell.title = `${zones[r]} at ${hours[c]}: emission index ${v}`;
      cell.addEventListener('mouseenter', () => {
        heatmapInfo.textContent = `📍 ${zones[r]} · ${hours[c]} · Emission Index: ${v}/100`;
      });
      heatmapGrid.appendChild(cell);
    }
  }

  // X-axis labels (every 3 hours)
  for (let c = 0; c < totalCols; c++) {
    const lbl = document.createElement('div');
    lbl.className = 'heatmap-xaxis-label';
    lbl.textContent = c % 3 === 0 ? hours[c] : '';
    heatmapXAxis.appendChild(lbl);
  }
}

function heatColor(v) {
  if (v === 0)  return 'transparent';
  if (v < 20)   return `rgba(26,71,49,${0.3 + v/100})`;
  if (v < 45)   return `rgba(74,124,89,${0.5 + v/200})`;
  if (v < 70)   return `rgba(255,140,66,${0.5 + v/200})`;
  return `rgba(255,${Math.round(45 - v*0.3)},45,${0.7 + v/300})`;
}

//  Trend Charts ─
function buildTrendChart() {
  const canvas = document.getElementById('trendChart');
  if (trendChartInstance) trendChartInstance.destroy();

  const { labels, datasets } = TREND_DATA;
  const colors = {
    car:   '#ff5733',
    bus:   '#ffd700',
    metro: '#00e87a',
    bike:  '#4fc3f7',
    cycle: '#a5d6a7'
  };

  trendChartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: Object.entries(datasets).map(([key, data]) => ({
        label: MODE_LABELS[key],
        data,
        borderColor: colors[key],
        backgroundColor: colors[key] + '18',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 7,
        fill: true
      }))
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { color: '#6b8a72', font: { family: 'Space Mono', size: 11 }, boxWidth: 12 }
        }
      },
      scales: {
        x: {
          ticks: { color: '#6b8a72', font: { family: 'Space Mono', size: 11 } },
          grid: { color: '#1c2820' }
        },
        y: {
          ticks: { color: '#6b8a72', font: { family: 'Space Mono', size: 11 } },
          grid: { color: '#1c2820' }
        }
      }
    }
  });
}

function buildDonutChart() {
  const canvas = document.getElementById('donutChart');
  if (donutChartInstance) donutChartInstance.destroy();

  const { labels, values, colors } = MODE_SHARE;

  donutChartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: '#141c18',
        borderWidth: 3,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#6b8a72', font: { family: 'Space Mono', size: 11 }, boxWidth: 12 }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed}%`
          }
        }
      }
    }
  });
}

//  Hero Stats (Intersection Observer) ──
function initHeroStats() {
  const statCards = document.querySelectorAll('.stat-card');
  const observer  = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 150);
      }
    });
  }, { threshold: 0.2 });

  statCards.forEach(card => observer.observe(card));

  // Animate counters
  const statTotalEl = document.getElementById('stat-total');
  const statSavedEl = document.getElementById('stat-saved');
  const statTripsEl = document.getElementById('stat-trips');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(statTotalEl, HERO_STATS.totalCO2, 2000);
        animateCounter(statSavedEl, HERO_STATS.savedPct,  1600, '%');
        animateCounter(statTripsEl, HERO_STATS.tripsToday, 2200);
        counterObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });

  counterObserver.observe(statCards[0]);
}

//  Init 
document.addEventListener('DOMContentLoaded', () => {
  // Draw default meter (0)
  drawMeterChart(0);

  // Charts
  buildCompareChart(20);
  buildHeatmap();
  buildTrendChart();
  buildDonutChart();

  // Hero stats
  initHeroStats();
});

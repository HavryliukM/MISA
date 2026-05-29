'use strict';

const API_HISTORY = '/api/history';

// Referencie na prvky v UI.
const statusDot  = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const lastUpdate = document.getElementById('last-update');
const histBody   = document.getElementById('history-body');

// Parametre kruhového ukazovateľa pre SVG arc.
const ARC = 377;
const CIRC = 503;

function setGauge(arcId, valId, badgeId, value, min, max, unit) {
    // Prepočítame hodnotu na percento a nastavíme dĺžku oblúka.
    const pct    = Math.max(0, Math.min(1, (value - min) / (max - min)));
    const filled = ARC * pct;
    const gap    = CIRC - filled;
    document.getElementById(arcId).setAttribute('stroke-dasharray', `${filled.toFixed(1)} ${gap.toFixed(1)}`);
    document.getElementById(valId).textContent = value.toFixed(1);
    document.getElementById(badgeId).textContent = `${value.toFixed(1)} ${unit}`;
}

// Graf zobrazuje teplotu a vlhkosť na dvoch osiach.
const chart = new Chart(document.getElementById('main-chart').getContext('2d'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Teplota (°C)',
                data: [],
                borderColor: '#f97316',
                backgroundColor: 'rgba(249,115,22,0.08)',
                fill: true,
                tension: 0.35,
                pointRadius: 0,
                borderWidth: 2,
                yAxisID: 'yTemp',
            },
            {
                label: 'Vlhkosť (%)',
                data: [],
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56,189,248,0.08)',
                fill: true,
                tension: 0.35,
                pointRadius: 0,
                borderWidth: 2,
                yAxisID: 'yHum',
            },
        ],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400 },
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: {
                labels: {
                    color: '#94a3b8',
                    font: { family: "'Outfit', sans-serif", size: 12 },
                    boxWidth: 10,
                    boxHeight: 10,
                    usePointStyle: true,
                    pointStyle: 'circle',
                }
            },
            tooltip: {
                backgroundColor: 'rgba(10,15,28,0.96)',
                borderColor: 'rgba(255,255,255,0.08)',
                borderWidth: 1,
                titleColor: '#64748b',
                bodyColor: '#f1f5f9',
                padding: 12,
                cornerRadius: 10,
                callbacks: {
                    label: ctx => {
                        const unit = ctx.datasetIndex === 0 ? ' °C' : ' %';
                        return ` ${ctx.dataset.label.split(' ')[0]}: ${ctx.parsed.y.toFixed(1)}${unit}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.04)' },
                ticks: {
                    color: '#475569',
                    maxTicksLimit: 8,
                    font: { family: "'Outfit', sans-serif", size: 11 },
                },
                border: { color: 'rgba(255,255,255,0.06)' },
            },
            // Left Y axis — Temperature
            yTemp: {
                position: 'left',
                grid: { color: 'rgba(255,255,255,0.04)' },
                border: { color: 'rgba(255,255,255,0.06)' },
                ticks: {
                    color: '#f97316',
                    font: { family: "'Outfit', sans-serif", size: 11 },
                    callback: v => v.toFixed(0) + ' °C',
                },
            },
            // Right Y axis — Humidity
            yHum: {
                position: 'right',
                grid: { drawOnChartArea: false },
                border: { color: 'rgba(255,255,255,0.06)' },
                ticks: {
                    color: '#38bdf8',
                    font: { family: "'Outfit', sans-serif", size: 11 },
                    callback: v => v.toFixed(0) + ' %',
                },
            },
        },
    },
});

// Konverzia UTC času zo servera na lokálny čas prehliadača.
function toLocalTime(utcString) {
    const date = new Date(utcString.replace(' ', 'T') + 'Z');
    const pad = n => String(n).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

// Pomocné funkcie na aktualizáciu dashboardu.
function updateChart(data) {
    chart.data.labels           = data.map(d => toLocalTime(d.timestamp));
    chart.data.datasets[0].data = data.map(d => d.temp);
    chart.data.datasets[1].data = data.map(d => d.hum);
    chart.update('none');
}

function updateTable(data) {
    // Tabuľku plníme od najnovšieho záznamu po najstarší.
    histBody.innerHTML = '';
    [...data].reverse().forEach(d => {
        const tr = histBody.insertRow(-1);
        tr.innerHTML = `<td>${toLocalTime(d.timestamp)}</td><td>${d.temp.toFixed(1)}</td><td>${d.hum.toFixed(1)}</td>`;
    });
}

function updateGauges(d) {
    // Aktuálne hodnoty zobrazíme v kruhových ukazovateľoch aj v info časti.
    setGauge('temp-arc', 'temp-val', 'temp-badge', d.temp, 0,   50,  '°C');
    setGauge('hum-arc',  'hum-val',  'hum-badge',  d.hum,  0,  100,  '%');
    lastUpdate.textContent = toLocalTime(d.timestamp);
}

function setStatus(ok, lastReading = null) {
    // Stav API a pripojenia zariadenia ukazujeme farebnou bodkou a textom.
    if (!ok) {
        statusDot.className   = 'dot dot--offline';
        statusText.textContent = 'Odpojené (Chyba API)';
        return;
    }

    if (!lastReading) {
        statusDot.className   = 'dot dot--offline';
        statusText.textContent = 'Žiadne dáta';
        return;
    }

    // Ak server nedostal dáta za posledných 15 sekúnd, zariadenie považujeme za neaktívne
    if (lastReading.age_seconds > 15) {
        statusDot.className   = 'dot dot--offline';
        statusText.textContent = 'Zariadenie neaktívne';
    } else {
        statusDot.className   = 'dot dot--online';
        statusText.textContent = 'Pripojené — Živé dáta';
    }
}

// Načítanie dát z backendu a zápis do UI.
async function fetchAll() {
    try {
        const res  = await fetch(API_HISTORY);
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        // Odfiltrujeme chybné záznamy s nulovými alebo podozrivo nízkymi hodnotami.
        const cleanData = data.filter(d => d.temp > 0.5 && d.hum > 1.0);
        
        let lastReading = null;
        if (cleanData.length > 0) {
            lastReading = cleanData[cleanData.length - 1];
            updateGauges(lastReading);
            updateChart(cleanData);
            updateTable(cleanData);
        }
        setStatus(true, lastReading);
    } catch {
        setStatus(false);
    }
}

fetchAll();
setInterval(fetchAll, 3000);

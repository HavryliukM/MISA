'use strict';

const API_LATEST = '/api/latest';
const API_HISTORY = '/api/history';

const els = {
    statusDot:   document.getElementById('status-dot'),
    statusText:  document.getElementById('status-text'),
    historyBody: document.getElementById('history-body'),
    lastUpdate:  document.getElementById('last-update'),
    tempValue:   document.getElementById('temp-value'),
    humValue:    document.getElementById('hum-value'),
    tempBar:     document.getElementById('temp-bar'),
    humBar:      document.getElementById('hum-bar'),
};

// ── Chart.js ────────────────────────────────────────────────────────────────
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
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
            },
            {
                label: 'Vlhkosť (%)',
                data: [],
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56,189,248,0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
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
                    font: { family: "'Outfit', sans-serif", size: 13 },
                    boxWidth: 12,
                    boxHeight: 12,
                    usePointStyle: true,
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15,23,42,0.95)',
                borderColor: 'rgba(255,255,255,0.08)',
                borderWidth: 1,
                titleColor: '#94a3b8',
                bodyColor: '#f8fafc',
                padding: 12,
                cornerRadius: 10,
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.04)' },
                ticks: { color: '#64748b', maxTicksLimit: 8, font: { family: "'Outfit', sans-serif" } },
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.04)' },
                ticks: { color: '#64748b', font: { family: "'Outfit', sans-serif" } },
                min: 0,
                max: 100,
            },
        },
    }
});

// ── Metric card updaters ─────────────────────────────────────────────────────
function updateMetricCards(latestData) {
    if (!latestData) return;

    const temp = latestData.temp;
    const hum  = latestData.hum;

    // Values
    els.tempValue.textContent = temp.toFixed(1);
    els.humValue.textContent  = hum.toFixed(1);

    // Progress bars: temp mapped to -20..60 range, hum to 0..100
    const tempPct = Math.min(100, Math.max(0, ((temp + 20) / 80) * 100));
    const humPct  = Math.min(100, Math.max(0, hum));
    els.tempBar.style.width = tempPct + '%';
    els.humBar.style.width  = humPct  + '%';

    // Timestamp
    els.lastUpdate.textContent = latestData.timestamp;
}

// ── Chart & table updaters ───────────────────────────────────────────────────
function updateChart(dataArray) {
    chart.data.labels            = dataArray.map(d => d.timestamp.split(' ')[1]);
    chart.data.datasets[0].data  = dataArray.map(d => d.temp);
    chart.data.datasets[1].data  = dataArray.map(d => d.hum);
    chart.update('none');
}

function updateTable(dataArray) {
    els.historyBody.innerHTML = '';
    const reversed = [...dataArray].reverse();
    reversed.forEach(d => {
        const tr = els.historyBody.insertRow(-1);
        tr.innerHTML = `<td>${d.timestamp}</td><td>${d.temp.toFixed(1)}</td><td>${d.hum.toFixed(1)}</td>`;
    });
}

// ── Status ───────────────────────────────────────────────────────────────────
function setStatus(connected) {
    if (connected) {
        els.statusDot.className  = 'dot dot--online';
        els.statusText.textContent = 'Pripojené — Živé dáta';
    } else {
        els.statusDot.className  = 'dot dot--offline';
        els.statusText.textContent = 'Odpojené (Chyba API)';
    }
}

// ── Fetch ────────────────────────────────────────────────────────────────────
async function fetchAll() {
    try {
        const res = await fetch(API_HISTORY);
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        updateChart(data);
        updateTable(data);
        if (data.length > 0) updateMetricCards(data[data.length - 1]);
        setStatus(true);
    } catch (e) {
        console.error(e);
        setStatus(false);
    }
}

// ── Init ─────────────────────────────────────────────────────────────────────
fetchAll();
setInterval(fetchAll, 5000);

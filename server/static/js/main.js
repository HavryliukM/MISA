'use strict';

const API_LATEST = '/api/latest';
const API_HISTORY = '/api/history';

const els = {
    statusDot:    document.getElementById('status-dot'),
    statusText:   document.getElementById('status-text'),
    historyBody:  document.getElementById('history-body'),
    lastUpdate:   document.getElementById('last-update'),
};

// Chart.js
const MAX_CHART_POINTS = 50;
const chart = new Chart(document.getElementById('main-chart').getContext('2d'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: 'Teplota (°C)', data: [], borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,.1)', fill: true, tension: 0.4 },
            { label: 'Vlhkosť (%)', data: [], borderColor: '#818cf8', backgroundColor: 'rgba(129,140,248,.1)', fill: true, tension: 0.4 },
        ],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        scales: {
            x: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#64748b', maxTicksLimit: 10 } },
            y: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#64748b' }, min: 0, max: 100 },
        },
    }
});

function updateChart(dataArray) {
    chart.data.labels = dataArray.map(d => d.timestamp.split(' ')[1]);
    chart.data.datasets[0].data = dataArray.map(d => d.temp);
    chart.data.datasets[1].data = dataArray.map(d => d.hum);
    chart.update('none');
}

// Gauges
const gaugeCommon = { width: 190, height: 190, colorPlate: 'transparent', colorMajorTicks: '#e2e8f0', colorValueText: '#e2e8f0', animationDuration: 500 };
const gaugeTemp = new RadialGauge({ ...gaugeCommon, renderTo: 'gauge-temp', title: 'Teplota', units: '°C', minValue: -20, maxValue: 60 }).draw();
const gaugeHum = new RadialGauge({ ...gaugeCommon, renderTo: 'gauge-hum', title: 'Vlhkosť', units: '%', minValue: 0, maxValue: 100 }).draw();

function updateTable(dataArray) {
    els.historyBody.innerHTML = '';
    // Podla zadania su dáta pole zoradené od najstaršieho po najnovšie (pre graf),
    // pre tabuľku ich chceme od najnovšieho.
    const reversed = [...dataArray].reverse();
    reversed.forEach(d => {
        const tr = els.historyBody.insertRow(-1);
        tr.innerHTML = `<td>${d.timestamp}</td><td>${d.temp.toFixed(1)}</td><td>${d.hum.toFixed(1)}</td>`;
    });
}

function updateGauges(latestData) {
    if (latestData) {
        gaugeTemp.value = latestData.temp;
        gaugeHum.value = latestData.hum;
        els.lastUpdate.textContent = latestData.timestamp;
    }
}

function setStatus(connected) {
    if (connected) {
        els.statusDot.className = 'dot dot--online';
        els.statusText.textContent = 'Pripojené - Živé dáta';
    } else {
        els.statusDot.className = 'dot dot--offline';
        els.statusText.textContent = 'Odpojené (Chyba API)';
    }
}

async function fetchHistory() {
    try {
        const response = await fetch(API_HISTORY);
        if (!response.ok) throw new Error('API failed');
        const data = await response.json();
        updateChart(data);
        updateTable(data);
        if (data.length > 0) {
            updateGauges(data[data.length - 1]);
        }
        setStatus(true);
    } catch (e) {
        console.error(e);
        setStatus(false);
    }
}

async function fetchLatest() {
    try {
        const response = await fetch(API_LATEST);
        if (!response.ok) throw new Error('API failed');
        // Pre zjednodusenie nacitavame celu historiu kazdych 10 sekund, 
        // kedze obnova celeho grafu po 1 bode moze robit problem v jednoduchej implementacii.
        // Kedze limit je 50 merani, JSON payload je maly a fetch rychly.
        await fetchHistory();
    } catch (e) {
        console.error(e);
        setStatus(false);
    }
}

// Initial fetch
fetchHistory();

// Poll every 5 seconds
setInterval(fetchLatest, 5000);

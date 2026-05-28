# MISA - Monitorovanie Prostredia (Teplota a Vlhkosť)

## Účel Projektu a Merané Veličiny

## Architektúra Systému

```mermaid
graph TD
    Sensor[DHT11 - Senzor teploty a vlhkosti] -->|1-Wire digitálny signál| MCU[Node32s]
    MCU -->|WiFi / HTTP POST JSON| Server[FastAPI Backend Server]
    Server -->|Ukladanie dát| DB[(SQLite Databáza)]
    Client[Webový Prehliadač / Dashboard] <-->|HTTP GET / AJAX Fetch| Server
```

---

## Štruktúra Projektu

Projekt je rozdelený na tri logické celky: firmvér, server a dokumentáciu.

---

### 1. Hardvér a Mikrokontrolér (firmware)

### 2. Backend a Databáza (server)

### 3. Frontend a Vizualizácia (dashboard)

---

1. **Mikrokontrolér:** Node32s (chip ESP32-D0WD-V3)

- **Mikrokontrolérová platforma (Node32s / ESP32):** Zvolená bola platforma ESP32 (konkrétne doska Node32s) pre jej natívnu podporu 2.4GHz WiFi sieté, čo napĺňa primárnu požiadavku R2 (bezdrôtový prenos). Na rozdiel od základných dosiek rodiny Arduino (Uno/Nano) nevyžaduje prídavné moduly pre sieťovú konektivitu a má dostatok výpočtového výkonu.

2. **Snímač:** DHT11 (Kategória A - Digitálny snímač teploty a vlhkosti, 3-pinový modul)

- **Snímač (DHT11):** Digitálny snímač teploty a vlhkosti. Komunikuje vlastným jednovodičovým digitálnym protokolom (spĺňa Kategóriu A) a vyžaduje iba jeden dátový pin (GPIO 4) na mikrokontroléri. 3-pinový modul má integrovaný pull-up rezistor, čo zjednodušuje zapojenie.

3. **Príslušenstvo:** Prepojovacie vodiče (F-to-F), Micro-USB kábel pre napájanie a programovanie.
4. **Komunikačný protokol (HTTP REST):** Keďže systém odosiela dáta jednosmerne a periodicky z mikrokontroléra na server, použitie klasického HTTP POST dopytu s JSON obsahom je najjednoduchšie, najstabilnejšie a bez nutnosti spravovať dodatočný MQTT broker či riešiť problémy s udržiavaním otvorených WebSocket spojení.
5. **Vizualizačná technológia (FastAPI + HTML/JS Dashboard):** Python framework FastAPI poskytuje extrémnu rýchlosť pri tvorbe REST API. Na strane klienta je použitý čistý HTML/JS s knižnicami Chart.js (pre vykreslenie historického grafu) a canvas-gauges (pre aktuálny stav), čo zaručuje plynulý chod aplikácie bez inštalácie masívnych frontendových frameworkov ako React/Angular. Dáta sa aktualizujú pravidelne pomocou `fetch()`.

Mikrokontrolér odosiela dáta vo formáte štandardného JSON objektu pomocou POST požiadavky na endpoint `/api/measurements`. Časová pečiatka (`timestamp`) sa z dôvodu presnosti a nezávislosti na RTC module v ESP32 generuje až priamo na strane servera pri uložení do databázy.

![Schéma zapojenia ESP32 a DHT11](docs/schema.png)

![Diagram architektúry systému](docs/architecture.png)

```json
{
  "temp": 24.5,
  "hum": 48.2
}

```

### 1. Spustenie Backend Servera

**Prerekvizity:** Nainštalovaný Python 3.9+ na hostiteľskom stroji.

1. Otvorte terminál v priečinku `server`.
2. Vytvorte súbor `server/.env` podľa miestneho nastavenia. Minimálne môže obsahovať:
   - `DATABASE_URL=sqlite:///./database.db`
   - `HISTORY_HOURS=24`
   - `APP_HOST=0.0.0.0`
   - `APP_PORT=5001`
   - `SIMULATOR_URL=http://127.0.0.1:5001/api/measurements`

3. Nainštalujte potrebné knižnice:

```bash
pip install fastapi uvicorn sqlalchemy pydantic jinja2 requests

```

```bash
python app.py

```

4. Webový dashboard bude dostupný na adrese `http://127.0.0.1:5001` (alebo z lokálnej sieti na `http://<IP-ADRESA-SERVERA>:5001`).

Ak nemáte pripojené fyzické ESP32, môžete spustiť priložený simulátor, ktorý generuje realistické zmeny teploty a vlhkosti a posiela ich na lokálny server každých 5 sekúnd:

2. Otvorte nový terminál v priečinku `server`.

```bash
python simulate.py

```

## Ako sprístupniť Dashboard Verejne

### Cloudflare Tunnel

2. Spustite tunel nasmerovaný na váš lokálny port 5001:
3. Z terminálu skopírujte vygenerovanú HTTPS adresu (napr. `https://random-subdomain.trycloudflare.com`).

---

Ak chcete začať s čistým štítom, premazať všetky staré merania a resetovať grafy, môžete to urobiť veľmi jednoducho jedným z týchto dvoch spôsobov:

Pokiaľ máte spustený alebo vypnutý server, môžete spustiť tento príkaz v priečinku `server` na okamžité vymazanie všetkých záznamov:

*(Zmazanie prebehne okamžite, databázový súbor a jeho štruktúra ostanú zachované).*

1. Vypnite spustený server (`Ctrl + C` v termináli).
2. Vymažte súbor `database.db` nachádzajúci sa v priečinku `server/`.
3. Znova spustite server príkazom `python app.py`. Pri štarte server automaticky vytvorí úplne nový, prázdny databázový súbor `database.db` s korektnou štruktúrou.

## Návod na Nahratie Firmvéru (Node32s)

1. Stiahnite a nainštalujte si [Arduino IDE](https://www.arduino.cc/en/software).
2. Pridajte podporu pre ESP32 do správcu dosiek (Board Manager) vložením URL adresy od Espressif.
3. Skopírujte `firmware/main/secrets.example.h` na `firmware/main/secrets.h` a doplňte vlastné WiFi údaje a adresu servera.
4. Otvorte súbor `firmware/main/main.ino`.
5. V správcovi knižníc (Library Manager) si nainštalujte nasledujúce knižnice:
   - `DHT sensor library` (od Adafruit)
   - `Adafruit Unified Sensor`

6. Pripojte ESP32 cez USB, vyberte správny COM port a zvoľte dosku **"Node32s"**.
7. Kliknite na tlačidlo **Upload**.

Poznámka: reálne údaje si udržujte v súbore `firmware/main/secrets.h`, ktorý je ignorovaný Gitom. Pre nový stroj môžete skopírovať `firmware/main/secrets.example.h` na `firmware/main/secrets.h` a doplniť vlastné hodnoty.

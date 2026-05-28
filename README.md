# MISA - Monitorovanie Prostredia (Teplota a Vlhkosť)

## Účel Projektu a Merané Veličiny
Tento projekt predstavuje ucelený systém pre vzdialené monitorovanie fyzikálnych veličín - konkrétne **teploty** a **vlhkosti**. Cieľom je kontinuálny zber týchto dát pomocou hardvérového snímača, ich bezdrôtový prenos na server a okamžitá vizualizácia pomocou moderného webového dashboardu. Systém slúži ako demonštrácia kompletného IoT (Internet of Things) reťazca od zabudovaného zariadenia až po prezentačnú webovú vrstvu.
## Architektúra Systému

```mermaid
graph TD
    Senzor[Senzor DHT11] -->|Teplota a vlhkosť| ESP32[Mikrokontrolér ESP32]
    ESP32 -->|Odosielanie dát cez WiFi| Server[FastAPI Server]
    Server -->|Uloženie do databázy| Databaza[(SQLite Databáza)]
    Prehliadac[Webový Dashboard] <-->|Zobrazenie grafov a hodnôt| Server

```
---

## Štruktúra Projektu

Projekt je rozdelený na tri logické celky: firmvér, server a dokumentáciu.


### 1. Hardvér a Mikrokontrolér (firmware)
* **Arduino WiFi.h & HTTPClient.h** – pre sieťovú komunikáciu a odosielanie JSON dát cez HTTP POST.
* **Adafruit DHT Sensor Library** – na čítanie hodnôt teploty a vlhkosti zo senzora DHT11.
* **Adafruit Unified Sensor** – podporná knižnica pre správne fungovanie DHT senzorov.
  
### 2. Backend a Databáza (server)
* **FastAPI** – moderný, rýchly webový framework pre Python.
* **Uvicorn** – rýchly ASGI webový server pre beh FastAPI aplikácie.
* **SQLAlchemy** – moderné Python ORM na komunikáciu s SQLite databázou bez písania SQL dopytov.
* **Pydantic** – pre dátovú validáciu prichádzajúcich HTTP JSON dát z Node32s.
* **Jinja2** – šablónovací systém pre renderovanie HTML dashboardu.
  
### 3. Frontend a Vizualizácia (dashboard)
* **Chart.js (v4.4.0)** – interaktívny JavaScript graf zobrazujúci historický vývoj teplôt a vlhkosti na dvoch nezávislých Y osiach.
* **Google Fonts (Outfit)** – moderná a elegantná bezpätková typografia.
* **Custom SVG Gauges** – animované ciferníky na hlavnej obrazovke navrhnuté pomocou čistého SVG a CSS transformácií.
---
## Projekt obsahuje
1. **Mikrokontrolér:** Node32s (chip ESP32-D0WD-V3): Zvolená bola platforma ESP32 (konkrétne doska Node32s) pre jej natívnu podporu 2.4GHz WiFi sieté, čo napĺňa primárnu požiadavku R2 (bezdrôtový prenos). Na rozdiel od základných dosiek rodiny Arduino (Uno/Nano) nevyžaduje prídavné moduly pre sieťovú konektivitu a má dostatok výpočtového výkonu. Firmvér na ESP32 po výpadku WiFi automaticky opakovane hľadá sieť a pokúša sa znovu pripojiť, čím zabezpečuje obnovu komunikácie bez zásahu používateľa.
   
3. **Snímač:** DHT11 (Kategória A - Digitálny snímač teploty a vlhkosti, 3-pinový modul): Komunikuje vlastným jednovodičovým digitálnym protokolom (spĺňa Kategóriu A) a vyžaduje iba jeden dátový pin (GPIO 4) na mikrokontroléri. 3-pinový modul má integrovaný pull-up rezistor, čo zjednodušuje zapojenie.
4. **Príslušenstvo:** Prepojovacie vodiče (F-to-F), Micro-USB kábel pre napájanie a programovanie.
   
5. **Komunikačný protokol (HTTP REST):** Keďže systém odosiela dáta jednosmerne a periodicky z mikrokontroléra na server, použitie klasického HTTP POST dopytu s JSON obsahom je najjednoduchšie, najstabilnejšie a bez nutnosti spravovať dodatočný MQTT broker či riešiť problémy s udržiavaním otvorených WebSocket spojení.
   
7. **Vizualizačná technológia (FastAPI + HTML/JS Dashboard):** Python framework FastAPI poskytuje rýchlosť pri tvorbe REST API. Na strane klienta je použitý čistý HTML/JS s knižnicami Chart.js (pre vykreslenie historického grafu) a vizuálne zobrazenie hodnôt je riešené pomocou vlastných SVG ukazovateľov a grafickej vrstvy v JavaScripte, bez použitia externého gauge frameworku. Dáta sa aktualizujú pravidelne pomocou `fetch()`.
   
8. **Programovacie prostredie (Arduino IDE):** Pre vývoj firmvéru bolo zvolené prostredie Arduino IDE kvôli jeho širokej komunite, bohatej podpore knižníc pre ESP32 a DHT snímače, a nízkej komplexnosti pri konfigurácii toolchainu(zaroveň sme ho používali na cvičeniach). Umožňuje rýchly prototyping, jednoduchý prenos kódu na mikrokontrolér a obsahuje integrovaný sériový monitor pre rýchle a efektívne ladenie za behu.
   
9. **Absencia šifrovania na lokálnej sieti (HTTP vs HTTPS):** Prenos dát z ESP32 na backend prebieha prostredníctvom nešifrovaného protokolu HTTP. Táto absencia SSL/TLS zabezpečenia na lokálnej úrovni je kvoli tomu že šifrovanie HTTPS prináša pre 32-bitové mikrokontroléry nezanedbateľnú výpočtovú a časovú réžiu pri nadväzovaní spojenia (TLS handshake, asymetrická kryptografia, správa certifikátov), čo by zbytočne spomaľovalo cyklus merania a odosielania a zvyšovalo energetickú náročnosť hardvéru. Navyše, komunikácia medzi snímačom a backendom prebieha výhradne v rámci zabezpečeného lokálneho intranetového prostredia. Zabezpečený prístup pre koncového používatela z internetu k webovému dashboardu je následne plne vyriešený a šifrovaný pomocou HTTPS prostredníctvom technológie Cloudflare Tunnel.

Mikrokontrolér odosiela dáta vo formáte štandardného JSON objektu pomocou POST požiadavky na endpoint `/api/measurements`. Časová pečiatka (`timestamp`) sa z dôvodu presnosti a nezávislosti na RTC module v ESP32 generuje až priamo na strane servera pri uložení do databázy.

```json
{
  "temp": 24.5,
  "hum": 48.2
}

```
![Schéma zapojenia ESP32 a DHT11](docs/schema.png)

![Diagram architektúry systému](docs/architecture.png)

1. Spustenie Backend Servera

**Prerekvizity:** Nainštalovaný Python 3.9+ na hostiteľskom stroji.

1. Otvorte terminál v priečinku `server`.
2. Vytvorte súbor `server/.env` podľa miestneho nastavenia. Minimálne môže obsahovať:
```bash
   - `DATABASE_URL=sqlite:///./database.db`
   - `HISTORY_HOURS=24`
   - `APP_HOST=0.0.0.0`
   - `APP_PORT=5001`
   - `SIMULATOR_URL=http://127.0.0.1:5001/api/measurements`
```
3. Nainštalujte potrebné knižnice:

```bash
python pip install fastapi uvicorn sqlalchemy pydantic jinja2 requests

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
## Automatické spúšťanie služieb po reštarte (Autostart)

Služby sú navrhnuté tak, aby sa po reštarte hardvéru alebo servera automaticky obnovili:
1. **Mikrokontrolér (ESP32):** Obsahuje v kóde (`main.ino`) automatickú reconnect slučku. Ak dôjde k výpadku napájania alebo WiFi signálu, po reštarte sa ESP32 automaticky pripojí a obnoví meranie a prenos dát bez potreby akéhokoľvek zásahu.
2. **Backend Server (FastAPI):** [ide o možnosť ktora neni zakomponovaná ale môže byť použitá]
   - **Na systémoch Windows:** Spustenie po štarte systému realizované pomocou jednoduchého PowerShell skriptu zaregistrovaného v Plánovači úloh (Task Scheduler). Úloha sa spúšťa s najvyššími oprávneniami na pozadí pri prihlásení používateľa:
     `Start-Process -FilePath "python" -ArgumentList "app.py" -WorkingDirectory "C:\Projects\MM\server" -WindowStyle Hidden`
   - **Na systémoch Linux (systemd):** Produkčný server sa spúšťa ako systémová služba. Konfigurácia `/etc/systemd/system/misa-server.service`:
     ```ini
     [Unit]
     Description=MISA FastAPI Backend Server
     After=network.target

     [Service]
     User=nobody
     WorkingDirectory=/home/user/MM/server
     ExecStart=/usr/bin/python app.py
     Restart=always

     [Install]
     WantedBy=multi-user.target
     ```
     Služba sa aktivuje pomocou príkazu `systemctl enable --now misa-server.service`.

## Ako sprístupniť Dashboard Verejne

### Cloudflare Tunnel

2. Spustite tunel nasmerovaný na váš lokálny port 5001:
3. Z terminálu skopírujte vygenerovanú HTTPS adresu (napr. `https://random-subdomain.trycloudflare.com`).
   
Príklad adresy a jej možnosti: `https://journalists-weekly-serves-faculty.trycloudflare.com` API JSON{`https://journalists-weekly-serves-faculty.trycloudflare.com/api/history`} posledny GET {`https://journalists-weekly-serves-faculty.trycloudflare.com/api/latest`}

## Návod na Nahratie Firmvéru (Node32s)

1. Stiahnite a nainštalujte si [Arduino IDE](https://www.arduino.cc/en/software).
2. Pridajte podporu pre ESP32 do správcu dosiek (Board Manager) vložením URL adresy od Espressif.
3. Otvorte súbor `firmware/main/main.ino`. a doplňte vlastné WiFi údaje a adresu servera.
4. V správcovi knižníc (Library Manager) si nainštalujte nasledujúce knižnice:
   - `DHT sensor library` (od Adafruit)
   - `Adafruit Unified Sensor`

5. Pripojte ESP32 cez USB, vyberte správny COM port a zvoľte dosku **"Node32s"**.
6. Kliknite na tlačidlo **Upload**.

## Štruktúra Projektu
```text
MISA/
├── docs/                   # Obrázky, schémy zapojenia a diagramy
├── firmware/
│   └── main/
│       └── main.ino        # C++ kód pre Node32s (ESP32) a DHT11
├── server/
│   ├── static/             # Statické súbory pre webový dashboard
│   │   ├── css/
│   │   │   └── style.css   # Moderný CSS štýl s podporou responzivity a tmavého režimu
│   │   └── js/
│   │       └── main.js     # Logika dashboardu: Chart.js, animované ciferníky a periodické dopyty
│   ├── templates/
│   │   └── index.html      # HTML šablóna pre hlavnú stránku dashboardu
│   ├── .env                # Lokálny konfiguračný súbor (neodosiela sa na Git)
│   ├── app.py              # FastAPI server (Python backend a REST API)
│   ├── config.py           # Python modul na načítanie premenných prostredia a nastavení
│   ├── database.db         # Lokálna SQLite databáza pre ukladanie meraní (generuje sa sama)
│   ├── models.py           # ORM definícia tabuliek (SQLAlchemy modely)
│   └── simulate.py         # Testovací simulátor odosielania dát na server
├── .gitignore              # Definuje, ktoré súbory a priečinky má Git ignorovať
├── hodnotenieMISA.md       # Hodnotiaca matica / checklist pre projekt (Markdown)
├── hodnotenieMISA.pdf      # Hodnotiaca matica v PDF formáte
├── PLAN-markdown.md        # Pôvodný implementačný plán v Markdown formáte
├── PLAN.pdf                # Pôvodný implementačný plán v PDF formáte
├── SEBEHODNOTENIE.md       # Vyplnené sebahodnotenie študenta k obhajobe
└── README.md               # Hlavná dokumentácia projektu (tento súbor)
```

---

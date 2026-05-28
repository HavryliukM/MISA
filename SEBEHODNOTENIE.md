# Sebahodnotenie projektu MISA

Toto je stručné sebahodnotenie podľa hodnotiacej matice. Pri položkách som vychádzal zo stavu repozitára a z tvojej informácie, že hardware už bol otestovaný a funguje.

## Zhrnutie

| Oblasť | Kritérium | Stav | Poznámka |
|---|---|---|---|
| 1. Hardvér a zapojenie | 1.1 Snímač je fyzicky zapojený a funkčný | Splnené | Hardware bol otestovaný. |
| 1. Hardvér a zapojenie | 1.2 Schéma zapojenia je v repozitári | Splnené | Schéma je v `docs/schema.png`. |
| 1. Hardvér a zapojenie | 1.3 Voľba platformy a snímača je odôvodnená v dokumentácii | Splnené | README vysvetľuje voľbu Node32s a DHT11. |
| 2. Firmvér | 2.1 Firmvér číta snímač správne a konzistentne | Splnené | V `main.ino` sa číta teplota a vlhkosť. |
| 2. Firmvér | 2.2 Dáta sú serializované do štruktúrovaného formátu | Splnené | Merania sa odosielajú ako JSON. |
| 2. Firmvér | 2.3 Perióda merania je zvolená a odôvodnená v dokumentácii | Splnené | Perióda 30 sekúnd je uvedená v README aj vo firmvéri. |
| 2. Firmvér | 2.4 Firmvér ošetruje výpadok bezdrôtového pripojenia | Splnené | ESP32 sa pri výpadku WiFi pokúša znovu pripojiť. |
| 2. Firmvér | 2.5 Voľba programovacieho prostredia je odôvodnená | Čiastočne splnené | Arduino IDE je uvedené, ale zdôvodnenie sa dá ešte doplniť. |
| 3. Komunikačná vrstva | 3.1 Dáta sú úspešne prenášané zo snímača na server / cloudovú službu | Splnené | Prenos fungoval lokálne aj cez Cloudflare Tunnel. |
| 3. Komunikačná vrstva | 3.2 Voľba komunikačného protokolu a infraštruktúry je odôvodnená | Splnené | V dokumentácii je vysvetlený HTTP POST + JSON prenos. |
| 3. Komunikačná vrstva | 3.3 Prenos je zabezpečený alebo je absencia zabezpečenia odôvodnená | Čiastočne splnené | Verejný prístup bol testovaný cez Tunnel, ale prenos zo zariadenia na server je stále HTTP. |
| 3. Komunikačná vrstva | 3.4 Konfiguračné parametre sú oddelené od kódu | Splnené | Používa sa `server/.env` a `secrets.h`. |
| 4. Backend a ukladanie dát | 4.1 Každá prijatá správa je uložená s časovou pečiatkou | Splnené | Backend ukladá každý záznam do SQLite s timestampom. |
| 4. Backend a ukladanie dát | 4.2 Voľba databázy alebo úložiska je odôvodnená | Splnené | SQLite je primeraná pre lokálny projekt a jednoduché odovzdanie. |
| 4. Backend a ukladanie dát | 4.3 Všetky služby sa spúšťajú automaticky po reštarte | Čiastočne splnené | Na ESP32 je riešený automatický reconnect, ale serverové auto-spustenie nie je plne zdokumentované ako služba. |
| 4. Backend a ukladanie dát | 4.4 Konfigurácia servera / brokera je zdokumentovaná v repozitári | Splnené | README obsahuje inštaláciu, `.env` aj spustenie servera. |
| 5. Vizualizácia | 5.1 Dashboard zobrazuje aktuálnu hodnotu s časovou pečiatkou | Splnené | Aktuálne hodnoty aj posledná aktualizácia sú v UI zobrazené. |
| 5. Vizualizácia | 5.2 Dashboard zobrazuje historický graf | Splnené | Graf pokrýva posledných 24 hodín. |
| 5. Vizualizácia | 5.3 Webové rozhranie je prístupné z verejného internetu alebo fakultnej siete | Splnené | Testované cez Cloudflare Tunnel. |
| 5. Vizualizácia | 5.4 Jednotka meranej veličiny je zobrazená | Splnené | Teplota aj vlhkosť majú zobrazené jednotky. |
| 6. Dokumentácia a repozitár | 6.1 Repozitár má prehľadnú adresárovú štruktúru | Splnené | Štruktúra je rozdelená na firmware, server a docs. |
| 6. Dokumentácia a repozitár | 6.2 README obsahuje všetky požadované časti | Čiastočne splnené | Väčšina častí je pokrytá, ale niektoré formulácie sa dajú ešte spresniť. |
| 6. Dokumentácia a repozitár | 6.3 Inštalačný návod je reprodukovateľný | Splnené | Návod sa dá nasledovať krok po kroku. |
| 6. Dokumentácia a repozitár | 6.4 Commit história odráža priebežnú prácu | Splnené | História nie je jednorazový commit a obsahuje viac úprav. |
| 7. Obhajoba a prezentácia | 7.1 Systém funguje počas živého dema end to end | Splnené | Reťazec meranie → prenos → zobrazenie je pripravený. |
| 7. Obhajoba a prezentácia | 7.2 Študent vie odôvodniť svoje návrhové rozhodnutia | Splnené | Voľba ESP32, DHT11, FastAPI, SQLite a HTTP je zdôvodniteľná. |
| 7. Obhajoba a prezentácia | 7.3 Študent vie odpovedať na technické otázky k implementácii | Splnené | Implementácia je v repozitári dostatočne jasná na obhajobu. |

## Krátke zhodnotenie

- Najsilnejšie časti projektu: hardware, zber dát, backend, graf a live dashboard.
- Najslabšie časti: chýbajúce TLS/HTTPS medzi zariadením a serverom a slabšie formálne zdôvodnenie niektorých volieb v dokumentácii.
- Celkovo projekt pôsobí ako funkčný end-to-end systém pripravený na obhajobu.
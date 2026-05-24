# MISA Semestrálny projekt

## Meranie fyzikálnej veličiny s vizualizáciou

## 1.Abstrakt

Cieľom individuálneho projektu je návrh, implementácia a nasadenie systému na meranie
fyzikálnej veličiny pomocou hardvérového snímača, bezdrôtový prenos nameraných dát a
ich zobrazenie prostredníctvom webového rozhrania. Výber meranej veličiny, typu snímača,
mikrokontrolérovej platformy, komunikačného protokolu aj vizualizačnej technológie je
ponechaný na rozhodnutí študenta. Projekt pokrýva celý vývojový reťazec od embedded
firmvéru cez sieťovú komunikáciu až po webovú prezentáciu dát v reálnom čase. Súčasťou
odovzdania je verejný repozitár na platforme GitHub s úplnou technickou dokumentáciou.

## 2.Kontext a motivácia

Systémy pre vzdialené monitorovanie veličín tvoria základ modernej priemyselnej automa­
tizácie, inteligentných budov, environmentálneho monitoringu aj spotrebiteľskej elektroniky.
Spoločným menovateľom týchto systémov je reťazec: fyzický snímač → embedded platforma →
bezdrôtový prenos → vzdialené úložisko → vizualizácia.
Tento projekt modeluje uvedený reťazec v malom meradle. Dôraz je kladený nielen na
funkčnosť výsledného systému, ale aj na kvalitu jeho dokumentácie, reprodukovateľnosť
nasadenia a schopnosť študenta obhájiť svoje návrhové rozhodnutia — vrátane výberu tech­
nológií a ich odôvodnenia.

## 3.Požiadavky na systém

Systém musí spĺňať nasledujúce funkčné požiadavky:
**R1 — Meranie:** Systém meria aspoň jednu fyzikálnu veličinu pomocou reálneho hardvérového
snímača pripojeného k mikrokontrolérovej platforme.

**R2 — Bezdrôtový prenos:** Namerané hodnoty sú prenášané bezdrôtovo (WiFi alebo iná bezdrô­
tová technológia) na vzdialený server alebo cloudovú službu.

**R3 — Ukladanie dát:** Namerané hodnoty sú ukladané spolu s časovou pečiatkou pre možnosť
zobrazenia histórie.

**R4 — Webová vizualizácia:** Systém poskytuje webové rozhranie prístupné z bežného prehli­
adača, ktoré zobrazuje aktuálne aj historické hodnoty.
**R5 — Dostupnosť:** Webové rozhranie je prístupné odkiaľkoľvek — prostredníctvom verejnej IP
adresy, doménového mena, cloudovej služby alebo tunelového riešenia (napr. ngrok, Cloud­
flare Tunnel).

## 4.Hardvérové komponenty

## 4.1.Mikrokontrolérová platforma

Študent si zvolí ľubovoľnú mikrokontrolérovú platformu vybavenou bezdrôtovým rozhraním.
Odporúčané platformy zahŕňajú rodiny ESP8266 a ESP32 (napr. NodeMCU, Wemos D1, ESP
DevKit), Raspberry Pi Pico W, Arduino s WiFi modulom a podobne. Voľba platformy musí byť
odôvodnená v dokumentácii.


### 4.2.Snímač

Študent si zvolí ľubovoľný hardvérový snímač fyzikálnej veličiny. Odporúčané oblasti merania
zahŕňajú environmentálne veličiny (teplota, vlhkosť, tlak, kvalita vzduchu), pohyb a polohu,
svetelné podmienky, zvuk alebo iné fyzikálne javy prístupné bežne dostupnými snímačmi.

#### 4.2.1.Klasifikácia snímačov

Snímače sú pre účely hodnotenia rozdelené do dvoch kategórií:

**Kategória A — digitálne snímače (základná požiadavka):** Snímače komunikujúce prostred­
níctvom štandardných digitálnych zberníc — I²C, SPI, UART alebo 1­Wire. Tieto rozhrania
zabezpečujú priamu digitálnu komunikáciu bez nutnosti ďalšieho spracovania signálu. Prík­
lady: SHT31 (I²C), BME280 (I²C/SPI), SDS011 (UART), DS18B20 (1­Wire).
**Kategória B — analógové snímače (rozšírenie nad rámec základného zadania):** Snímače,
ktorých výstupom je analógový signál (napätie alebo prúd), ktorý vyžaduje pripojenie na
analógový vstup mikrokontroléra (ADC) a prípadnú kalibráciu alebo linearizáciu hodnôt pred
prenosom. Použitie snímača kategórie B je hodnotené ako rozšírenie projektu. Príklady: MQ­
série plynových snímačov s analógovým výstupom, NTC termistory, fotorezistory, odporové
snímače vlhkosti pôdy.

Pre zvolený snímač musí dokumentácia obsahovať jeho kategóriu, schému zapojenia a popis
spracovania výstupného signálu.

## 5. Firmvér

Firmvér mikrokontrolérovej platformy musí implementovať:

- inicializáciu a pravidelné čítanie zvoleného snímača
- inicializáciu bezdrôtového pripojenia s automatickým opätovným pripojením po výpadku
- serializáciu nameraných hodnôt do štruktúrovaného formátu (odporúčaný JSON)
- odosielanie dát na vzdialený server alebo cloudovú službu
- základné ošetrenie chýb (nedostupný snímač, výpadok bezdrôtového pripojenia)
Výber programovacieho prostredia (Arduino framework, MicroPython, CircuitPython a iné) je
ponechaný na študentovi a musí byť odôvodnený v dokumentácii.

### 5.1.Formát prenášaných dát

Odporúčaný formát správy je JSON objekt obsahujúci aspoň nameraná hodnotu, fyzikálnu
jednotku a časovú pečiatku. Príklad:
{
"value": 23. 4 ,
"unit": "°C",
"ts": 1714000000 ,
"sensor": "SHT31"
}
Použitie iného formátu (napr. CSV, vlastný binárny protokol) je prípustné, avšak musí byť
odôvodnené.

### 5.2.Perióda merania

Perióda merania nie je pevne predpísaná. Študent si ju zvolí samostatne a voľbu
odôvodní v dokumentácii. Odôvodnenie musí zohľadniť charakter meranej veličiny (fyzikálne
obmedzenia snímača, rýchlosť zmeny veličiny) a požiadavky na systém.


## 6. Komunikačná vrstva

Výber komunikačného protokolu a infraštruktúry je ponechaný na študentovi. Prípustné
prístupy zahŕňajú okrem iného:

- **MQTT** — protokol publish/subscribe vhodný pre IoT, vyžaduje broker (napr. Mosquitto na
    vlastnom serveri alebo cloudová služba)
- **HTTP/HTTPS** — REST API volania na vlastný server alebo cloudovú platformu
- **WebSocket** — pre prípad požiadavky na nízku latenciu a obojsmernosť
- **Cloudové IoT platformy** — napr. Adafruit IO, ThingSpeak, InfluxDB Cloud, MQTT.cool
Voľba protokolu a infraštruktúry musí byť odôvodnená v dokumentácii s prihliadnutím na
požiadavky projektu, spoľahlivosť a bezpečnosť.

## 7. Vizualizačná vrstva

Webové rozhranie musí zobrazovať:

- **aktuálnu hodnotu** meranej veličiny s časovou pečiatkou posledného merania
- **historické dáta** formou grafu za zvolené časové obdobie (minimálne posledných 24 hodín)
- **jednotku** meranej veličiny

Výber vizualizačnej technológie je ponechaný na študentovi. Prípustné prístupy zahŕňajú
vlastnú webovú aplikáciu (napr. Flask, FastAPI, Node.js/Express s frontendovými knižnicami),
Node­RED dashboard, cloudové dashboardy (Adafruit IO, ThingSpeak) alebo iné riešenia.

Webové rozhranie musí byť prístupné z verejného internetu alebo aspoň z fakultnej siete počas
obhajoby.

## 8.Dokumentácia a repozitár

### 8.1.GitHub repozitár

Študent vytvorí **verejný repozitár** na platforme GitHub s nasledujúcou odporúčanou štruk­
túrou:
/
├── firmware/ # kód pre mikrokontrolér
├── server/ # backend, konfigurácia servera / brokera
├── visualization/ # webová aplikácia alebo konfigurácia dashboardu
├── docs/
│ ├── schema.png # schéma zapojenia snímača
│ └── architecture.png # diagram architektúry systému
└── README.md

### 8.2.README.md

Hlavný README.md musí obsahovať:

- stručný popis systému, meranej veličiny a účelu projektu
- diagram architektúry systému
- zoznam použitého hardvéru a snímača vrátane kategórie (A/B)
- odôvodnenie voľby platformy, snímača, protokolu a vizualizačnej technológie
- inštalačný návod — postup od čistého prostredia po spustený systém
- návod na nahratie firmvéru
- popis formátu prenášaných dát
- URL alebo postup na prístup k webovému rozhraniu

Cieľom je, aby podľa README.md dokázala tretia osoba bez predchádzajúcej znalosti projektu
celý systém zopakovať a spustiť.


### 8.3.Commit história

Priebežná práca musí byť zrejmá z histórie commitov repozitára. Odovzdanie projektu jediným
alebo niekoľkými commitmi tesne pred termínom bude hodnotené ako nedostatok.

## 9. Požiadavky na odovzdanie

Študent odovzdá:

- odkaz na verejný GitHub repozitár
- funkčný systém pripravený na živú demonštráciu

Súčasťou záverečného hodnotenia je **živá obhajoba** — individuálna prezentácia a demonštrá­
cia fungujúceho systému. Počas obhajoby musí byť možné overiť meranie, prenos dát a ich
zobrazenie na webe v reálnom čase. Skúšajúci bude klásť otázky k návrhovým rozhodnutiam
— výberu technológií, architektúre systému a implementačným detailom.



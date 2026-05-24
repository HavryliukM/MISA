#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// --- Nastavenia siete ---
const char* ssid = "VAS_WIFI_NAZOV";
const char* password = "VASE_WIFI_HESLO";

// --- Nastavenia servera ---
// Adresa backendu (buď lokálna IP, alebo verejná ngrok adresa)
const char* serverUrl = "http://192.168.1.X:5001/api/measurements"; 

// --- Nastavenia senzorov ---
#define DHTPIN 4        // Zvoľte vhodný GPIO pin na ESP32 (napr. GPIO4)
#define DHTTYPE DHT22   // DHT 22 (použité v Project11)

// --- Nastavenia merania ---
unsigned long previousMillis = 0;
const long interval = 30000; // Odosielanie každých 30 sekúnd

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Inicializácia senzora
  dht.begin();
  
  // Pripojenie na WiFi
  WiFi.begin(ssid, password);
  Serial.print("Pripajanie na WiFi ");
  Serial.print(ssid);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi pripojene.");
  Serial.print("IP adresa: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  unsigned long currentMillis = millis();

  // Ak uplynul nastavený čas a sme pripojení na WiFi
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    // Ak vypadlo spojenie, skúsime sa znova pripojiť
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("WiFi odpojene. Pripajanie znova...");
      WiFi.disconnect();
      WiFi.reconnect();
      return;
    }

    // Čítanie zo senzora
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    // Skontrolujeme, či sme prečítali platné dáta
    if (isnan(h) || isnan(t)) {
      Serial.println("Chyba citania z DHT senzora!");
      return;
    }

    Serial.print("Teplota: ");
    Serial.print(t);
    Serial.print(" *C, Vlhkost: ");
    Serial.print(h);
    Serial.println(" %");

    // Vytvorenie JSON payloadu
    // Uvedte escapeované úvodzovky
    String jsonPayload = "{\"temp\":" + String(t) + ",\"hum\":" + String(h) + "}";

    // Odoslanie HTTP POST požiadavky
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.print("HTTP Odpoved code: ");
      Serial.println(httpResponseCode);
      String response = http.getString();
      Serial.println(response);
    } else {
      Serial.print("Chyba odosielania HTTP POST: ");
      Serial.println(httpResponseCode);
    }

    http.end(); // Uvoľnenie prostriedkov
  }
}

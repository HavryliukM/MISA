#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include "secrets.h"

// --- Nastavenia senzora ---
#define DHTPIN 4     // GPIO pin, na ktorom je pripojený DHT senzor.
#define DHTTYPE DHT11   // Použitý typ senzora podľa zapojenia.

// --- Nastavenia merania ---
unsigned long previousMillis = 0;
const long interval = 30000; // Odosielanie každých 30 sekúnd

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Spustíme senzor pred prvým čítaním.
  dht.begin();
  
  // Pripojíme sa na WiFi sieť z údajov v secrets.h.
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

  // Meranie a odoslanie spustíme v nastavenom intervale.
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    // Ak WiFi spadne, pokúsime sa pripojiť znova.
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("WiFi odpojene. Pripajanie znova...");
      WiFi.disconnect();
      WiFi.reconnect();
      return;
    }

    // Načítame aktuálnu teplotu a vlhkosť.
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    // Pri chybe čítania nepokračujeme v odosielaní.
    if (isnan(h) || isnan(t)) {
      Serial.println("Chyba citania z DHT senzora");
      return;
    }

    Serial.print("Teplota: ");
    Serial.print(t);
    Serial.print(" *C, Vlhkost: ");
    Serial.print(h);
    Serial.println(" %");

    // Dáta pošleme ako JSON text.
    String jsonPayload = "{\"temp\":" + String(t) + ",\"hum\":" + String(h) + "}";

    // Odoslanie HTTP POST požiadavky na backend.
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

    http.end(); // Uvoľníme sieťové prostriedky.
  }
}

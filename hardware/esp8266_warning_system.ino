/*
 * ESP8266 — LIVE reaction to dashboard sensor changes
 *
 * Pins: D5 buzzer | D6 green LED | D7 white/red LED
 *
 * Connect via WebSocket (instant) + HTTP fallback (150ms poll)
 * Backend: ws://SERVER:3001  or  GET /api/hardware-alert
 *
 * NORMAL:    green solid ON, buzzer OFF
 * LEVEL_1:   green slow blink, beep every 2s
 * LEVEL_2:   warning LED ON, beep every 0.5s
 * CRITICAL:  buzzer continuous, warning LED fast blink
 *
 * Libraries: ESP8266WiFi, ESP8266HTTPClient, ArduinoJson,
 *            WebSockets by Markus Sattler (install via Library Manager)
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <WebSocketsClient.h>

// ─── Config ───────────────────────────────────────────────────────
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SERVER_HOST = "192.168.1.100";
const uint16_t SERVER_PORT = 3001;

#define PIN_BUZZER     D5
#define PIN_GREEN_LED  D6
#define PIN_WARN_LED   D7

const unsigned long HTTP_POLL_MS = 150;
const unsigned long BEEP_DURATION_MS = 80;
const unsigned long GREEN_SLOW_BLINK_MS = 600;
const unsigned long CRITICAL_BLINK_MS = 100;

#define USE_WEBSOCKET true

// ─── State from backend ───────────────────────────────────────────
String warningLevel = "NORMAL";
String buzzerMode = "off";
unsigned long buzzerIntervalMs = 2000;
bool greenLed = true;
String greenLedBlink = "off";
bool warningLed = false;
String redBlink = "off";

WiFiClient wifiClient;
WebSocketsClient webSocket;
bool wsConnected = false;
unsigned long lastHttpPoll = 0;
unsigned long lastBeepStart = 0;
unsigned long lastBeepCycle = 0;
unsigned long lastGreenBlink = 0;
unsigned long lastWarnBlink = 0;
bool greenLedState = false;
bool warnLedState = false;
bool beepActive = false;

void setupPins() {
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_GREEN_LED, OUTPUT);
  pinMode(PIN_WARN_LED, OUTPUT);
  digitalWrite(PIN_BUZZER, LOW);
  digitalWrite(PIN_GREEN_LED, HIGH);
  digitalWrite(PIN_WARN_LED, LOW);
}

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println(" OK " + WiFi.localIP().toString());
}

void applyHardwareJson(JsonDocument& doc) {
  String newLevel = doc["warningLevel"] | "NORMAL";
  if (newLevel != warningLevel) {
    Serial.println(">>> LEVEL: " + warningLevel + " -> " + newLevel);
    lastBeepCycle = millis();
    lastGreenBlink = millis();
    lastWarnBlink = millis();
  }

  warningLevel = newLevel;
  buzzerMode = doc["buzzer"] | "off";
  buzzerIntervalMs = doc["buzzerIntervalMs"] | 2000;
  greenLed = doc["greenLed"] | false;
  greenLedBlink = doc["greenLedBlink"] | "off";
  warningLed = doc["warningLed"] | false;
  redBlink = doc["redLedBlink"] | "off";
}

bool parsePayload(const char* payload) {
  StaticJsonDocument<512> doc;
  if (deserializeJson(doc, payload)) return false;
  if (doc.containsKey("warningLevel")) {
    applyHardwareJson(doc);
    return true;
  }
  if (doc["type"] == "hardwareUpdate" || doc["type"] == "motorData") {
    if (doc.containsKey("hardwareAlert")) {
      applyHardwareJson(doc["hardwareAlert"]);
      return true;
    }
    applyHardwareJson(doc);
    return true;
  }
  return false;
}

void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED:
      wsConnected = true;
      Serial.println("[WS] Connected — live updates enabled");
      webSocket.sendTXT("{\"type\":\"register\",\"role\":\"hardware\"}");
      break;
    case WStype_DISCONNECTED:
      wsConnected = false;
      Serial.println("[WS] Disconnected — HTTP fallback active");
      break;
    case WStype_TEXT: {
      char buf[length + 1];
      memcpy(buf, payload, length);
      buf[length] = 0;
      parsePayload(buf);
      break;
    }
    default:
      break;
  }
}

void connectWebSocket() {
  webSocket.begin(SERVER_HOST, SERVER_PORT, "/");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(1500);
}

bool fetchHttpState() {
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  String url = String("http://") + SERVER_HOST + ":" + String(SERVER_PORT) + "/api/hardware-alert";
  http.begin(wifiClient, url);
  http.addHeader("Cache-Control", "no-cache");
  http.setTimeout(800);
  int code = http.GET();
  if (code != HTTP_CODE_OK) {
    http.end();
    return false;
  }
  String body = http.getString();
  http.end();
  return parsePayload(body.c_str());
}

void stopBuzzer() {
  digitalWrite(PIN_BUZZER, LOW);
  beepActive = false;
}

void startBeep() {
  digitalWrite(PIN_BUZZER, HIGH);
  beepActive = true;
  lastBeepStart = millis();
}

void handleBuzzer(unsigned long now) {
  if (warningLevel == "NORMAL" || buzzerMode == "off") {
    stopBuzzer();
    return;
  }

  if (buzzerMode == "continuous" || warningLevel == "CRITICAL") {
    digitalWrite(PIN_BUZZER, HIGH);
    return;
  }

  unsigned long interval = buzzerIntervalMs;
  if (interval < 100) {
    interval = (warningLevel == "LEVEL_2") ? 500 : 2000;
  }

  if (beepActive) {
    if (now - lastBeepStart >= BEEP_DURATION_MS) {
      stopBuzzer();
      lastBeepCycle = now;
    }
    return;
  }

  if (now - lastBeepCycle >= interval) {
    startBeep();
  }
}

void handleLeds(unsigned long now) {
  if (warningLevel == "CRITICAL" || redBlink == "fast") {
    digitalWrite(PIN_GREEN_LED, LOW);
    if (now - lastWarnBlink >= CRITICAL_BLINK_MS) {
      lastWarnBlink = now;
      warnLedState = !warnLedState;
      digitalWrite(PIN_WARN_LED, warnLedState ? HIGH : LOW);
    }
    return;
  }

  digitalWrite(PIN_WARN_LED, warningLed ? HIGH : LOW);

  if (warningLevel == "LEVEL_1" || greenLedBlink == "slow") {
    if (now - lastGreenBlink >= GREEN_SLOW_BLINK_MS) {
      lastGreenBlink = now;
      greenLedState = !greenLedState;
      digitalWrite(PIN_GREEN_LED, greenLedState ? HIGH : LOW);
    }
    return;
  }

  if (greenLed || warningLevel == "NORMAL") {
    digitalWrite(PIN_GREEN_LED, HIGH);
  } else {
    digitalWrite(PIN_GREEN_LED, LOW);
  }
}

void setup() {
  Serial.begin(115200);
  setupPins();
  connectWiFi();
  lastBeepCycle = millis();

#if USE_WEBSOCKET
  connectWebSocket();
#endif
  fetchHttpState();
}

void loop() {
  unsigned long now = millis();

#if USE_WEBSOCKET
  webSocket.loop();
#endif

  if (!wsConnected && now - lastHttpPoll >= HTTP_POLL_MS) {
    lastHttpPoll = now;
    fetchHttpState();
  }

  handleBuzzer(now);
  handleLeds(now);
  yield();
}

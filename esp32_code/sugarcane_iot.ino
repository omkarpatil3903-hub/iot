#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
#include <time.h>
#include <OneWire.h>           // For DS18B20
#include <DallasTemperature.h>  // For DS18B20
#include <Wire.h>              // For I2C communication (BH1750)
#include <BH1750.h>            // BH1750 Light Sensor Library

#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// ---------------------------------------------------
// CONFIGURATIONS
// ---------------------------------------------------
#define WIFI_SSID "Galaxy S23 FE"
#define WIFI_PASSWORD "00000000"
#define API_KEY "AIzaSyBdSNgAxrZTWpgfvLjpy_1IC0nsIpNAqQU"
#define DATABASE_URL "https://sugarcaneiot-default-rtdb.asia-southeast1.firebasedatabase.app" 

#define DHT_PIN 17
#define DHT_TYPE DHT22
#define PIN_MOISTURE_15CM 34
#define PIN_MOISTURE_30CM 35
#define PIN_MOISTURE_45CM 32
#define PIN_RAIN_SENSOR 33
#define PIN_MQ135 36
#define PIN_SOIL_TEMP 23      // DS18B20 Data Pin on G23

// BH1750 Light Sensor I2C Pins
#define SDA_PIN 21            // I2C SDA on GPIO 21
#define SCL_PIN 22            // I2C SCL on GPIO 22

#define NTP_SERVER "pool.ntp.org"
#define GMT_OFFSET_SEC 19800
#define DAYLIGHT_OFFSET_SEC 0
#define SEND_INTERVAL_MS 300000 
#define WIFI_RECONNECT_DELAY 5000 

// ---------------------------------------------------
// GLOBALS
// ---------------------------------------------------
struct AirQualityData {
  int raw;
  int quality;
  String status;
};

DHT dht(DHT_PIN, DHT_TYPE);
OneWire oneWire(PIN_SOIL_TEMP);          // Initialize OneWire
DallasTemperature soilTemp(&oneWire);    // Initialize DallasTemp
BH1750 lightMeter;                        // Initialize BH1750 Light Sensor

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long lastSendTime = 0;
unsigned long lastWifiCheck = 0;
unsigned long sendInterval = SEND_INTERVAL_MS;
bool signupOK = false;

// ---------------------------------------------------
// FUNCTIONS
// ---------------------------------------------------
void ensureWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.println("[WiFi] Connecting...");
  WiFi.disconnect();
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    delay(500);
    Serial.print(".");
  }
}

unsigned long long getCurrentTimestamp() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);
    delay(1000);
    if (!getLocalTime(&timeinfo)) return 0;
  }
  time(&now);
  return (unsigned long long)now * 1000LL;
}

int getMoisturePercentage(int pin) {
  long sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(pin);
    delay(10);
  }
  int avg = sum / 10;
  return constrain(map(avg, 4095, 1500, 0, 100), 0, 100);
}

AirQualityData readAirQuality() {
  AirQualityData data;
  long sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(PIN_MQ135);
    delay(10);
  }
  data.raw = sum / 10;
  data.quality = constrain(map(data.raw, 400, 2500, 0, 100), 0, 100);
  if (data.quality < 25) data.status = "Good";
  else if (data.quality < 50) data.status = "Moderate";
  else if (data.quality < 75) data.status = "Poor";
  else data.status = "Hazardous";
  return data;
}

String readRainSensor(int &rainLevel) {
  int rainRaw = analogRead(PIN_RAIN_SENSOR);
  rainLevel = constrain(map(rainRaw, 4095, 0, 0, 100), 0, 100);
  if (rainLevel > 70) return "Heavy Rain";
  if (rainLevel > 40) return "Moderate Rain";
  if (rainLevel > 20) return "Light Rain";
  return "No Rain";
}

/**
 * Read light intensity from BH1750 sensor
 * Returns lux value (0-65535 lux range)
 * Returns -1 if sensor read fails
 */
float readLightSensor() {
  float lux = lightMeter.readLightLevel();
  if (lux < 0) {
    Serial.println("  [Error] BH1750 Sensor Read Failed!");
    return 0;
  }
  return lux;
}

void checkControlCommands() {
  if (Firebase.RTDB.getInt(&fbdo, "/config/send_interval")) {
    int newInterval = fbdo.intData();
    if (newInterval >= 60000 && newInterval <= 3600000 && newInterval != (int)sendInterval) {
      sendInterval = newInterval;
      Serial.printf("[Config] Interval: %d ms\n", sendInterval);
    }
  }
}

// ---------------------------------------------------
// SETUP
// ---------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n========================================");
  Serial.println("   Sugarcane IoT v2.6");
  Serial.println("   DHT22 + Moisture + MQ135 + Soil Temp");
  Serial.println("   + BH1750 Light Sensor");
  Serial.println("========================================\n");
  
  dht.begin();
  soilTemp.begin(); // Start Soil Temp Sensor
  
  // Initialize I2C for BH1750 on custom pins (GPIO 21 = SDA, GPIO 22 = SCL)
  Wire.begin(SDA_PIN, SCL_PIN);
  
  // Initialize BH1750 Light Sensor
  // ADDR pin not connected = default address 0x23
  if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    Serial.println("[OK] BH1750 Light Sensor");
  } else {
    Serial.println("[ERROR] BH1750 Light Sensor - Check wiring!");
  }
  
  Serial.println("[OK] DHT22");
  Serial.println("[OK] Soil Temperature (DS18B20)");
  Serial.println("[OK] Soil Moisture (3 sensors)");
  Serial.println("[OK] MQ135 Air Quality");
  Serial.println("[OK] Rain Sensor");

  ensureWiFi();
  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);
  
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  config.token_status_callback = tokenStatusCallback;

  if (Firebase.signUp(&config, &auth, "", "")) {
    signupOK = true;
    Serial.println("[OK] Firebase");
  }
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  Serial.println("\n[READY]\n");
}

// ---------------------------------------------------
// LOOP
// ---------------------------------------------------
void loop() {
  if (millis() - lastWifiCheck > WIFI_RECONNECT_DELAY) {
    if (WiFi.status() != WL_CONNECTED) WiFi.reconnect();
    lastWifiCheck = millis();
  }

  if (Firebase.ready() && signupOK && (millis() - lastSendTime > 10000)) {
    checkControlCommands();
  }

  if (Firebase.ready() && signupOK && (millis() - lastSendTime > sendInterval || lastSendTime == 0)) {
    lastSendTime = millis();
    
    Serial.println("----------------------------------------");
    
    // DHT22 (Air)
    float tempAir = dht.readTemperature();
    float hum = dht.readHumidity();
    if (isnan(tempAir)) tempAir = -99;
    
    // DS18B20 (Soil)
    soilTemp.requestTemperatures();
    float tempSoil = soilTemp.getTempCByIndex(0);
    if (tempSoil == -127.0) Serial.println("  [Error] DS18B20 Sensor/Resistor Fault!");

    Serial.printf("  Air: %.1f°C | Soil: %.1f°C | Hum: %.1f%%\n", tempAir, tempSoil, hum);
    
    // Soil Moisture
    int moist15 = getMoisturePercentage(PIN_MOISTURE_15CM);
    int moist30 = getMoisturePercentage(PIN_MOISTURE_30CM);
    int moist45 = getMoisturePercentage(PIN_MOISTURE_45CM);
    
    // MQ135
    AirQualityData air = readAirQuality();
    
    // Rain
    int rainLevel;
    String rainStatus = readRainSensor(rainLevel);
    
    // BH1750 Light Sensor
    float lightLux = readLightSensor();
    Serial.printf("  Light: %.1f lux\n", lightLux);
    
    unsigned long long timestamp = getCurrentTimestamp();
    
    // Build JSON
    FirebaseJson json;
    json.set("temperature", tempAir);
    json.set("soil_temperature", tempSoil);
    json.set("humidity", hum);
    json.set("moisture_15cm", moist15);
    json.set("moisture_30cm", moist30);
    json.set("moisture_45cm", moist45);
    json.set("air_quality", air.quality);
    json.set("air_quality_raw", air.raw);
    json.set("air_quality_status", air.status);
    json.set("rain_level", rainLevel);
    json.set("rain_status", rainStatus);
    json.set("light_lux", lightLux);   // BH1750 Light Intensity in lux
    json.set("timestamp", timestamp);

    if (timestamp > 1700000000000ULL) {
      String path = "/sensor_data/" + String((unsigned long)(timestamp / 1000));
      Firebase.RTDB.setJSON(&fbdo, path.c_str(), &json);
    }
    
    if (Firebase.RTDB.setJSON(&fbdo, "/current", &json)) {
      Serial.println("  [OK] Data Uploaded to RTDB");
    }
    
    Serial.println("----------------------------------------\n");
  }
}

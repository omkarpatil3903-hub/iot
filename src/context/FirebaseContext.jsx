import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database, isConfigured } from '../config/firebase';

const FirebaseContext = createContext(null);

// Mock data for development when Firebase is not configured
const MOCK_DATA = {
    current: {
        moisture_15cm: 72,
        moisture_30cm: 68,
        moisture_45cm: 65,
        temperature: 32.5,
        humidity: 78,
        rain_active: false,
        rain_intensity: 0,
        timestamp: Date.now()
    },
    historical: {
        rain: [
            { date: '2025-12-24', duration: 2.5, intensity: 'light' },
            { date: '2025-12-25', duration: 0, intensity: 'none' },
            { date: '2025-12-26', duration: 4.2, intensity: 'moderate' },
            { date: '2025-12-27', duration: 1.8, intensity: 'light' },
            { date: '2025-12-28', duration: 0, intensity: 'none' },
            { date: '2025-12-29', duration: 6.1, intensity: 'heavy' },
            { date: '2025-12-30', duration: 0.5, intensity: 'light' }
        ],
        moisture: [
            { timestamp: '6 AM', surface: 68, rootZone: 62 },
            { timestamp: '9 AM', surface: 70, rootZone: 63 },
            { timestamp: '12 PM', surface: 65, rootZone: 64 },
            { timestamp: '3 PM', surface: 62, rootZone: 65 },
            { timestamp: '6 PM', surface: 67, rootZone: 66 },
            { timestamp: '9 PM', surface: 71, rootZone: 65 },
            { timestamp: '12 AM', surface: 73, rootZone: 64 }
        ],
        temperature: [
            { timestamp: '12 AM', temperature: 24.2, humidity: 85 },
            { timestamp: '3 AM', temperature: 23.1, humidity: 88 },
            { timestamp: '6 AM', temperature: 22.8, humidity: 90 },
            { timestamp: '9 AM', temperature: 28.5, humidity: 72 },
            { timestamp: '12 PM', temperature: 34.2, humidity: 58 },
            { timestamp: '3 PM', temperature: 36.8, humidity: 52 },
            { timestamp: '6 PM', temperature: 32.1, humidity: 65 },
            { timestamp: '9 PM', temperature: 27.4, humidity: 78 }
        ]
    }
};

export const FirebaseProvider = ({ children }) => {
    const [currentData, setCurrentData] = useState(null);
    const [historicalData, setHistoricalData] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [useMockData, setUseMockData] = useState(false);

    useEffect(() => {
        // If Firebase is not configured, use mock data immediately
        if (!isConfigured || !database) {
            console.warn('Firebase not configured. Using mock data for development.');
            setUseMockData(true);
            setCurrentData(MOCK_DATA.current);
            setHistoricalData(MOCK_DATA.historical);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Reference to current status
        const currentRef = ref(database, 'current_status');
        const historicalRef = ref(database, 'historical_data');
        const connectedRef = ref(database, '.info/connected');
        // ESP32 sensor data path
        const esp32CurrentRef = ref(database, 'current');
        const esp32SensorDataRef = ref(database, 'sensor_data');

        // Listen for connection state
        const connectedUnsubscribe = onValue(connectedRef, (snap) => {
            setIsConnected(snap.val() === true);
        });

        // Listen for ESP32 current sensor data (temperature, humidity & soil moisture)
        const esp32CurrentUnsubscribe = onValue(
            esp32CurrentRef,
            (snapshot) => {
                const esp32Data = snapshot.val();
                if (esp32Data) {
                    console.log('ESP32 sensor data received:', esp32Data);
                    // Use ONLY real ESP32 data (no mock fallback)
                    setCurrentData({
                        // DHT22 sensor data
                        temperature: esp32Data.temperature,
                        humidity: esp32Data.humidity,
                        // Soil moisture sensors (3 depths)
                        moisture_15cm: esp32Data.moisture_15cm,
                        moisture_30cm: esp32Data.moisture_30cm,
                        moisture_45cm: esp32Data.moisture_45cm,
                        // Rain (Mapped from ESP32 data)
                        rain_active: esp32Data.rain_status === "Raining",
                        rain_intensity: esp32Data.rain_level || 0,
                        // Timestamps
                        esp32Timestamp: esp32Data.timestamp,
                        timestamp: esp32Data.timestamp,
                        lastUpdate: Date.now()
                    });
                    setIsLoading(false);
                }
            },
            (err) => {
                console.error('ESP32 data read error:', err);
            }
        );

        // Listen for current sensor data (fallback/additional sensors from current_status path)
        const currentUnsubscribe = onValue(
            currentRef,
            (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    // Merge with existing ESP32 data if available
                    setCurrentData(prev => ({
                        ...prev,
                        ...data
                    }));
                }
                setIsLoading(false);
            },
            (err) => {
                console.error('Firebase read error:', err);
                setError(err.message);
                setIsLoading(false);
            }
        );

        // Listen for ESP32 historical sensor data
        const esp32HistoricalUnsubscribe = onValue(
            esp32SensorDataRef,
            (snapshot) => {
                const sensorHistory = snapshot.val();
                if (sensorHistory) {
                    // Convert ESP32 sensor data to history format
                    const entries = Object.entries(sensorHistory);

                    // Get latest 24 entries for temperature/moisture charts (last 12 hours)
                    const recentEntries = entries.slice(-24);

                    // For rain, use ALL entries (to capture full week)
                    const allEntries = entries;

                    // Calculate timestamps based on current time going backwards
                    // Each entry is ~70 seconds apart based on ESP32 interval
                    const now = new Date();
                    const intervalMs = 70000; // 70 seconds between readings

                    // Generate proper timestamps (newest to oldest, then reverse)
                    // Generate proper timestamps using real data if available, fallback to calculation
                    const temperatureHistory = recentEntries.map(([key, data], index) => {
                        let entryTime;
                        if (data.timestamp) {
                            entryTime = new Date(data.timestamp);
                        } else {
                            // Fallback: Calculate time based on index (assuming 70s interval)
                            const timeOffset = (recentEntries.length - 1 - index) * intervalMs;
                            entryTime = new Date(now.getTime() - timeOffset);
                        }

                        return {
                            timestamp: entryTime.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                            }),
                            temperature: data.temperature,
                            humidity: data.humidity
                        };
                    });

                    // Moisture history (for moisture charts)
                    const moistureHistory = recentEntries.map(([key, data], index) => {
                        let entryTime;
                        if (data.timestamp) {
                            entryTime = new Date(data.timestamp);
                        } else {
                            const timeOffset = (recentEntries.length - 1 - index) * intervalMs;
                            entryTime = new Date(now.getTime() - timeOffset);
                        }

                        return {
                            timestamp: entryTime.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                            }),
                            surface: data.moisture_15cm,
                            rootZone: data.moisture_30cm,
                            deep: data.moisture_45cm
                        };
                    });

                    // Rain history (Aggregate last 7 days) - Use ALL entries
                    const rainHistoryMap = new Map();
                    const oneDay = 24 * 60 * 60 * 1000;

                    // Initialize last 7 days
                    for (let i = 6; i >= 0; i--) {
                        const d = new Date(now.getTime() - (i * oneDay));
                        const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
                        rainHistoryMap.set(dateStr, {
                            date: dateStr,
                            duration: 0,
                            intensityValidCount: 0,
                            visIntensity: 0
                        });
                    }

                    // Process ALL available history entries for rain
                    allEntries.forEach(([key, data]) => {
                        let entryTime;
                        if (data.timestamp) {
                            entryTime = new Date(data.timestamp);
                        } else {
                            // Skip if no timestamp (legacy data)
                            return;
                        }

                        const dateStr = entryTime.toISOString().split('T')[0];

                        if (rainHistoryMap.has(dateStr)) {
                            const entry = rainHistoryMap.get(dateStr);

                            // If raining: add duration (30 mins per reading)
                            if (data.rain_status === "Raining") {
                                entry.duration += 0.5; // 30 mins = 0.5 hours
                                entry.visIntensity += (data.rain_level || 0);
                                entry.intensityValidCount++;
                            }
                        }
                    });

                    // Format for chart
                    const rainHistory = Array.from(rainHistoryMap.values()).map(day => {
                        let avgIntensity = 0;
                        let intensityLabel = 'none';

                        if (day.intensityValidCount > 0) {
                            avgIntensity = day.visIntensity / day.intensityValidCount;

                            // Categorize intensity
                            if (avgIntensity > 70) intensityLabel = 'heavy';
                            else if (avgIntensity > 40) intensityLabel = 'moderate';
                            else if (avgIntensity > 0) intensityLabel = 'light';
                        }

                        return {
                            date: day.date,
                            duration: day.duration,
                            intensity: intensityLabel
                        };
                    });

                    // Only use real data, no mock fallback
                    setHistoricalData(prev => ({
                        ...prev,
                        temperature: temperatureHistory.length > 0 ? temperatureHistory : prev?.temperature,
                        moisture: moistureHistory.length > 0 ? moistureHistory : prev?.moisture,
                        rain: rainHistory // Always use calculated 7-day window (even if all zeros)
                    }));
                }
            },
            (err) => {
                console.error('ESP32 historical data read error:', err);
            }
        );

        // Listen for historical data
        const historicalUnsubscribe = onValue(
            historicalRef,
            (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setHistoricalData(prev => ({
                        ...MOCK_DATA.historical,
                        ...prev,
                        ...data
                    }));
                } else if (!historicalData) {
                    setHistoricalData(MOCK_DATA.historical);
                }
            },
            (err) => {
                console.error('Firebase historical read error:', err);
                if (!historicalData) {
                    setHistoricalData(MOCK_DATA.historical);
                }
            }
        );

        // Cleanup listeners on unmount
        return () => {
            off(currentRef);
            off(historicalRef);
            off(connectedRef);
            off(esp32CurrentRef);
            off(esp32SensorDataRef);
        };
    }, []);

    // Simulate real-time updates for mock data
    useEffect(() => {
        if (!useMockData) return;

        const interval = setInterval(() => {
            setCurrentData(prev => ({
                ...prev,
                moisture_15cm: Math.max(40, Math.min(95, prev.moisture_15cm + (Math.random() - 0.5) * 4)),
                moisture_30cm: Math.max(40, Math.min(95, prev.moisture_30cm + (Math.random() - 0.5) * 3)),
                moisture_45cm: Math.max(40, Math.min(95, prev.moisture_45cm + (Math.random() - 0.5) * 2)),
                temperature: Math.max(20, Math.min(45, prev.temperature + (Math.random() - 0.5) * 2)),
                humidity: Math.max(30, Math.min(100, prev.humidity + (Math.random() - 0.5) * 5)),
                timestamp: Date.now()
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, [useMockData]);

    const value = {
        currentData,
        historicalData,
        isConnected,
        isLoading,
        error,
        useMockData,
        // Expose mock data for charts if Firebase has no historical data
        mockHistorical: MOCK_DATA.historical
    };

    // Calculate device status (online if data received < 45 mins ago)
    // 45 mins threshold allows for 30 min interval + buffer
    // Use lastUpdate (when we received the data) for more reliable detection
    const lastSeen = currentData?.lastUpdate || currentData?.timestamp || 0;
    const isDeviceOnline = useMockData || (lastSeen > 0 && Date.now() - lastSeen < 45 * 60 * 1000);

    const contextValue = {
        ...value,
        isDeviceOnline
    };

    return (
        <FirebaseContext.Provider value={contextValue}>
            {children}
        </FirebaseContext.Provider>
    );
};

export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (!context) {
        throw new Error('useFirebase must be used within a FirebaseProvider');
    }
    return context;
};

export default FirebaseContext;

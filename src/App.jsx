import { useState, useMemo, lazy, Suspense } from "react";
import { Leaf, Wifi, WifiOff, Clock, Settings, X } from "lucide-react";
import { ref, set } from "firebase/database";
import { database } from "./config/firebase";
import { useFirebase } from "./context/FirebaseContext";
import { useField } from "./context/FieldContext";

// Core Components (always loaded)
import GrowthStageSelector from "./components/GrowthStageSelector";
import StressAlertCard from "./components/StressAlertCard";
import SoilProfileVisualization from "./components/SoilProfileVisualization";
import PlantHealthCard from "./components/PlantHealthCard";
import RainStatusIndicator from "./components/RainStatusIndicator";
import LightSensorCard from "./components/LightSensorCard";
import AirQualityCard from "./components/AirQualityCard";
import QuickStats from "./components/QuickStats";
import ThemeToggle from "./components/ThemeToggle";
import FieldSelector from "./components/FieldSelector";
import HeaderWeatherWidget from "./components/HeaderWeatherWidget";
import TabNavigation, { CollapsibleSection } from "./components/TabNavigation";

// Lazy-loaded Analytics Components
const MoistureAnalyticsCard = lazy(() => import("./components/MoistureAnalyticsCard"));
const CWSICard = lazy(() => import("./components/CWSICard"));
const GDDCard = lazy(() => import("./components/GDDCard"));
const AnomalyAlertCard = lazy(() => import("./components/AnomalyAlertCard"));

// Lazy-loaded Weather Components
const WeatherCard = lazy(() => import("./components/WeatherCard"));
const WeatherForecast = lazy(() => import("./components/WeatherForecast"));
const WeatherRecommendations = lazy(() => import("./components/WeatherRecommendations"));

// Lazy-loaded History/Chart Components
const RainBarChart = lazy(() => import("./components/charts/RainBarChart"));
const MoistureTrendChart = lazy(() => import("./components/charts/MoistureTrendChart"));
const TemperatureChart = lazy(() => import("./components/charts/TemperatureChart"));
const FieldHistoryChart = lazy(() => import("./components/charts/FieldHistoryChart"));
const LightHistoryChart = lazy(() => import("./components/charts/LightHistoryChart"));

// Suspense fallback component
const TabLoadingFallback = () => (
    <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-cane-green border-t-transparent rounded-full animate-spin" />
    </div>
);

function App() {
    const [growthStage, setGrowthStage] = useState("GERMINATION");
    const [activeTab, setActiveTab] = useState("overview");
    const [showSettings, setShowSettings] = useState(false);
    const [dataInterval, setDataInterval] = useState(5);

    const handleSaveSettings = async () => {
        if (!database) return;
        try {
            const ms = dataInterval * 60 * 1000;
            await set(ref(database, "config/send_interval"), ms);
            alert(`Interval set to ${dataInterval} minutes!`);
            setShowSettings(false);
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings");
        }
    };

    const { currentData, historicalData, isConnected, isDeviceOnline, isLoading } = useFirebase();
    const { activeField } = useField();

    const rainData = historicalData?.rain || [];
    const moistureData = historicalData?.moisture || [];
    const temperatureData = historicalData?.temperature || [];

    // Memoize expensive calculations
    const avgMoisture = useMemo(() => {
        if (!currentData) return null;
        return ((currentData.moisture_15cm || 0) + (currentData.moisture_30cm || 0) + (currentData.moisture_45cm || 0)) / 3;
    }, [currentData?.moisture_15cm, currentData?.moisture_30cm, currentData?.moisture_45cm]);

    const gddData = useMemo(() => {
        if (!temperatureData || temperatureData.length === 0) {
            return { accumulated: 850, daily: 15 };
        }
        const SUGARCANE_BASE_TEMP = 10;
        let totalGDD = 0;
        let dailyGDD = 0;
        temperatureData.forEach((entry, index) => {
            const temp = entry.temperature;
            if (temp != null) {
                const gdd = Math.max(0, temp - SUGARCANE_BASE_TEMP);
                totalGDD += gdd;
                if (index === temperatureData.length - 1) {
                    dailyGDD = gdd;
                }
            }
        });
        return { accumulated: Math.round(totalGDD), daily: Math.round(dailyGDD) };
    }, [temperatureData]);

    const currentTime = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const currentDate = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-surface-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cane-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/60">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-dark">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-surface-dark/95 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 bg-cane-green/20 rounded-xl">
                                <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-cane-green" />
                            </div>
                            <div>
                                <h1 className="text-sm sm:text-lg font-bold text-white">Sugarcane Monitor</h1>
                                <div className="hidden sm:flex items-center gap-2 text-xs text-white/50">
                                    <Clock className="w-3 h-3" />
                                    <span>{currentDate} • {currentTime}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-3">
                            <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium ${isConnected ? (isDeviceOnline ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400") : "bg-red-500/20 text-red-400"}`}>
                                {isConnected ? (isDeviceOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />) : <WifiOff className="w-3 h-3" />}
                                <span className="hidden xs:inline">{isConnected ? (isDeviceOnline ? "Live" : "Offline") : "Disconnected"}</span>
                            </div>
                            <HeaderWeatherWidget />
                            <div className="hidden sm:block"><ThemeToggle /></div>
                            <FieldSelector />
                            <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Growth Stage */}
                    <div className="md:hidden mt-3">
                        <GrowthStageSelector selectedStage={growthStage} onStageChange={setGrowthStage} />
                    </div>
                </div>
            </header>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface-card border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Settings</h2>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-white/70" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/70 mb-2">
                                    Data Send Interval (minutes)
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="1"
                                        max="60"
                                        value={dataInterval}
                                        onChange={(e) => setDataInterval(Number(e.target.value))}
                                        className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cane-green"
                                    />
                                    <span className="text-white font-bold w-12 text-center">{dataInterval}m</span>
                                </div>
                                <p className="text-xs text-white/40 mt-2">
                                    ESP32 will send sensor data every {dataInterval} minute{dataInterval > 1 ? 's' : ''}
                                </p>
                            </div>

                            <button
                                onClick={handleSaveSettings}
                                className="w-full py-3 bg-cane-green hover:bg-cane-green/80 text-white font-semibold rounded-xl transition-colors"
                            >
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6">


                {/* TABBED DASHBOARD */}
                <TabNavigation activeTab={activeTab} onTabChange={setActiveTab}>

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <QuickStats currentData={currentData} avgMoisture={avgMoisture} growthStage={growthStage} />

                            <CollapsibleSection title="Current Status & Alerts" icon={<span className="w-1 h-4 bg-red-500 rounded-full" />} defaultOpen={true} badge="5 cards">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <PlantHealthCard temperature={currentData?.temperature} humidity={currentData?.humidity} moisture={avgMoisture} rainLevel={currentData?.rain_intensity || 0} />
                                    <StressAlertCard temperature={currentData?.temperature} humidity={currentData?.humidity} />
                                    <RainStatusIndicator isActive={currentData?.rain_active} intensity={currentData?.rain_intensity || 0} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <LightSensorCard />
                                    <AirQualityCard />
                                </div>
                            </CollapsibleSection>

                            <CollapsibleSection title="Soil Moisture Profile" icon={<span className="w-1 h-4 bg-cane-green rounded-full" />} defaultOpen={true}>
                                <SoilProfileVisualization moisture15={currentData?.moisture_15cm} moisture30={currentData?.moisture_30cm} moisture45={currentData?.moisture_45cm} />
                            </CollapsibleSection>
                        </div>
                    )}

                    {/* ANALYTICS TAB */}
                    {activeTab === 'analytics' && (
                        <Suspense fallback={<TabLoadingFallback />}>
                            <div className="space-y-6">
                                <CollapsibleSection title="Advanced Analytics" icon={<span className="w-1 h-4 bg-purple-500 rounded-full" />} defaultOpen={true} badge="4 metrics">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <MoistureAnalyticsCard moistureHistory={moistureData} currentMoisture={avgMoisture} growthStage={growthStage} />
                                        <CWSICard temperature={currentData?.temperature} humidity={currentData?.humidity} soilMoisture={avgMoisture} />
                                        <GDDCard accumulatedGDD={gddData.accumulated} dailyGDD={gddData.daily} />
                                        <AnomalyAlertCard currentData={currentData} historicalData={historicalData} />
                                    </div>
                                </CollapsibleSection>

                                <CollapsibleSection title="Growth Stage Management" icon={<span className="w-1 h-4 bg-lime-500 rounded-full" />} defaultOpen={true}>
                                    <GrowthStageSelector selectedStage={growthStage} onStageChange={setGrowthStage} plantingDate={activeField?.plantingDate} />
                                </CollapsibleSection>
                            </div>
                        </Suspense>
                    )}

                    {/* WEATHER TAB */}
                    {activeTab === 'weather' && (
                        <Suspense fallback={<TabLoadingFallback />}>
                            <div className="space-y-6">
                                <CollapsibleSection title="Current Weather" icon={<span className="w-1 h-4 bg-blue-500 rounded-full" />} defaultOpen={true}>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <WeatherCard />
                                        <WeatherRecommendations currentMoisture={avgMoisture} />
                                    </div>
                                </CollapsibleSection>

                                <CollapsibleSection title="7-Day Forecast" icon={<span className="w-1 h-4 bg-cyan-500 rounded-full" />} defaultOpen={true}>
                                    <WeatherForecast />
                                </CollapsibleSection>
                            </div>
                        </Suspense>
                    )}

                    {/* HISTORY TAB */}
                    {activeTab === 'history' && (
                        <Suspense fallback={<TabLoadingFallback />}>
                            <div className="space-y-6">
                                <CollapsibleSection title="Temperature & Rain" icon={<span className="w-1 h-4 bg-orange-500 rounded-full" />} defaultOpen={true}>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <TemperatureChart data={temperatureData} />
                                        <RainBarChart data={rainData} />
                                    </div>
                                </CollapsibleSection>

                                <CollapsibleSection title="Moisture Trends" icon={<span className="w-1 h-4 bg-blue-500 rounded-full" />} defaultOpen={true}>
                                    <MoistureTrendChart data={moistureData} growthStage={growthStage} />
                                </CollapsibleSection>

                                <CollapsibleSection title="Light Intensity" icon={<span className="w-1 h-4 bg-yellow-500 rounded-full" />} defaultOpen={true}>
                                    <LightHistoryChart />
                                </CollapsibleSection>

                                <CollapsibleSection title="Field History" icon={<span className="w-1 h-4 bg-purple-500 rounded-full" />} defaultOpen={false}>
                                    <FieldHistoryChart />
                                </CollapsibleSection>
                            </div>
                        </Suspense>
                    )}

                </TabNavigation>

                {/* Footer */}
                <footer className="mt-8 pt-6 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
                        <div className="flex items-center gap-2">
                            <Leaf className="w-4 h-4 text-cane-green" />
                            <span>Sugarcane Monitoring System v2.0</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span>Field: {activeField?.name}</span>
                            <span>Last sync: {currentData?.timestamp ? new Date(currentData.timestamp).toLocaleTimeString() : "N/A"}</span>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}

export default App;

import { useState } from 'react';
import { Leaf, Wifi, WifiOff, RefreshCw, Menu, X, Clock, Settings } from 'lucide-react';
import { ref, set, get } from 'firebase/database';
import { database } from './config/firebase';
import { useFirebase } from './context/FirebaseContext';
import { useField } from './context/FieldContext';
import { SENSOR_DEPTHS } from './config/agronomyConfig';

// Components
import GrowthStageSelector from './components/GrowthStageSelector';
import StressAlertCard from './components/StressAlertCard';
import SoilProfileVisualization from './components/SoilProfileVisualization';
import PlantHealthCard from './components/PlantHealthCard';
import RainStatusIndicator from './components/RainStatusIndicator';
import RainBarChart from './components/charts/RainBarChart';
import MoistureTrendChart from './components/charts/MoistureTrendChart';
import TemperatureChart from './components/charts/TemperatureChart';
import FieldHistoryChart from './components/charts/FieldHistoryChart';
import QuickStats from './components/QuickStats';
import ThemeToggle from './components/ThemeToggle';
import FieldSelector from './components/FieldSelector';

// New Analytics Components
import MoistureAnalyticsCard from './components/MoistureAnalyticsCard';
import CWSICard from './components/CWSICard';
import GDDCard from './components/GDDCard';
import AnomalyAlertCard from './components/AnomalyAlertCard';

function App() {
  const [growthStage, setGrowthStage] = useState('GERMINATION');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dataInterval, setDataInterval] = useState(5); // Default 5 mins

  // Handle Settings Save
  const handleSaveSettings = async () => {
    if (!database) return;
    try {
      const ms = dataInterval * 60 * 1000;
      await set(ref(database, 'config/send_interval'), ms);
      alert(`Interval set to ${dataInterval} minutes!`);
      setShowSettings(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  // Load initial settings
  const loadSettings = async () => {
    if (!database) return;
    try {
      const snapshot = await get(ref(database, 'config/send_interval'));
      if (snapshot.exists()) {
        setDataInterval(snapshot.val() / 60000);
      }
    } catch (error) {
      console.error("Error loading settings", error);
    }
  };

  const {
    currentData,
    historicalData,
    isConnected,
    isDeviceOnline,
    isLoading,
    useMockData,
    mockHistorical
  } = useFirebase();

  const { activeField } = useField();

  // Use mock historical data if Firebase doesn't have any
  const rainData = historicalData?.rain || mockHistorical.rain;
  const moistureData = historicalData?.moisture || mockHistorical.moisture;
  const temperatureData = historicalData?.temperature || mockHistorical.temperature;

  // Calculate average moisture for CWSI
  const avgMoisture = currentData
    ? ((currentData.moisture_15cm || 0) + (currentData.moisture_30cm || 0) + (currentData.moisture_45cm || 0)) / 3
    : null;

  // Format current time (12-hour format)
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-dark flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-cane-green animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading sensor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-dark/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cane-green rounded-xl shadow-lg shadow-cane-green/20">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white">SugarCane Monitor</h1>
                <p className="text-xs text-white/50">{activeField?.name || 'Field Analytics'}</p>
              </div>
            </div>

            {/* Center: Field Selector (Desktop) */}
            <div className="hidden md:block">
              <FieldSelector />
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2">
              {/* Date Time Display */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-white/60">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs">{currentDate} • {currentTime}</span>
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Connection Status - DUAL INDICATOR */}
              <div className="flex items-center gap-2">
                {/* App Network Status */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${isConnected || useMockData
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
                  }`}
                  title={isConnected ? "App connected to Firebase" : "App disconnected"}
                >
                  {isConnected || useMockData ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                </div>

                {/* ESP32 Device Status */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${isDeviceOnline
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
                  }`}
                  title={isDeviceOnline ? "Device Online (Sending Data)" : "Device Offline (Last seen > 15m ago)"}
                >
                  <div className={`w-2 h-2 rounded-full ${isDeviceOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                  <span className="text-xs font-medium hidden sm:inline">
                    {useMockData ? 'Demo' : isDeviceOnline ? 'Online' : 'Device Offline'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => { setShowSettings(!showSettings); loadSettings(); }}
                className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-colors"
                title="Configure Device Settings"
              >
                <Settings className="w-5 h-5" />
              </button>



              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="md:absolute right-4 top-16 z-50 p-4 bg-surface-dark/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl w-64 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-sm font-bold text-white mb-3">Device Configuration</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/60 block mb-1">Data Interval (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={dataInterval}
                  onChange={(e) => setDataInterval(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cane-green"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full bg-cane-green hover:bg-cane-green/90 text-white text-xs font-bold py-2 rounded-lg transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/10 space-y-4">
            <FieldSelector />
            <GrowthStageSelector
              selectedStage={growthStage}
              onStageChange={setGrowthStage}
            />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Demo Mode Banner */}
        {
          useMockData && (
            <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3 backdrop-blur-sm">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <RefreshCw className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-amber-400 font-medium">Demo Mode</p>
                <p className="text-xs text-white/50">Simulated data • Add Firebase credentials for live data</p>
              </div>
            </div>
          )
        }

        {/* Quick Stats Row */}
        <QuickStats currentData={currentData} growthStage={growthStage} />

        {/* Growth Stage Selector (Desktop) */}
        <div className="hidden md:block mb-6">
          <GrowthStageSelector
            selectedStage={growthStage}
            onStageChange={setGrowthStage}
          />
        </div>

        {/* Alert Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <PlantHealthCard
            temperature={currentData?.temperature}
            humidity={currentData?.humidity}
            moisture={avgMoisture}
            rainLevel={currentData?.rain_level || 0}
          />
          <StressAlertCard
            temperature={currentData?.temperature}
            humidity={currentData?.humidity}
          />
          <RainStatusIndicator
            isActive={currentData?.rain_active}
            intensity={currentData?.rain_intensity || 0}
          />
        </div>

        {/* Advanced Analytics Section */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-white/70 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-500 rounded-full" />
            Advanced Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MoistureAnalyticsCard
              moistureHistory={moistureData}
              currentMoisture={avgMoisture}
              growthStage={growthStage}
            />
            <CWSICard
              temperature={currentData?.temperature}
              humidity={currentData?.humidity}
              soilMoisture={avgMoisture}
            />
            <GDDCard
              accumulatedGDD={850}
              dailyGDD={15}
            />
            <AnomalyAlertCard
              currentData={currentData}
              historicalData={historicalData}
            />
          </div>
        </div>

        {/* Soil Moisture Profile */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-white/70 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-cane-green rounded-full" />
            Soil Moisture Levels
          </h2>
          <SoilProfileVisualization
            moisture15={currentData?.moisture_15cm}
            moisture30={currentData?.moisture_30cm}
            moisture45={currentData?.moisture_45cm}
          />
        </div>

        {/* Charts Section */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-white/70 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-soil-brown rounded-full" />
            Historical Insights
          </h2>

          {/* Temperature Chart - Full Width */}
          <div className="mb-4">
            <TemperatureChart data={temperatureData} />
          </div>

          {/* Rain & Moisture Charts - Full Width */}
          <div className="space-y-4">
            <RainBarChart data={rainData} />
            <MoistureTrendChart data={moistureData} growthStage={growthStage} />
          </div>
        </div>

        {/* Field History Section */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-white/70 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500 rounded-full" />
            Live Field History
          </h2>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 overflow-hidden">
            <FieldHistoryChart />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-cane-green" />
              <span>Sugarcane Monitoring System v2.0</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Field: {activeField?.name}</span>
              <span>Last sync: {currentData?.timestamp
                ? new Date(currentData.timestamp).toLocaleTimeString()
                : 'N/A'}
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;

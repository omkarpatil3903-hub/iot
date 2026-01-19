# Complete App.jsx Replacement Guide

## Step-by-Step Instructions

Since the file is large, here's the exact section to replace in your `src/App.jsx`:

### Find this section (around line 335):

```javascript
        {/* Quick Stats Row */}
        <QuickStats currentData={currentData} growthStage={growthStage} />
```

### Replace EVERYTHING from line 335 to the end of `</main>` with:

```javascript
        {/* Main Dashboard with Tabs */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab}>
          
          {/* ========== OVERVIEW TAB ========== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <QuickStats currentData={currentData} avgMoisture={avgMoisture} growthStage={growthStage} />
              
              <CollapsibleSection 
                title="Current Status & Alerts" 
                icon={<span className="w-1 h-4 bg-red-500 rounded-full" />} 
                defaultOpen={true} 
                badge="3 cards"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <PlantHealthCard
                    temperature={currentData?.temperature}
                    humidity={currentData?.humidity}
                    moisture={avgMoisture}
                    rainLevel={currentData?.rain_intensity || 0}
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
              </CollapsibleSection>

              <CollapsibleSection 
                title="Soil Moisture Profile" 
                icon={<span className="w-1 h-4 bg-cane-green rounded-full" />} 
                defaultOpen={true}
              >
                <SoilProfileVisualization
                  moisture15={currentData?.moisture_15cm}
                  moisture30={currentData?.moisture_30cm}
                  moisture45={currentData?.moisture_45cm}
                />
              </CollapsibleSection>
            </div>
          )}

          {/* ========== ANALYTICS TAB ========== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <CollapsibleSection 
                title="Advanced Analytics" 
                icon={<span className="w-1 h-4 bg-purple-500 rounded-full" />} 
                defaultOpen={true} 
                badge="4 metrics"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    accumulatedGDD={gddData.accumulated} 
                    dailyGDD={gddData.daily} 
                  />
                  <AnomalyAlertCard
                    currentData={currentData}
                    historicalData={historicalData}
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection 
                title="Growth Stage Management" 
                icon={<span className="w-1 h-4 bg-lime-500 rounded-full" />} 
                defaultOpen={true}
              >
                <GrowthStageSelector
                  selectedStage={growthStage}
                  onStageChange={setGrowthStage}
                  plantingDate={activeField?.plantingDate}
                />
              </CollapsibleSection>
            </div>
          )}

          {/* ========== WEATHER TAB ========== */}
          {activeTab === 'weather' && (
            <div className="space-y-6">
              <CollapsibleSection 
                title="Current Weather" 
                icon={<span className="w-1 h-4 bg-blue-500 rounded-full" />} 
                defaultOpen={true}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <WeatherCard />
                  <WeatherRecommendations currentMoisture={avgMoisture} />
                </div>
              </CollapsibleSection>

              <CollapsibleSection 
                title="7-Day Forecast" 
                icon={<span className="w-1 h-4 bg-cyan-500 rounded-full" />} 
                defaultOpen={true}
              >
                <WeatherForecast />
              </CollapsibleSection>
            </div>
          )}

          {/* ========== HISTORY TAB ========== */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <CollapsibleSection 
                title="Temperature & Humidity Trends" 
                icon={<span className="w-1 h-4 bg-orange-500 rounded-full" />} 
                defaultOpen={true}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <TemperatureChart />
                  <RainBarChart rainData={rainData} />
                </div>
              </CollapsibleSection>

              <CollapsibleSection 
                title="Moisture Analysis" 
                icon={<span className="w-1 h-4 bg-blue-500 rounded-full" />} 
                defaultOpen={true}
              >
                <MoistureTrendChart
                  moistureData={moistureData}
                  growthStage={growthStage}
                />
              </CollapsibleSection>

              <CollapsibleSection 
                title="Complete Field History" 
                icon={<span className="w-1 h-4 bg-purple-500 rounded-full" />} 
                defaultOpen={false}
              >
                <FieldHistoryChart />
              </CollapsibleSection>
            </div>
          )}

        </TabNavigation>
```

## Quick Copy-Paste Version

I'll create a file `App_TABBED.jsx` with the complete working version that you can simply rename to replace your current App.jsx.

**Steps:**
1. I'll create `App_TABBED.jsx` 
2. You backup your current `App.jsx`
3. Rename `App_TABBED.jsx` to `App.jsx`
4. Done!

Creating the file now...

import { Droplets, TrendingDown, TrendingUp, Clock, Layers } from 'lucide-react';
import { calculateDepletionRate, calculateInfiltrationSpeed, estimateIrrigationTime } from '../utils/moistureAnalytics';

const MoistureAnalyticsCard = ({ moistureHistory, currentMoisture, growthStage }) => {
    // Prepare data for analysis
    const surfaceReadings = moistureHistory?.map(d => ({
        timestamp: d.timestamp,
        moisture: d.surface
    })) || [];

    const rootZoneReadings = moistureHistory?.map(d => ({
        timestamp: d.timestamp,
        moisture: d.rootZone
    })) || [];

    // Calculate metrics
    const depletion = calculateDepletionRate(surfaceReadings);
    const infiltration = calculateInfiltrationSpeed(surfaceReadings, rootZoneReadings);
    const irrigation = estimateIrrigationTime(
        currentMoisture || 60,
        depletion.rate || 0
    );

    const trendColors = {
        depleting: { text: 'text-red-400', bg: 'bg-red-500/20', icon: TrendingDown },
        increasing: { text: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: TrendingUp },
        stable: { text: 'text-blue-400', bg: 'bg-blue-500/20', icon: Clock }
    };

    const infiltrationColors = {
        good: { text: 'text-emerald-400', bg: 'bg-emerald-500/20' },
        normal: { text: 'text-blue-400', bg: 'bg-blue-500/20' },
        poor: { text: 'text-amber-400', bg: 'bg-amber-500/20' },
        waterlogged: { text: 'text-red-400', bg: 'bg-red-500/20' }
    };

    const trendStyle = trendColors[depletion.trend] || trendColors.stable;
    const TrendIcon = trendStyle.icon;
    const infiltrationStyle = infiltrationColors[infiltration.status] || infiltrationColors.normal;

    return (
        <div className="bg-surface-card rounded-2xl p-4 border border-white/10 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cane-green/20 rounded-lg">
                    <Droplets className="w-5 h-5 text-cane-green" />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white">Moisture Analytics</h3>
                    <p className="text-xs text-white/50">Depletion & infiltration analysis</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Depletion Rate */}
                <div className={`p-3 rounded-xl ${trendStyle.bg}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <TrendIcon className={`w-4 h-4 ${trendStyle.text}`} />
                        <span className="text-xs text-white/60">Depletion Rate</span>
                    </div>
                    <p className={`text-xl font-bold ${trendStyle.text}`}>
                        {depletion.rate !== null && !isNaN(depletion.rate)
                            ? `${Math.abs(depletion.rate).toFixed(1)}%`
                            : '--'}
                        <span className="text-sm font-normal">/hr</span>
                    </p>
                    <p className="text-xs text-white/50 mt-1 capitalize">{depletion.trend}</p>
                </div>

                {/* Infiltration Speed */}
                <div className={`p-3 rounded-xl ${infiltrationStyle.bg}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <Layers className={`w-4 h-4 ${infiltrationStyle.text}`} />
                        <span className="text-xs text-white/60">Infiltration</span>
                    </div>
                    <p className={`text-xl font-bold ${infiltrationStyle.text} capitalize`}>
                        {infiltration.speed || '--'}
                    </p>
                    <p className="text-xs text-white/50 mt-1">
                        {infiltration.lagHours !== null ? `~${infiltration.lagHours}h lag` : '--'}
                    </p>
                </div>
            </div>

            {/* Irrigation Estimate */}
            <div className={`p-3 rounded-xl ${irrigation.recommended ? 'bg-amber-500/20' : 'bg-white/5'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-white/60">Next Irrigation</p>
                        <p className={`text-lg font-bold ${irrigation.recommended ? 'text-amber-400' : 'text-white'}`}>
                            {irrigation.hoursUntil === 0
                                ? 'Now Recommended'
                                : `~${irrigation.hoursUntil} hours`}
                        </p>
                    </div>
                    {depletion.hoursUntilCritical && (
                        <div className="text-right">
                            <p className="text-xs text-white/50">Critical in</p>
                            <p className="text-sm font-semibold text-red-400">
                                {depletion.hoursUntilCritical}h
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Surface vs Root Zone */}
            {infiltration.surfaceAvg && (
                <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-white/50">Surface → Root Zone</span>
                        <span className="text-white/70">
                            {infiltration.surfaceAvg}% → {infiltration.rootAvg}%
                            <span className="text-white/40 ml-1">
                                (Δ{infiltration.differential}%)
                            </span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MoistureAnalyticsCard;

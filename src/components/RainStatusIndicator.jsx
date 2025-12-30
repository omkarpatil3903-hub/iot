import { useMemo, useState } from 'react';
import { CloudRain, CloudOff, Droplet, AlertCircle, Zap, Clock } from 'lucide-react';

const RainStatusIndicator = ({ isActive, intensity = 0, lastRainTimestamp }) => {
    const intensityLevel =
        intensity > 70 ? 'heavy' :
            intensity > 40 ? 'moderate' :
                intensity > 0 ? 'light' : 'none';

    const intensityConfig = {
        heavy: { label: 'Heavy Rain', color: 'text-blue-400', bg: 'bg-blue-500/20', waterSaved: 25 },
        moderate: { label: 'Moderate Rain', color: 'text-blue-300', bg: 'bg-blue-400/20', waterSaved: 15 },
        light: { label: 'Light Rain', color: 'text-blue-200', bg: 'bg-blue-300/20', waterSaved: 8 },
        none: { label: 'No Rain', color: 'text-white/60', bg: 'bg-white/10', waterSaved: 0 }
    };

    const config = intensityConfig[intensityLevel];

    // Memoize rain drop positions to prevent re-render jitter
    const rainDrops = useMemo(() => {
        return [...Array(20)].map((_, i) => ({
            id: i,
            left: `${(i * 5) + Math.random() * 3}%`,
            height: `${20 + (i % 3) * 10}px`,
            delay: `${(i % 5) * 0.2}s`,
            duration: `${0.5 + (i % 3) * 0.2}s`
        }));
    }, []);

    // Format last rain time
    const formatLastRain = (timestamp) => {
        if (!timestamp) return null;
        const diff = Date.now() - timestamp;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return 'Just now';
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-500 h-full ${isActive
            ? 'bg-gradient-to-br from-blue-500/20 to-cyan-600/10 border-blue-500/30 shadow-lg shadow-blue-500/10'
            : 'bg-surface-card border-white/10'
            }`}>
            {/* Rain Animation Background - Memoized positions */}
            {isActive && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {rainDrops.map((drop) => (
                        <div
                            key={drop.id}
                            className="absolute w-0.5 bg-gradient-to-b from-blue-400/40 to-transparent animate-rain"
                            style={{
                                left: drop.left,
                                height: drop.height,
                                animationDelay: drop.delay,
                                animationDuration: drop.duration
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Header */}
            <div className="relative flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                        {isActive ? (
                            <CloudRain className="w-6 h-6 text-blue-400 animate-pulse" />
                        ) : (
                            <CloudOff className="w-6 h-6 text-white/40" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">Rain Sensor</h3>
                        <p className={`text-xs ${config.color}`}>{config.label}</p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`px-3 py-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-blue-500/30 text-blue-300' : 'bg-white/10 text-white/50'
                    }`}>
                    <span className="text-xs font-medium">
                        {isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                </div>
            </div>

            {/* Intensity Bar (when active) */}
            {isActive && (
                <div className="relative mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/60">Intensity</span>
                        <span className="text-xs text-blue-300 font-medium">{intensity}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-500"
                            style={{ width: `${intensity}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Drip-Skip Recommendation */}
            <div className={`relative p-3 rounded-xl transition-all duration-300 ${isActive
                ? 'bg-emerald-500/20 border border-emerald-500/30'
                : 'bg-white/5 border border-white/10'
                }`}>
                <div className="flex items-start gap-3">
                    {isActive ? (
                        <>
                            <AlertCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-emerald-400">Drip-Skip Recommended</p>
                                <p className="text-xs text-white/60 mt-1">
                                    Rain detected. Consider pausing drip irrigation to conserve water.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <Droplet className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-white/70">Normal Operation</p>
                                <p className="text-xs text-white/50 mt-1">
                                    No rain detected. Irrigation schedule active.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Water Savings & Stats */}
            {isActive && config.waterSaved > 0 && (
                <div className="relative mt-3 p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <p className="text-xs text-blue-300">
                            <span className="font-medium">Est. Water Saved:</span> ~{config.waterSaved} liters/hour
                        </p>
                    </div>
                </div>
            )}

            {/* Footer Stats */}
            <div className="relative mt-3 flex items-center justify-between text-xs text-white/40">
                <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Updated {new Date().toLocaleTimeString()}</span>
                </div>
                {!isActive && lastRainTimestamp && (
                    <span>Last rain: {formatLastRain(lastRainTimestamp)}</span>
                )}
            </div>
        </div>
    );
};

export default RainStatusIndicator;

import { Sun, Sunrise, Sunset, Moon, AlertTriangle } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';

/**
 * Light intensity thresholds for sugarcane (lux)
 * Based on agricultural research for optimal growth
 */
const LIGHT_LEVELS = {
    DARKNESS: { max: 100, label: 'Dark', icon: Moon, color: 'text-slate-400', bg: 'bg-slate-500/20' },
    LOW: { max: 10000, label: 'Low Light', icon: Sunrise, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    MODERATE: { max: 30000, label: 'Moderate', icon: Sun, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    BRIGHT: { max: 60000, label: 'Bright', icon: Sun, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    INTENSE: { max: Infinity, label: 'Intense', icon: Sun, color: 'text-orange-400', bg: 'bg-orange-500/20' }
};

/**
 * Get light level classification based on lux value
 */
const getLightLevel = (lux) => {
    if (lux === null || lux === undefined || lux < 0) return null;
    if (lux <= LIGHT_LEVELS.DARKNESS.max) return LIGHT_LEVELS.DARKNESS;
    if (lux <= LIGHT_LEVELS.LOW.max) return LIGHT_LEVELS.LOW;
    if (lux <= LIGHT_LEVELS.MODERATE.max) return LIGHT_LEVELS.MODERATE;
    if (lux <= LIGHT_LEVELS.BRIGHT.max) return LIGHT_LEVELS.BRIGHT;
    return LIGHT_LEVELS.INTENSE;
};

/**
 * Get recommendation based on light level and time
 */
const getLightRecommendation = (lux) => {
    if (lux === null || lux === undefined) return null;

    if (lux < 100) {
        return { text: 'Night time - no photosynthesis', type: 'info' };
    } else if (lux < 5000) {
        return { text: 'Low light - cloudy conditions', type: 'warning' };
    } else if (lux >= 30000 && lux < 60000) {
        return { text: 'Optimal light for photosynthesis', type: 'success' };
    } else if (lux >= 60000) {
        return { text: 'High intensity - monitor for heat stress', type: 'caution' };
    }
    return { text: 'Good growing conditions', type: 'info' };
};

/**
 * Format lux value for display
 */
const formatLux = (lux) => {
    if (lux === null || lux === undefined || lux < 0) return '--';
    if (lux >= 1000) {
        return `${(lux / 1000).toFixed(1)}k`;
    }
    return lux.toFixed(0);
};

/**
 * Calculate progress percentage for visual indicator
 * Max scale set to 100,000 lux (bright sunlight)
 */
const getLuxPercentage = (lux) => {
    if (!lux || lux < 0) return 0;
    return Math.min((lux / 100000) * 100, 100);
};

const LightSensorCard = () => {
    const { currentData, isLoading } = useFirebase();

    const lux = currentData?.light_lux;
    const lightLevel = getLightLevel(lux);
    const recommendation = getLightRecommendation(lux);
    const percentage = getLuxPercentage(lux);

    if (isLoading) {
        return (
            <div className="bg-surface-card rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                    <Sun className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-sm font-medium text-white/70">Light Intensity</h3>
                </div>
                <div className="animate-pulse">
                    <div className="h-8 bg-white/10 rounded w-24 mb-2"></div>
                    <div className="h-2 bg-white/10 rounded w-full"></div>
                </div>
            </div>
        );
    }

    const Icon = lightLevel?.icon || Sun;

    return (
        <div className="bg-surface-card rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${lightLevel?.bg || 'bg-white/10'}`}>
                        <Icon className={`w-5 h-5 ${lightLevel?.color || 'text-white/50'}`} />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white/70">Light Intensity</h3>
                        <p className={`text-xs ${lightLevel?.color || 'text-white/40'}`}>
                            {lightLevel?.label || 'No Data'}
                        </p>
                    </div>
                </div>

                {/* Lux Value */}
                <div className="text-right">
                    <p className={`text-2xl font-bold ${lightLevel?.color || 'text-white/50'}`}>
                        {formatLux(lux)}
                    </p>
                    <p className="text-xs text-white/40">lux</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${lux > 60000 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                            lux > 30000 ? 'bg-gradient-to-r from-amber-400 to-yellow-400' :
                                lux > 10000 ? 'bg-gradient-to-r from-blue-400 to-amber-400' :
                                    'bg-blue-400'
                        }`}
                    style={{ width: `${percentage}%` }}
                />

                {/* Scale markers */}
                <div className="absolute inset-0 flex justify-between px-1">
                    <div className="w-px h-full bg-white/20" style={{ marginLeft: '10%' }} title="10k lux" />
                    <div className="w-px h-full bg-white/20" style={{ marginLeft: '20%' }} title="30k lux" />
                    <div className="w-px h-full bg-white/20" style={{ marginLeft: '30%' }} title="60k lux" />
                </div>
            </div>

            {/* Scale Labels */}
            <div className="flex justify-between text-[10px] text-white/30 mb-3">
                <span>0</span>
                <span>10k</span>
                <span>30k</span>
                <span>60k</span>
                <span>100k lx</span>
            </div>

            {/* Recommendation */}
            {recommendation && (
                <div className={`flex items-center gap-2 p-2 rounded-lg ${recommendation.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                        recommendation.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                            recommendation.type === 'caution' ? 'bg-orange-500/10 text-orange-400' :
                                'bg-white/5 text-white/60'
                    }`}>
                    {recommendation.type === 'warning' || recommendation.type === 'caution' ? (
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    ) : null}
                    <p className="text-xs">{recommendation.text}</p>
                </div>
            )}
        </div>
    );
};

export default LightSensorCard;

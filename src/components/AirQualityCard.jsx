import { Wind, AlertTriangle, Leaf, Factory } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';

/**
 * Air quality thresholds for agriculture
 * Based on general air quality index standards
 */
const AIR_QUALITY_LEVELS = {
    GOOD: { max: 25, label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: Leaf },
    MODERATE: { max: 50, label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: Wind },
    POOR: { max: 75, label: 'Poor', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: Factory },
    HAZARDOUS: { max: 100, label: 'Hazardous', color: 'text-red-400', bg: 'bg-red-500/20', icon: AlertTriangle }
};

/**
 * Get air quality level based on quality index
 */
const getAirQualityLevel = (quality) => {
    if (quality === null || quality === undefined) return null;
    if (quality <= AIR_QUALITY_LEVELS.GOOD.max) return AIR_QUALITY_LEVELS.GOOD;
    if (quality <= AIR_QUALITY_LEVELS.MODERATE.max) return AIR_QUALITY_LEVELS.MODERATE;
    if (quality <= AIR_QUALITY_LEVELS.POOR.max) return AIR_QUALITY_LEVELS.POOR;
    return AIR_QUALITY_LEVELS.HAZARDOUS;
};

/**
 * Get recommendation based on air quality
 */
const getAirQualityRecommendation = (quality, status) => {
    if (quality === null || quality === undefined) return null;

    switch (status) {
        case 'Good':
            return { text: 'Excellent air quality for crops', type: 'success' };
        case 'Moderate':
            return { text: 'Acceptable conditions, monitor trends', type: 'info' };
        case 'Poor':
            return { text: 'Poor air quality - may affect plant health', type: 'warning' };
        case 'Hazardous':
            return { text: 'Hazardous! Check for pollution sources', type: 'danger' };
        default:
            return { text: 'Monitoring air quality...', type: 'info' };
    }
};

const AirQualityCard = () => {
    const { currentData, isLoading } = useFirebase();

    const airQuality = currentData?.air_quality;
    const airQualityRaw = currentData?.air_quality_raw;
    const airQualityStatus = currentData?.air_quality_status;

    const level = getAirQualityLevel(airQuality);
    const recommendation = getAirQualityRecommendation(airQuality, airQualityStatus);

    if (isLoading) {
        return (
            <div className="bg-surface-card rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                    <Wind className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm font-medium text-white/70">Air Quality</h3>
                </div>
                <div className="animate-pulse">
                    <div className="h-8 bg-white/10 rounded w-24 mb-2"></div>
                    <div className="h-2 bg-white/10 rounded w-full"></div>
                </div>
            </div>
        );
    }

    const Icon = level?.icon || Wind;

    return (
        <div className="bg-surface-card rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${level?.bg || 'bg-white/10'}`}>
                        <Icon className={`w-5 h-5 ${level?.color || 'text-white/50'}`} />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white/70">Air Quality</h3>
                        <p className={`text-xs ${level?.color || 'text-white/40'}`}>
                            {airQualityStatus || 'No Data'}
                        </p>
                    </div>
                </div>

                {/* Quality Value */}
                <div className="text-right">
                    <p className={`text-2xl font-bold ${level?.color || 'text-white/50'}`}>
                        {airQuality !== undefined && airQuality !== null ? `${airQuality}%` : '--'}
                    </p>
                    <p className="text-xs text-white/40">AQI</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${airQuality > 75 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                            airQuality > 50 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                airQuality > 25 ? 'bg-gradient-to-r from-emerald-400 to-yellow-400' :
                                    'bg-emerald-400'
                        }`}
                    style={{ width: `${airQuality || 0}%` }}
                />

                {/* Threshold markers */}
                <div className="absolute inset-0 flex">
                    <div className="w-1/4 border-r border-white/20" />
                    <div className="w-1/4 border-r border-white/20" />
                    <div className="w-1/4 border-r border-white/20" />
                    <div className="w-1/4" />
                </div>
            </div>

            {/* Scale Labels */}
            <div className="flex justify-between text-[10px] text-white/30 mb-3">
                <span>Good</span>
                <span>Moderate</span>
                <span>Poor</span>
                <span>Hazardous</span>
            </div>

            {/* Raw Value */}
            {airQualityRaw !== undefined && (
                <div className="flex items-center justify-between text-xs text-white/40 mb-3 px-1">
                    <span>Sensor Raw Value:</span>
                    <span className="font-mono">{airQualityRaw}</span>
                </div>
            )}

            {/* Recommendation */}
            {recommendation && (
                <div className={`flex items-center gap-2 p-2 rounded-lg ${recommendation.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                        recommendation.type === 'warning' ? 'bg-orange-500/10 text-orange-400' :
                            recommendation.type === 'danger' ? 'bg-red-500/10 text-red-400' :
                                'bg-white/5 text-white/60'
                    }`}>
                    {(recommendation.type === 'warning' || recommendation.type === 'danger') && (
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    )}
                    {recommendation.type === 'success' && (
                        <Leaf className="w-3 h-3 flex-shrink-0" />
                    )}
                    <p className="text-xs">{recommendation.text}</p>
                </div>
            )}
        </div>
    );
};

export default AirQualityCard;

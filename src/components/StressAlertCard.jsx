import { Thermometer, Droplets, AlertTriangle, Wind, Gauge } from 'lucide-react';
import { calculateTHI, getStressLevel, THI_ALERT_THRESHOLD } from '../utils/thiCalculator';

/**
 * Calculate dew point temperature
 * Using Magnus formula approximation
 */
const calculateDewPoint = (temp, humidity) => {
    if (temp == null || humidity == null) return null;
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
};

/**
 * Calculate "feels like" temperature (heat index approximation)
 */
const calculateFeelsLike = (temp, humidity) => {
    if (temp == null || humidity == null) return null;
    // Simple heat index formula for temps above 27°C
    if (temp >= 27) {
        return temp + 0.33 * (humidity / 100 * 6.105 * Math.exp(17.27 * temp / (237.7 + temp))) - 4;
    }
    return temp;
};

const StressAlertCard = ({ temperature, humidity }) => {
    const thi = calculateTHI(temperature, humidity);
    const stressLevel = getStressLevel(thi);
    const isAlert = stressLevel.isAlert;
    const dewPoint = calculateDewPoint(temperature, humidity);
    const feelsLike = calculateFeelsLike(temperature, humidity);

    // Calculate THI percentage for progress bar (scale 60-90 to 0-100)
    const thiPercent = thi !== null ? Math.min(100, Math.max(0, ((thi - 60) / 30) * 100)) : 0;

    const colorClasses = {
        success: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
        info: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
        warning: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
        danger: 'from-red-500/20 to-red-600/10 border-red-500/30',
        gray: 'from-gray-500/20 to-gray-600/10 border-gray-500/30'
    };

    const textColors = {
        success: 'text-emerald-400',
        info: 'text-blue-400',
        warning: 'text-amber-400',
        danger: 'text-red-400',
        gray: 'text-gray-400'
    };

    const bgColors = {
        success: 'bg-emerald-500/20',
        info: 'bg-blue-500/20',
        warning: 'bg-amber-500/20',
        danger: 'bg-red-500/20',
        gray: 'bg-gray-500/20'
    };

    const progressColors = {
        success: 'from-emerald-400 to-emerald-500',
        info: 'from-blue-400 to-blue-500',
        warning: 'from-amber-400 to-amber-500',
        danger: 'from-red-400 to-red-500',
        gray: 'from-gray-400 to-gray-500'
    };

    return (
        <div
            className={`relative overflow-hidden rounded-2xl border p-4 bg-gradient-to-br transition-all duration-500 h-full ${colorClasses[stressLevel.color]} ${isAlert ? 'animate-pulse-glow' : ''
                }`}
        >
            {/* Alert Animation Overlay */}
            {isAlert && (
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-red-500/10 to-red-500/5 animate-pulse" />
            )}

            {/* Header */}
            <div className="relative flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${bgColors[stressLevel.color]} transition-all duration-300`}>
                        {isAlert ? (
                            <AlertTriangle className={`w-5 h-5 ${textColors[stressLevel.color]} animate-bounce`} />
                        ) : (
                            <Gauge className={`w-5 h-5 ${textColors[stressLevel.color]}`} />
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white/70">Heat Stress Index</h3>
                        <p className={`text-xs font-medium ${textColors[stressLevel.color]}`}>{stressLevel.label}</p>
                    </div>
                </div>

                {/* THI Value */}
                <div className="text-right">
                    <div className={`text-3xl font-bold ${textColors[stressLevel.color]} transition-colors duration-300`}>
                        {thi !== null ? thi.toFixed(1) : '--'}
                    </div>
                    <p className="text-xs text-white/50">THI</p>
                </div>
            </div>

            {/* THI Progress Bar */}
            <div className="relative mb-4">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-white/50">Stress Level</span>
                    <span className={`text-xs font-medium ${textColors[stressLevel.color]}`}>
                        {thiPercent.toFixed(0)}%
                    </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r ${progressColors[stressLevel.color]} rounded-full transition-all duration-700 ease-out`}
                        style={{ width: `${thiPercent}%` }}
                    />
                </div>
                {/* Threshold marker */}
                <div
                    className="absolute bottom-0 w-0.5 h-2 bg-white/60"
                    style={{ left: `${((THI_ALERT_THRESHOLD - 60) / 30) * 100}%` }}
                    title={`Alert threshold: ${THI_ALERT_THRESHOLD}`}
                />
            </div>

            {/* Sensor Readings Grid */}
            <div className="relative grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <Thermometer className="w-4 h-4 text-orange-400" />
                    <div>
                        <p className="text-base font-semibold text-white">
                            {temperature !== null ? `${temperature.toFixed(1)}°C` : '--'}
                        </p>
                        <p className="text-[10px] text-white/50">Temperature</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <div>
                        <p className="text-base font-semibold text-white">
                            {humidity !== null ? `${humidity.toFixed(0)}%` : '--'}
                        </p>
                        <p className="text-[10px] text-white/50">Humidity</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <Wind className="w-4 h-4 text-cyan-400" />
                    <div>
                        <p className="text-base font-semibold text-white">
                            {dewPoint !== null ? `${dewPoint.toFixed(1)}°C` : '--'}
                        </p>
                        <p className="text-[10px] text-white/50">Dew Point</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <Thermometer className="w-4 h-4 text-red-400" />
                    <div>
                        <p className="text-base font-semibold text-white">
                            {feelsLike !== null ? `${feelsLike.toFixed(1)}°C` : '--'}
                        </p>
                        <p className="text-[10px] text-white/50">Feels Like</p>
                    </div>
                </div>
            </div>

            {/* Alert Message */}
            <div className={`relative mt-3 p-2.5 rounded-xl ${bgColors[stressLevel.color]} transition-all duration-300`}>
                <p className={`text-sm font-medium ${textColors[stressLevel.color]}`}>
                    {stressLevel.message}
                </p>
                {isAlert && (
                    <p className="text-xs text-white/60 mt-1">
                        THI exceeds threshold of {THI_ALERT_THRESHOLD} — High evapotranspiration risk
                    </p>
                )}
            </div>
        </div>
    );
};

export default StressAlertCard;

import { Leaf, Droplets, Sun, ThermometerSun, Wind } from 'lucide-react';

const PlantHealthCard = ({ temperature, humidity, moisture, rainLevel }) => {
    // Calculate overall plant health score (0-100)
    const calculateHealth = () => {
        if (temperature == null || humidity == null || moisture == null) return null;

        let score = 100;

        // Temperature penalties (ideal: 25-35°C for sugarcane)
        if (temperature < 20) score -= (20 - temperature) * 3;
        if (temperature > 38) score -= (temperature - 38) * 5;

        // Humidity penalties (ideal: 60-80%)
        if (humidity < 50) score -= (50 - humidity) * 0.5;
        if (humidity > 90) score -= (humidity - 90) * 0.5;

        // Moisture penalties (ideal: 50-70%)
        if (moisture < 40) score -= (40 - moisture) * 1.5;
        if (moisture > 85) score -= (moisture - 85) * 0.5;

        return Math.max(0, Math.min(100, Math.round(score)));
    };

    const health = calculateHealth();

    const getHealthStatus = () => {
        if (health == null) return { text: 'Analyzing...', color: 'text-gray-400', bg: 'bg-gray-500/20' };
        if (health >= 80) return { text: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/20', emoji: '🌟' };
        if (health >= 60) return { text: 'Good', color: 'text-green-400', bg: 'bg-green-500/20', emoji: '✨' };
        if (health >= 40) return { text: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-500/20', emoji: '⚠️' };
        return { text: 'Needs Attention', color: 'text-red-400', bg: 'bg-red-500/20', emoji: '🚨' };
    };

    const status = getHealthStatus();

    // Sugarcane growth stages visualization
    const getPlantHeight = () => {
        if (health == null) return 40;
        return 30 + (health * 0.5);
    };

    return (
        <div className="bg-surface-card rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-cane-green/5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 ${status.bg} rounded-lg`}>
                        <Leaf className={`w-5 h-5 ${status.color}`} />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">Plant Health</h3>
                        <p className="text-xs text-white/50">Real-time condition score</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className={`text-2xl font-bold ${status.color}`}>
                        {health != null ? `${health}%` : '--'}
                    </p>
                    <p className={`text-xs font-medium ${status.color}`}>{status.emoji} {status.text}</p>
                </div>
            </div>

            {/* Animated Plant Visual */}
            <div className="relative h-32 bg-gradient-to-b from-sky-900/20 via-transparent to-amber-900/30 rounded-xl overflow-hidden mb-4">
                {/* Sky with sun */}
                <div className="absolute top-2 right-3">
                    <Sun className={`w-6 h-6 ${temperature > 35 ? 'text-orange-400' : 'text-yellow-300'} animate-pulse`} />
                </div>

                {/* Rain drops if raining */}
                {rainLevel > 20 && (
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(Math.min(rainLevel / 5, 15))].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-0.5 h-3 bg-blue-400/40 rounded-full animate-bounce"
                                style={{
                                    left: `${10 + (i * 7)}%`,
                                    top: `${-10 + (i * 5) % 30}%`,
                                    animationDelay: `${i * 0.1}s`,
                                    animationDuration: '0.8s'
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Ground */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-amber-900/60 to-amber-800/30" />

                {/* Sugarcane Plant - Animated based on health */}
                <div
                    className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center transition-all duration-1000"
                    style={{ height: `${getPlantHeight()}%` }}
                >
                    {/* Leaves */}
                    <div className="relative">
                        <div className={`absolute -left-6 -top-2 w-8 h-1 ${health >= 60 ? 'bg-green-500' : 'bg-yellow-600'} rounded-full transform -rotate-45 origin-right`} />
                        <div className={`absolute -right-6 -top-2 w-8 h-1 ${health >= 60 ? 'bg-green-500' : 'bg-yellow-600'} rounded-full transform rotate-45 origin-left`} />
                        <div className={`absolute -left-5 top-2 w-6 h-1 ${health >= 60 ? 'bg-green-400' : 'bg-yellow-500'} rounded-full transform -rotate-30 origin-right`} />
                        <div className={`absolute -right-5 top-2 w-6 h-1 ${health >= 60 ? 'bg-green-400' : 'bg-yellow-500'} rounded-full transform rotate-30 origin-left`} />
                    </div>
                    {/* Stalk */}
                    <div className={`w-2 flex-1 ${health >= 60 ? 'bg-gradient-to-b from-green-500 to-green-700' : 'bg-gradient-to-b from-yellow-500 to-yellow-700'} rounded-full`} />
                </div>

                {/* Moisture indicator in soil */}
                <div
                    className="absolute bottom-0 left-0 h-3 bg-blue-500/30 transition-all duration-500"
                    style={{ width: `${moisture || 0}%` }}
                />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 bg-white/5 rounded-lg">
                    <ThermometerSun className="w-4 h-4 mx-auto text-orange-400 mb-1" />
                    <p className="text-xs text-white/50">Temp</p>
                    <p className="text-sm font-semibold text-white">{temperature?.toFixed(1) ?? '--'}°</p>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg">
                    <Wind className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                    <p className="text-xs text-white/50">Humidity</p>
                    <p className="text-sm font-semibold text-white">{humidity?.toFixed(0) ?? '--'}%</p>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg">
                    <Droplets className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                    <p className="text-xs text-white/50">Moisture</p>
                    <p className="text-sm font-semibold text-white">{moisture?.toFixed(0) ?? '--'}%</p>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg">
                    <span className="text-sm">🌧️</span>
                    <p className="text-xs text-white/50">Rain</p>
                    <p className="text-sm font-semibold text-white">{rainLevel ?? 0}%</p>
                </div>
            </div>
        </div>
    );
};

export default PlantHealthCard;

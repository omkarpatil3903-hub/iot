import { Droplets } from 'lucide-react';

const SoilProfileVisualization = ({ moisture15, moisture30, moisture45 }) => {
    // Get color based on moisture level
    const getMoistureColor = (value) => {
        if (value == null) return 'bg-gray-600';
        if (value >= 70) return 'bg-blue-500'; // Wet
        if (value >= 50) return 'bg-emerald-500'; // Optimal
        if (value >= 30) return 'bg-yellow-500'; // Moderate
        return 'bg-orange-500'; // Dry
    };

    const getMoistureGradient = (value) => {
        if (value == null) return 'from-gray-700 to-gray-800';
        if (value >= 70) return 'from-blue-600 to-blue-800';
        if (value >= 50) return 'from-emerald-600 to-emerald-800';
        if (value >= 30) return 'from-yellow-600 to-yellow-700';
        return 'from-orange-600 to-orange-800';
    };

    const getStatusText = (value) => {
        if (value == null) return 'No Data';
        if (value >= 70) return 'Wet';
        if (value >= 50) return 'Optimal';
        if (value >= 30) return 'Moderate';
        return 'Dry';
    };

    const layers = [
        { depth: '15cm', label: 'Surface', value: moisture15, icon: '🌱' },
        { depth: '30cm', label: 'Mid Zone', value: moisture30, icon: '🌿' },
        { depth: '45cm', label: 'Root Zone', value: moisture45, icon: '🌳' }
    ];

    return (
        <div className="bg-surface-card rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-colors">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cane-green/20 rounded-lg">
                    <Droplets className="w-5 h-5 text-cane-green" />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white">Soil Moisture Profile</h3>
                    <p className="text-xs text-white/50">Cross-section view by depth</p>
                </div>
            </div>

            {/* Soil Profile Visualization */}
            <div className="relative flex">
                {/* Depth Scale */}
                <div className="flex flex-col justify-between pr-3 text-right">
                    <span className="text-xs text-white/40">0cm</span>
                    <span className="text-xs text-white/40">15cm</span>
                    <span className="text-xs text-white/40">30cm</span>
                    <span className="text-xs text-white/40">45cm</span>
                </div>

                {/* Soil Layers */}
                <div className="flex-1 rounded-xl overflow-hidden border border-white/10">
                    {/* Top soil indicator */}
                    <div className="h-3 bg-gradient-to-b from-amber-900/50 to-amber-950/30 flex items-center justify-center">
                        <span className="text-[8px] text-amber-400/60">SURFACE</span>
                    </div>

                    {layers.map((layer, index) => (
                        <div
                            key={layer.depth}
                            className={`relative h-20 bg-gradient-to-b ${getMoistureGradient(layer.value)} flex items-center justify-between px-4 border-t border-white/5 overflow-hidden`}
                        >
                            {/* Animated water droplets */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                {[...Array(Math.floor((layer.value || 0) / 8))].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-1 h-2 bg-white/20 rounded-full animate-pulse"
                                        style={{
                                            left: `${5 + (i * 8) % 90}%`,
                                            top: `${10 + (i * 13) % 70}%`,
                                            animationDelay: `${i * 0.15}s`,
                                            animationDuration: `${1.5 + (i % 3) * 0.5}s`
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Layer Info */}
                            <div className="flex items-center gap-2 z-10">
                                <span className="text-lg">{layer.icon}</span>
                                <div>
                                    <p className="text-sm font-medium text-white">{layer.label}</p>
                                    <p className="text-xs text-white/60">{layer.depth} depth</p>
                                </div>
                            </div>

                            {/* Moisture Value */}
                            <div className="text-right z-10">
                                <p className="text-2xl font-bold text-white">
                                    {layer.value != null ? `${layer.value}%` : '--'}
                                </p>
                                <p className={`text-xs font-medium ${layer.value >= 50 ? 'text-emerald-300' : 'text-amber-300'}`}>
                                    {getStatusText(layer.value)}
                                </p>
                            </div>

                            {/* Progress bar at bottom of layer */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                                <div
                                    className={`h-full ${getMoistureColor(layer.value)} transition-all duration-500`}
                                    style={{ width: `${layer.value || 0}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right side - Status Legend */}
                <div className="flex flex-col justify-center gap-2 pl-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] text-white/50">Wet</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] text-white/50">Optimal</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <span className="text-[10px] text-white/50">Moderate</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <span className="text-[10px] text-white/50">Dry</span>
                    </div>
                </div>
            </div>

            {/* Insight */}
            <div className="mt-4 p-2.5 bg-cane-green/10 rounded-xl border border-cane-green/20">
                <p className="text-xs text-cane-green-light">
                    <span className="font-medium">💧 Insight:</span>{' '}
                    {moisture15 != null && moisture45 != null
                        ? moisture15 > moisture45
                            ? 'Surface is wetter than root zone — evaporation expected'
                            : 'Root zone retaining moisture — good water penetration'
                        : 'Monitoring soil moisture at multiple depths'
                    }
                </p>
            </div>
        </div>
    );
};

export default SoilProfileVisualization;

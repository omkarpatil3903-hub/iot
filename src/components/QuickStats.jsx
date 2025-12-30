import { Droplets, Thermometer, CloudRain, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { calculateTHI, getStressLevel } from '../utils/thiCalculator';
import { getMoistureStatus } from '../config/agronomyConfig';

const QuickStats = ({ currentData, growthStage }) => {
    const thi = calculateTHI(currentData?.temperature, currentData?.humidity);
    const stressLevel = getStressLevel(thi);

    // Calculate average moisture
    const avgMoisture = currentData
        ? ((currentData.moisture_15cm || 0) + (currentData.moisture_30cm || 0) + (currentData.moisture_45cm || 0)) / 3
        : null;

    const moistureStatus = getMoistureStatus(avgMoisture, growthStage);

    const stats = [
        {
            icon: Droplets,
            label: 'Avg Moisture',
            value: avgMoisture !== null ? `${avgMoisture.toFixed(0)}%` : '--',
            status: moistureStatus.status,
            color: moistureStatus.status === 'optimal' ? 'text-emerald-400' : moistureStatus.status === 'low' ? 'text-red-400' : 'text-amber-400',
            bg: moistureStatus.status === 'optimal' ? 'bg-emerald-500/20' : moistureStatus.status === 'low' ? 'bg-red-500/20' : 'bg-amber-500/20'
        },
        {
            icon: Thermometer,
            label: 'Temperature',
            value: currentData?.temperature !== null ? `${currentData?.temperature?.toFixed(1)}°C` : '--',
            color: 'text-orange-400',
            bg: 'bg-orange-500/20'
        },
        {
            icon: stressLevel.isAlert ? TrendingUp : Minus,
            label: 'THI Stress',
            value: thi !== null ? thi.toFixed(1) : '--',
            status: stressLevel.level,
            color: stressLevel.isAlert ? 'text-red-400' : 'text-emerald-400',
            bg: stressLevel.isAlert ? 'bg-red-500/20' : 'bg-emerald-500/20'
        },
        {
            icon: CloudRain,
            label: 'Rain',
            value: currentData?.rain_active ? 'Active' : 'None',
            color: currentData?.rain_active ? 'text-blue-400' : 'text-white/50',
            bg: currentData?.rain_active ? 'bg-blue-500/20' : 'bg-white/5'
        }
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-surface-card hover:bg-surface-elevated/50 transition-colors`}
                    >
                        <div className={`p-2 rounded-lg ${stat.bg}`}>
                            <Icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <div className="min-w-0">
                            <p className={`text-lg font-bold ${stat.color} truncate`}>{stat.value}</p>
                            <p className="text-xs text-white/50 truncate">{stat.label}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default QuickStats;

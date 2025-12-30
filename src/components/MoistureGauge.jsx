import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Droplets } from 'lucide-react';
import { getMoistureStatus, GROWTH_STAGES } from '../config/agronomyConfig';

const MoistureGauge = ({
    value,
    depth,
    label,
    description,
    growthStage = 'GERMINATION',
    previousValue
}) => {
    // Generate unique ID for this gauge instance
    const gaugeId = useMemo(() => `gauge-${depth}-${Math.random().toString(36).substr(2, 9)}`, [depth]);

    // Handle null/undefined values
    const displayValue = value ?? 0;
    const hasData = value !== null && value !== undefined;

    const status = getMoistureStatus(displayValue, growthStage);
    const thresholds = GROWTH_STAGES[growthStage]?.moisture || GROWTH_STAGES.GERMINATION.moisture;

    // Calculate rotation for gauge needle (0-100% maps to -135 to 135 degrees)
    const rotation = hasData ? ((displayValue / 100) * 270) - 135 : -135;

    // Calculate trend
    const trend = previousValue !== undefined && hasData
        ? displayValue > previousValue ? 'up' : displayValue < previousValue ? 'down' : 'stable'
        : 'stable';

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

    // Status colors
    const statusColors = {
        low: {
            bg: 'bg-red-500/20',
            text: 'text-red-400',
            ring: 'ring-red-500/50',
            gradient: 'from-red-500 to-red-600',
            glow: 'shadow-red-500/20'
        },
        optimal: {
            bg: 'bg-emerald-500/20',
            text: 'text-emerald-400',
            ring: 'ring-emerald-500/50',
            gradient: 'from-emerald-500 to-emerald-600',
            glow: 'shadow-emerald-500/30'
        },
        high: {
            bg: 'bg-amber-500/20',
            text: 'text-amber-400',
            ring: 'ring-amber-500/50',
            gradient: 'from-amber-500 to-amber-600',
            glow: 'shadow-amber-500/20'
        }
    };

    const colors = statusColors[status.status] || statusColors.optimal;

    // Calculate dynamic zone positions based on thresholds
    const minAngle = (thresholds.min / 100) * 270 - 135;
    const maxAngle = (thresholds.max / 100) * 270 - 135;

    return (
        <div className={`bg-surface-card rounded-2xl p-4 border border-white/10 transition-all duration-500 ${status.status === 'optimal' && hasData ? 'shadow-lg ' + colors.glow : ''
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${colors.bg}`}>
                        <Droplets className={`w-4 h-4 ${colors.text}`} />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">{label}</h3>
                        <p className="text-xs text-white/50">{description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5">
                    <span className="text-xs text-white/70">{depth}cm</span>
                </div>
            </div>

            {/* Gauge */}
            <div className="relative flex justify-center items-center py-4">
                {/* Gauge Background SVG */}
                <svg viewBox="0 0 200 120" className="w-full max-w-[180px]">
                    {/* Background Arc */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />

                    {/* Low Zone (Red) - 0 to min threshold */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 50 40"
                        fill="none"
                        stroke="rgba(239,68,68,0.3)"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />

                    {/* Optimal Zone (Green) - min to max threshold */}
                    <path
                        d="M 60 32 A 80 80 0 0 1 140 32"
                        fill="none"
                        stroke="rgba(16,185,129,0.3)"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />

                    {/* High Zone (Amber) - max to 100% */}
                    <path
                        d="M 150 40 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="rgba(245,158,11,0.3)"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />

                    {/* Active Arc - unique gradient ID */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke={`url(#${gaugeId})`}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={hasData ? `${(displayValue / 100) * 251.2} 251.2` : '0 251.2'}
                        className="transition-all duration-700 ease-out"
                    />

                    {/* Unique Gradient Definition */}
                    <defs>
                        <linearGradient id={gaugeId} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#DC2626" />
                            <stop offset={`${thresholds.min}%`} stopColor="#F59E0B" />
                            <stop offset={`${(thresholds.min + thresholds.max) / 2}%`} stopColor="#10B981" />
                            <stop offset={`${thresholds.max}%`} stopColor="#F59E0B" />
                            <stop offset="100%" stopColor="#F59E0B" />
                        </linearGradient>
                    </defs>

                    {/* Needle */}
                    <g transform={`rotate(${rotation}, 100, 100)`} className="transition-transform duration-700 ease-out">
                        <line
                            x1="100"
                            y1="100"
                            x2="100"
                            y2="35"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            className="drop-shadow-lg"
                        />
                        <circle cx="100" cy="100" r="8" fill="white" className="drop-shadow-md" />
                        <circle cx="100" cy="100" r="4" fill="#1A1A1A" />
                    </g>

                    {/* Min/Max Labels */}
                    <text x="20" y="115" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="start">0%</text>
                    <text x="180" y="115" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="end">100%</text>
                </svg>

                {/* Value Display */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                    <div className={`text-3xl font-bold transition-colors duration-300 ${hasData ? colors.text : 'text-white/30'}`}>
                        {hasData ? displayValue.toFixed(0) : '--'}
                        <span className="text-lg">%</span>
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between mt-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${colors.bg}`}>
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors.gradient} ${status.status === 'optimal' ? 'animate-pulse' : ''
                        }`} />
                    <span className={`text-xs font-medium ${colors.text}`}>{status.label}</span>
                </div>

                <div className={`flex items-center gap-1 transition-colors duration-300 ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-white/50'
                    }`}>
                    <TrendIcon className="w-4 h-4" />
                    <span className="text-xs">
                        {trend === 'up' ? 'Rising' : trend === 'down' ? 'Falling' : 'Stable'}
                    </span>
                </div>
            </div>

            {/* Thresholds */}
            <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">Target Range</span>
                    <span className="text-cane-green font-medium">
                        {thresholds.min}% - {thresholds.max}%
                    </span>
                </div>
                <p className="text-xs text-white/40 mt-1">{status.message}</p>
            </div>
        </div>
    );
};

export default MoistureGauge;

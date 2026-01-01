import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart, ReferenceArea } from 'recharts';
import { Layers, TrendingUp, TrendingDown } from 'lucide-react';
import { GROWTH_STAGES } from '../../config/agronomyConfig';

const MoistureTrendChart = ({ data = [], growthStage = 'GERMINATION' }) => {
    const thresholds = GROWTH_STAGES[growthStage]?.moisture || GROWTH_STAGES.GERMINATION.moisture;

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            // Filter out entries without valid values (like Area fills)
            const validEntries = payload.filter(entry =>
                entry.value !== undefined && entry.value !== null && entry.name
            );

            if (validEntries.length === 0) return null;

            return (
                <div className="bg-surface-elevated border border-white/20 rounded-lg p-3 shadow-xl backdrop-blur-sm">
                    <p className="text-white font-medium text-sm mb-2">{label}</p>
                    <div className="space-y-1.5">
                        {validEntries.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-xs text-white/70">{entry.name}:</span>
                                <span className="text-xs font-semibold" style={{ color: entry.color }}>
                                    {entry.value}%
                                </span>
                            </div>
                        ))}
                    </div>
                    {/* Status indicator */}
                    {validEntries[0] && (
                        <div className="mt-2 pt-2 border-t border-white/10">
                            <span className={`text-xs ${validEntries[0].value >= thresholds.min && validEntries[0].value <= thresholds.max
                                ? 'text-emerald-400'
                                : 'text-amber-400'
                                }`}>
                                {validEntries[0].value >= thresholds.min && validEntries[0].value <= thresholds.max
                                    ? '✓ Within target range'
                                    : '⚠ Outside target range'}
                            </span>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    // Calculate statistics
    const hasData = data.length > 0;
    const avgSurface = hasData
        ? (data.reduce((sum, d) => sum + (d.surface || 0), 0) / data.length).toFixed(1)
        : '--';
    const avgRootZone = hasData
        ? (data.reduce((sum, d) => sum + (d.rootZone || 0), 0) / data.length).toFixed(1)
        : '--';

    // Calculate trends
    const getTrend = (key) => {
        if (data.length < 2) return 'stable';
        const first = data.slice(0, Math.ceil(data.length / 2));
        const second = data.slice(Math.ceil(data.length / 2));
        const firstAvg = first.reduce((s, d) => s + (d[key] || 0), 0) / first.length;
        const secondAvg = second.reduce((s, d) => s + (d[key] || 0), 0) / second.length;
        if (secondAvg > firstAvg + 2) return 'up';
        if (secondAvg < firstAvg - 2) return 'down';
        return 'stable';
    };

    const surfaceTrend = getTrend('surface');
    const rootTrend = getTrend('rootZone');

    // Check if averages are in optimal range
    const surfaceOptimal = hasData && parseFloat(avgSurface) >= thresholds.min && parseFloat(avgSurface) <= thresholds.max;
    const rootOptimal = hasData && parseFloat(avgRootZone) >= thresholds.min && parseFloat(avgRootZone) <= thresholds.max;

    return (
        <div className="bg-surface-card rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cane-green/20 rounded-lg">
                        <Layers className="w-5 h-5 text-cane-green" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">Moisture Trend</h3>
                        <p className="text-xs text-white/50">Surface vs Root Zone • {data.length} readings</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                            <p className={`text-sm font-bold ${surfaceOptimal ? 'text-cane-green-light' : 'text-amber-400'}`}>
                                {avgSurface}%
                            </p>
                            {surfaceTrend !== 'stable' && (
                                surfaceTrend === 'up'
                                    ? <TrendingUp className="w-3 h-3 text-emerald-400" />
                                    : <TrendingDown className="w-3 h-3 text-red-400" />
                            )}
                        </div>
                        <p className="text-xs text-white/50">Avg Surface</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                            <p className={`text-sm font-bold ${rootOptimal ? 'text-cane-green' : 'text-amber-400'}`}>
                                {avgRootZone}%
                            </p>
                            {rootTrend !== 'stable' && (
                                rootTrend === 'up'
                                    ? <TrendingUp className="w-3 h-3 text-emerald-400" />
                                    : <TrendingDown className="w-3 h-3 text-red-400" />
                            )}
                        </div>
                        <p className="text-xs text-white/50">Avg Root</p>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="surfaceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4A8B42" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#4A8B42" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="rootGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2D5A27" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#2D5A27" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />

                        <XAxis
                            dataKey="timestamp"
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            tickLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            domain={[30, 100]}
                            tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `${value}%`}
                            width={50}
                        />

                        {/* Optimal zone shaded area */}
                        <ReferenceArea
                            y1={thresholds.min}
                            y2={thresholds.max}
                            fill="rgba(16,185,129,0.08)"
                            fillOpacity={1}
                        />

                        {/* Threshold lines */}
                        <ReferenceLine
                            y={thresholds.min}
                            stroke="rgba(16,185,129,0.4)"
                            strokeDasharray="5 5"
                            label={{
                                value: `${thresholds.min}%`,
                                fill: 'rgba(16,185,129,0.6)',
                                fontSize: 9,
                                position: 'left'
                            }}
                        />
                        <ReferenceLine
                            y={thresholds.max}
                            stroke="rgba(16,185,129,0.4)"
                            strokeDasharray="5 5"
                            label={{
                                value: `${thresholds.max}%`,
                                fill: 'rgba(16,185,129,0.6)',
                                fontSize: 9,
                                position: 'left'
                            }}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        {/* Area fills */}
                        <Area
                            type="monotone"
                            dataKey="surface"
                            stroke="transparent"
                            fill="url(#surfaceGradient)"
                        />
                        <Area
                            type="monotone"
                            dataKey="rootZone"
                            stroke="transparent"
                            fill="url(#rootGradient)"
                        />

                        {/* Lines */}
                        <Line
                            type="monotone"
                            dataKey="surface"
                            name="Surface (15cm)"
                            stroke="#4A8B42"
                            strokeWidth={2}
                            dot={{ fill: '#4A8B42', strokeWidth: 0, r: 2 }}
                            activeDot={{ r: 5, fill: '#4A8B42', stroke: '#fff', strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="rootZone"
                            name="Root Zone (45cm)"
                            stroke="#2D5A27"
                            strokeWidth={2}
                            dot={{ fill: '#2D5A27', strokeWidth: 0, r: 2 }}
                            activeDot={{ r: 5, fill: '#2D5A27', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-3 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-1 rounded-full bg-cane-green-light" />
                    <span className="text-xs text-white/60">Surface</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-1 rounded-full bg-cane-green" />
                    <span className="text-xs text-white/60">Root Zone</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-2 bg-emerald-500/20 rounded-sm" />
                    <span className="text-xs text-white/60">Target Zone</span>
                </div>
            </div>

            {/* Insight */}
            <div className="mt-3 p-2.5 bg-cane-green/10 rounded-xl border border-cane-green/20">
                <p className="text-xs text-cane-green-light">
                    <span className="font-medium">💧 Insight:</span>{' '}
                    {hasData
                        ? parseFloat(avgSurface) > parseFloat(avgRootZone)
                            ? 'Surface moisture higher than root zone — normal evaporation pattern'
                            : 'Root zone retaining more moisture — good water penetration'
                        : 'Monitoring water movement through soil layers'
                    }
                </p>
            </div>
        </div>
    );
};

export default MoistureTrendChart;

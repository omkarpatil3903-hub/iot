import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CloudRain, CloudOff } from 'lucide-react';

const RainBarChart = ({ data = [] }) => {
    // Intensity color mapping
    const getBarColor = (intensity) => {
        switch (intensity) {
            case 'heavy': return '#3B82F6';
            case 'moderate': return '#60A5FA';
            case 'light': return '#93C5FD';
            default: return 'rgba(255,255,255,0.15)';
        }
    };

    // Format date for display
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            return (
                <div className="bg-surface-elevated border border-white/20 rounded-lg p-3 shadow-xl backdrop-blur-sm">
                    <p className="text-white font-medium text-sm">
                        {new Date(label).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </p>
                    <div className="mt-2 space-y-1">
                        <p className="text-blue-400 text-sm">
                            Duration: <span className="font-semibold">{dataPoint.duration}h</span>
                        </p>
                        <p className="text-white/60 text-xs capitalize">
                            Intensity: {dataPoint.intensity || 'none'}
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Calculate statistics
    const totalRainHours = data.reduce((sum, d) => sum + (d.duration || 0), 0);
    const rainyDays = data.filter(d => d.duration > 0).length;
    const avgRainPerDay = rainyDays > 0 ? (totalRainHours / rainyDays).toFixed(1) : 0;
    const hasData = data.length > 0;
    const hasRain = totalRainHours > 0;

    // Empty state
    if (!hasData) {
        return (
            <div className="bg-surface-card rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/5 rounded-lg">
                        <CloudOff className="w-5 h-5 text-white/40" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">7-Day Rainfall</h3>
                        <p className="text-xs text-white/50">No data available</p>
                    </div>
                </div>
                <div className="h-48 flex items-center justify-center">
                    <p className="text-white/30 text-sm">No rainfall data to display</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surface-card rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${hasRain ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                        <CloudRain className={`w-5 h-5 ${hasRain ? 'text-blue-400' : 'text-white/40'}`} />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">7-Day Rainfall</h3>
                        <p className="text-xs text-white/50">Duration & intensity tracking</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className={`text-lg font-bold ${hasRain ? 'text-blue-400' : 'text-white/40'}`}>
                        {totalRainHours.toFixed(1)}h
                    </p>
                    <p className="text-xs text-white/50">{rainyDays} rainy days</p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            unit="h"
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Bar
                            dataKey="duration"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                            className="transition-all duration-300"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={getBarColor(entry.intensity)}
                                    className="hover:opacity-80 transition-opacity cursor-pointer"
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend & Stats */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm bg-[#93C5FD]" />
                        <span className="text-xs text-white/60">Light</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm bg-[#60A5FA]" />
                        <span className="text-xs text-white/60">Moderate</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6]" />
                        <span className="text-xs text-white/60">Heavy</span>
                    </div>
                </div>
                {rainyDays > 0 && (
                    <div className="text-xs text-white/50">
                        Avg: <span className="text-blue-400 font-medium">{avgRainPerDay}h</span>/day
                    </div>
                )}
            </div>
        </div>
    );
};

export default RainBarChart;

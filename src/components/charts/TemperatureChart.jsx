import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area } from 'recharts';
import { Thermometer, TrendingUp, TrendingDown } from 'lucide-react';

const TemperatureChart = ({ data = [] }) => {
    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-surface-elevated border border-white/20 rounded-lg p-3 shadow-xl backdrop-blur-sm">
                    <p className="text-white font-medium text-sm mb-2">{label}</p>
                    <div className="space-y-1.5">
                        {payload.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-xs text-white/70">{entry.name}:</span>
                                <span className="text-xs font-semibold" style={{ color: entry.color }}>
                                    {entry.value}{entry.name.includes('Humidity') ? '%' : '°C'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    // Calculate statistics
    const hasData = data.length > 0;
    const avgTemp = hasData
        ? (data.reduce((sum, d) => sum + (d.temperature || 0), 0) / data.length).toFixed(1)
        : '--';
    const avgHumidity = hasData
        ? (data.reduce((sum, d) => sum + (d.humidity || 0), 0) / data.length).toFixed(0)
        : '--';
    const maxTemp = hasData
        ? Math.max(...data.map(d => d.temperature || 0)).toFixed(1)
        : '--';
    const minTemp = hasData
        ? Math.min(...data.map(d => d.temperature || 0)).toFixed(1)
        : '--';

    // Calculate trend
    const getTempTrend = () => {
        if (data.length < 2) return 'stable';
        const first = data.slice(0, Math.ceil(data.length / 2));
        const second = data.slice(Math.ceil(data.length / 2));
        const firstAvg = first.reduce((s, d) => s + (d.temperature || 0), 0) / first.length;
        const secondAvg = second.reduce((s, d) => s + (d.temperature || 0), 0) / second.length;
        if (secondAvg > firstAvg + 1) return 'up';
        if (secondAvg < firstAvg - 1) return 'down';
        return 'stable';
    };

    const tempTrend = getTempTrend();

    return (
        <div className="bg-surface-card rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Thermometer className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">Temperature & Humidity</h3>
                        <p className="text-xs text-white/50">24-hour trend • {data.length} readings</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                            <p className="text-sm font-bold text-orange-400">{avgTemp}°C</p>
                            {tempTrend !== 'stable' && (
                                tempTrend === 'up'
                                    ? <TrendingUp className="w-3 h-3 text-red-400" />
                                    : <TrendingDown className="w-3 h-3 text-blue-400" />
                            )}
                        </div>
                        <p className="text-xs text-white/50">Avg Temp</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-blue-400">{avgHumidity}%</p>
                        <p className="text-xs text-white/50">Avg Humidity</p>
                    </div>
                </div>
            </div>

            {/* Min/Max Stats */}
            <div className="flex gap-2 mb-4">
                <div className="flex-1 p-2 bg-blue-500/10 rounded-lg text-center">
                    <p className="text-xs text-white/50">Min</p>
                    <p className="text-sm font-semibold text-blue-400">{minTemp}°C</p>
                </div>
                <div className="flex-1 p-2 bg-red-500/10 rounded-lg text-center">
                    <p className="text-xs text-white/50">Max</p>
                    <p className="text-sm font-semibold text-red-400">{maxTemp}°C</p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
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
                            yAxisId="temp"
                            domain={['auto', 'auto']}
                            tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `${value}°`}
                            width={50}
                        />
                        <YAxis
                            yAxisId="humidity"
                            orientation="right"
                            domain={[0, 100]}
                            tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `${value}%`}
                            width={50}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        {/* Area fills */}
                        <Area
                            yAxisId="temp"
                            type="monotone"
                            dataKey="temperature"
                            stroke="transparent"
                            fill="url(#tempGradient)"
                        />
                        <Area
                            yAxisId="humidity"
                            type="monotone"
                            dataKey="humidity"
                            stroke="transparent"
                            fill="url(#humidityGradient)"
                        />

                        {/* Lines */}
                        <Line
                            yAxisId="temp"
                            type="monotone"
                            dataKey="temperature"
                            name="Temperature"
                            stroke="#F97316"
                            strokeWidth={2}
                            dot={{ fill: '#F97316', strokeWidth: 0, r: 2 }}
                            activeDot={{ r: 5, fill: '#F97316', stroke: '#fff', strokeWidth: 2 }}
                        />
                        <Line
                            yAxisId="humidity"
                            type="monotone"
                            dataKey="humidity"
                            name="Humidity"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ fill: '#3B82F6', strokeWidth: 0, r: 2 }}
                            activeDot={{ r: 5, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-1 rounded-full bg-orange-400" />
                    <span className="text-xs text-white/60">Temperature (°C)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-0.5 border-t-2 border-dashed border-blue-400" />
                    <span className="text-xs text-white/60">Humidity (%)</span>
                </div>
            </div>
        </div>
    );
};

export default TemperatureChart;

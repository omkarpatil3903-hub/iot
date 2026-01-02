import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ref, query, limitToLast, onValue, off } from 'firebase/database';
import { database } from '../../config/firebase';
import { Thermometer, TrendingUp, TrendingDown } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const TemperatureChart = () => {
    const [chartData, setChartData] = useState({ datasets: [] });
    const [stats, setStats] = useState({ avgTemp: '--', avgHum: '--', minTemp: '--', maxTemp: '--', trend: 'stable' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!database) {
            setLoading(false);
            return;
        }

        const sensorDataRef = ref(database, 'sensor_data');
        const recentDataQuery = query(sensorDataRef, limitToLast(50));

        const unsubscribe = onValue(recentDataQuery, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const entries = Object.values(data);
                const validEntries = entries.filter(entry => entry.timestamp && entry.timestamp > 1700000000000);
                validEntries.sort((a, b) => a.timestamp - b.timestamp);

                // Calculate stats
                if (validEntries.length > 0) {
                    const temps = validEntries.map(e => e.temperature).filter(t => t != null);
                    const hums = validEntries.map(e => e.humidity).filter(h => h != null);

                    const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
                    const avgHum = (hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(0);
                    const minTemp = Math.min(...temps).toFixed(1);
                    const maxTemp = Math.max(...temps).toFixed(1);

                    // Calculate trend
                    const firstHalf = temps.slice(0, Math.ceil(temps.length / 2));
                    const secondHalf = temps.slice(Math.ceil(temps.length / 2));
                    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
                    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
                    const trend = secondAvg > firstAvg + 1 ? 'up' : secondAvg < firstAvg - 1 ? 'down' : 'stable';

                    setStats({ avgTemp, avgHum, minTemp, maxTemp, trend });
                }

                const labels = validEntries.map(entry => {
                    const date = new Date(entry.timestamp);
                    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                });

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Temperature (°C)',
                            data: validEntries.map(e => e.temperature ?? null),
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            borderWidth: 2,
                            yAxisID: 'y-temp'
                        },
                        {
                            label: 'Humidity (%)',
                            data: validEntries.map(e => e.humidity ?? null),
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            borderWidth: 2,
                            borderDash: [5, 5],
                            yAxisID: 'y-hum'
                        }
                    ]
                });
            }
            setLoading(false);
        });

        return () => off(recentDataQuery);
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#9ca3af', usePointStyle: true, boxWidth: 8, font: { size: 11 } }
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleColor: '#f3f4f6',
                bodyColor: '#e5e7eb',
                padding: 12,
                usePointStyle: true,
                callbacks: {
                    label: (ctx) => {
                        const label = ctx.dataset.label || '';
                        const val = ctx.parsed.y?.toFixed(1) ?? '--';
                        return `${label}: ${val}${label.includes('Temp') ? '°C' : '%'}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#6b7280', maxRotation: 0, autoSkip: true, maxTicksLimit: 8, font: { size: 10 } }
            },
            'y-temp': {
                type: 'linear',
                position: 'left',
                grid: { display: false },
                ticks: {
                    color: '#ef4444',
                    callback: (v) => `${Number(v).toFixed(1)}°C`,
                    maxTicksLimit: 6
                },
                title: { display: true, text: 'Temperature', color: '#ef4444', font: { size: 10 } }
            },
            'y-hum': {
                type: 'linear',
                position: 'right',
                min: 0,
                max: 100,
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#3b82f6', callback: (v) => `${v}%` },
                title: { display: true, text: 'Humidity', color: '#3b82f6', font: { size: 10 } }
            }
        }
    };

    if (loading) {
        return (
            <div className="bg-surface-card rounded-2xl p-4 border border-white/10 h-80 flex items-center justify-center">
                <div className="animate-spin w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full" />
            </div>
        );
    }

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
                        <p className="text-xs text-white/50">Live data from ESP32</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                            <p className="text-sm font-bold text-orange-400">{stats.avgTemp}°C</p>
                            {stats.trend === 'up' && <TrendingUp className="w-3 h-3 text-red-400" />}
                            {stats.trend === 'down' && <TrendingDown className="w-3 h-3 text-blue-400" />}
                        </div>
                        <p className="text-xs text-white/50">Avg Temp</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-blue-400">{stats.avgHum}%</p>
                        <p className="text-xs text-white/50">Avg Humidity</p>
                    </div>
                </div>
            </div>

            {/* Min/Max Stats */}
            <div className="flex gap-2 mb-4">
                <div className="flex-1 p-2 bg-blue-500/10 rounded-lg text-center">
                    <p className="text-xs text-white/50">Min</p>
                    <p className="text-sm font-semibold text-blue-400">{stats.minTemp}°C</p>
                </div>
                <div className="flex-1 p-2 bg-red-500/10 rounded-lg text-center">
                    <p className="text-xs text-white/50">Max</p>
                    <p className="text-sm font-semibold text-red-400">{stats.maxTemp}°C</p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-48">
                <Line data={chartData} options={options} />
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-xs text-white/60">Temperature (°C)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-xs text-white/60">Humidity (%)</span>
                </div>
            </div>
        </div>
    );
};

export default TemperatureChart;

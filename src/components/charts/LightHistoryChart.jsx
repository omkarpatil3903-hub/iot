import { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { ref, query, limitToLast, onValue, off } from "firebase/database";
import { database } from "../../config/firebase";
import { Sun, TrendingUp, TrendingDown, Sunrise, Sunset } from "lucide-react";

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

/**
 * Light History Chart Component
 * Displays historical light intensity data from BH1750 sensor
 */
const LightHistoryChart = () => {
    const [chartData, setChartData] = useState({ datasets: [] });
    const [stats, setStats] = useState({
        avgLux: "--",
        minLux: "--",
        maxLux: "--",
        currentLux: "--",
        trend: "stable",
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!database) {
            setLoading(false);
            return;
        }

        const sensorDataRef = ref(database, "sensor_data");
        const recentDataQuery = query(sensorDataRef, limitToLast(50));

        const unsubscribe = onValue(recentDataQuery, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const entries = Object.values(data);
                const validEntries = entries.filter(
                    (entry) => entry.timestamp && entry.timestamp > 1700000000000
                );
                validEntries.sort((a, b) => a.timestamp - b.timestamp);

                // Calculate stats
                if (validEntries.length > 0) {
                    const luxValues = validEntries
                        .map((e) => e.light_lux)
                        .filter((l) => l != null && l >= 0);

                    if (luxValues.length > 0) {
                        const avgLux = Math.round(
                            luxValues.reduce((a, b) => a + b, 0) / luxValues.length
                        );
                        const minLux = Math.round(Math.min(...luxValues));
                        const maxLux = Math.round(Math.max(...luxValues));
                        const currentLux = Math.round(luxValues[luxValues.length - 1]);

                        // Calculate trend
                        const firstHalf = luxValues.slice(0, Math.ceil(luxValues.length / 2));
                        const secondHalf = luxValues.slice(Math.ceil(luxValues.length / 2));
                        const firstAvg =
                            firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
                        const secondAvg =
                            secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
                        const trend =
                            secondAvg > firstAvg * 1.1
                                ? "up"
                                : secondAvg < firstAvg * 0.9
                                    ? "down"
                                    : "stable";

                        setStats({
                            avgLux: formatLux(avgLux),
                            minLux: formatLux(minLux),
                            maxLux: formatLux(maxLux),
                            currentLux: formatLux(currentLux),
                            trend,
                        });
                    }
                }

                const labels = validEntries.map((entry) => {
                    const date = new Date(entry.timestamp);
                    return date.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                    });
                });

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: "Light Intensity (lux)",
                            data: validEntries.map((e) => e.light_lux ?? null),
                            borderColor: "#facc15",
                            backgroundColor: (context) => {
                                const ctx = context.chart.ctx;
                                const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                                gradient.addColorStop(0, "rgba(250, 204, 21, 0.3)");
                                gradient.addColorStop(1, "rgba(250, 204, 21, 0.02)");
                                return gradient;
                            },
                            fill: true,
                            tension: 0.4,
                            pointRadius: 0,
                            pointHoverRadius: 4,
                            borderWidth: 2,
                        },
                    ],
                });
            }
            setLoading(false);
        });

        return () => off(recentDataQuery);
    }, []);

    // Format lux value for display
    const formatLux = (lux) => {
        if (lux === null || lux === undefined || lux < 0) return "--";
        if (lux >= 1000) {
            return `${(lux / 1000).toFixed(1)}k`;
        }
        return lux.toString();
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "rgba(17, 24, 39, 0.95)",
                titleColor: "#f3f4f6",
                bodyColor: "#e5e7eb",
                padding: window.innerWidth < 640 ? 8 : 12,
                usePointStyle: true,
                bodyFont: { size: window.innerWidth < 640 ? 11 : 12 },
                titleFont: { size: window.innerWidth < 640 ? 11 : 12 },
                callbacks: {
                    label: (ctx) => {
                        const val = ctx.parsed.y;
                        if (val === null || val === undefined) return "Light: --";
                        if (val >= 1000) {
                            return `Light: ${(val / 1000).toFixed(1)}k lux`;
                        }
                        return `Light: ${val.toFixed(0)} lux`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: { color: "rgba(255, 255, 255, 0.05)" },
                ticks: {
                    color: "#6b7280",
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: window.innerWidth < 640 ? 4 : 8,
                    font: { size: window.innerWidth < 640 ? 9 : 10 },
                },
            },
            y: {
                type: "linear",
                position: "left",
                min: 0,
                grid: { color: "rgba(255, 255, 255, 0.05)" },
                ticks: {
                    color: "#facc15",
                    callback: (v) => {
                        if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
                        return v;
                    },
                    maxTicksLimit: window.innerWidth < 640 ? 4 : 6,
                    font: { size: window.innerWidth < 640 ? 9 : 10 },
                },
                title: {
                    display: window.innerWidth >= 640,
                    text: "Lux",
                    color: "#facc15",
                    font: { size: 10 },
                },
            },
        },
    };

    if (loading) {
        return (
            <div className="bg-surface-card rounded-2xl p-4 border border-white/10 h-80 flex items-center justify-center">
                <div className="animate-spin w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="bg-surface-card rounded-2xl p-3 sm:p-4 border border-white/10 hover:border-white/20 transition-colors">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    </div>
                    <div>
                        <h3 className="text-xs sm:text-sm font-medium text-white">
                            Light Intensity History
                        </h3>
                        <p className="text-[10px] sm:text-xs text-white/50">
                            BH1750 Sensor Data
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 sm:gap-4">
                    <div className="text-left sm:text-right">
                        <div className="flex items-center gap-1">
                            <p className="text-xs sm:text-sm font-bold text-yellow-400">
                                {stats.currentLux} lx
                            </p>
                            {stats.trend === "up" && (
                                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-400" />
                            )}
                            {stats.trend === "down" && (
                                <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" />
                            )}
                        </div>
                        <p className="text-[10px] sm:text-xs text-white/50">Current</p>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="text-xs sm:text-sm font-bold text-amber-400">
                            {stats.avgLux} lx
                        </p>
                        <p className="text-[10px] sm:text-xs text-white/50">Average</p>
                    </div>
                </div>
            </div>

            {/* Min/Max Stats */}
            <div className="flex gap-2 mb-4">
                <div className="flex-1 p-2 bg-slate-500/10 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-1">
                        <Sunset className="w-3 h-3 text-slate-400" />
                        <p className="text-[10px] sm:text-xs text-white/50">Min</p>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-400">
                        {stats.minLux} lx
                    </p>
                </div>
                <div className="flex-1 p-2 bg-yellow-500/10 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-1">
                        <Sunrise className="w-3 h-3 text-yellow-400" />
                        <p className="text-[10px] sm:text-xs text-white/50">Max</p>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-yellow-400">
                        {stats.maxLux} lx
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-40 sm:h-48">
                <Line data={chartData} options={options} />
            </div>

            {/* Legend / Info */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 pt-3 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400" />
                    <span className="text-[10px] sm:text-xs text-white/60">
                        Light Intensity (lux)
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LightHistoryChart;

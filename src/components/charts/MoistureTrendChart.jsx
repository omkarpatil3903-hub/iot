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
import { Layers } from 'lucide-react';

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

const MoistureTrendChart = ({ growthStage = 'GERMINATION' }) => {
    const [chartData, setChartData] = useState({ datasets: [] });
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

                const labels = validEntries.map(entry => {
                    const date = new Date(entry.timestamp);
                    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                });

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: '15cm (Surface)',
                            data: validEntries.map(e => e.moisture_15cm ?? null),
                            borderColor: '#f59e0b',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            borderWidth: 2
                        },
                        {
                            label: '30cm (Mid)',
                            data: validEntries.map(e => e.moisture_30cm ?? null),
                            borderColor: '#22c55e',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            borderWidth: 2
                        },
                        {
                            label: '45cm (Root)',
                            data: validEntries.map(e => e.moisture_45cm ?? null),
                            borderColor: '#8b5cf6',
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            borderWidth: 2
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
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#9ca3af',
                    usePointStyle: true,
                    boxWidth: 8,
                    font: { size: 11 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleColor: '#f3f4f6',
                bodyColor: '#e5e7eb',
                padding: 12,
                usePointStyle: true,
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${context.parsed.y?.toFixed(1) ?? '--'}%`
                }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#6b7280', maxRotation: 0, autoSkip: true, maxTicksLimit: 8, font: { size: 10 } }
            },
            y: {
                min: 0,
                max: 100,
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#9ca3af', callback: (v) => `${v}%` }
            }
        }
    };

    if (loading) {
        return (
            <div className="bg-surface-card rounded-2xl p-4 border border-white/10 h-72 flex items-center justify-center">
                <div className="animate-spin w-6 h-6 border-2 border-cane-green border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="bg-surface-card rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cane-green/20 rounded-lg">
                    <Layers className="w-5 h-5 text-cane-green" />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white">Moisture Trend</h3>
                    <p className="text-xs text-white/50">All 3 depth sensors</p>
                </div>
            </div>

            <div className="h-56">
                <Line data={chartData} options={options} />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-3 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                    <span className="text-xs text-white/60">15cm</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
                    <span className="text-xs text-white/60">30cm</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8b5cf6' }} />
                    <span className="text-xs text-white/60">45cm</span>
                </div>
            </div>
        </div>
    );
};

export default MoistureTrendChart;

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
import { RefreshCw, WifiOff } from 'lucide-react';

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

const FieldHistoryChart = () => {
    const [chartData, setChartData] = useState({
        datasets: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!database) {
            setError('Firebase not initialized');
            setLoading(false);
            return;
        }

        const sensorDataRef = ref(database, 'sensor_data');
        const recentDataQuery = query(sensorDataRef, limitToLast(50));

        const unsubscribe = onValue(recentDataQuery, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const entries = Object.values(data);

                // Filter out entries with invalid timestamps (uptime or pre-2024 dates)
                const validEntries = entries.filter(entry => entry.timestamp && entry.timestamp > 1700000000000);

                // DEBUG: Log first entry to see data structure
                console.log('First Entry Data:', validEntries[0]);

                // Sort by timestamp
                validEntries.sort((a, b) => a.timestamp - b.timestamp);

                const labels = validEntries.map(entry => {
                    const date = new Date(entry.timestamp);
                    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                });

                setChartData({
                    labels,
                    datasets: [
                        // Left Axis: Temperature
                        {
                            label: 'Temperature (°C)',
                            data: validEntries.map(e => e.temperature ?? null),
                            borderColor: '#ef4444', // Red-500
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            yAxisID: 'y-left',
                            tension: 0.4,
                            pointRadius: 2,
                            pointHoverRadius: 4,
                            spanGaps: true
                        },
                        // Left Axis: Humidity
                        {
                            label: 'Humidity (%)',
                            data: validEntries.map(e => e.humidity ?? null),
                            borderColor: '#3b82f6', // Blue-500
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            yAxisID: 'y-left',
                            tension: 0.4,
                            pointRadius: 2,
                            pointHoverRadius: 4,
                            borderDash: [5, 5],
                            spanGaps: true
                        },
                        // Right Axis: Rain Level
                        {
                            label: 'Rain Level (%)',
                            data: validEntries.map(e => e.rain_level || 0),
                            borderColor: '#06b6d4', // Cyan-500
                            backgroundColor: 'rgba(6, 182, 212, 0.2)',
                            fill: true,
                            yAxisID: 'y-right',
                            tension: 0.2,
                            pointRadius: 0,
                            pointHoverRadius: 4
                        },
                        // Right Axis: Moisture 15cm
                        {
                            label: 'Moisture 15cm',
                            data: validEntries.map(e => e.moisture_15cm ?? null),
                            borderColor: '#f59e0b', // Amber-500 (Orange)
                            backgroundColor: 'transparent',
                            yAxisID: 'y-right',
                            tension: 0.4,
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            borderWidth: 2
                        },
                        // Right Axis: Moisture 30cm
                        {
                            label: 'Moisture 30cm',
                            data: validEntries.map(e => e.moisture_30cm ?? null),
                            borderColor: '#22c55e', // Green-500
                            backgroundColor: 'transparent',
                            yAxisID: 'y-right',
                            tension: 0.4,
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            borderWidth: 2
                        },
                        // Right Axis: Moisture 45cm
                        {
                            label: 'Moisture 45cm',
                            data: validEntries.map(e => e.moisture_45cm ?? null),
                            borderColor: '#8b5cf6', // Purple-500
                            backgroundColor: 'transparent',
                            yAxisID: 'y-right',
                            tension: 0.4,
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            borderWidth: 2
                        }
                    ]
                });
            } else {
                // Handle no data case empty datasets
                setChartData({ datasets: [] });
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching sensor data:", error);
            setError(error.message);
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
                    color: '#9ca3af', // gray-400
                    usePointStyle: true,
                    boxWidth: 8,
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11
                    }
                }
            },
            title: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleColor: '#f3f4f6',
                bodyColor: '#e5e7eb',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                boxPadding: 4,
                usePointStyle: true,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y.toFixed(1);
                            if (label.includes('Temperature')) label += '°C';
                            else label += '%';
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    color: '#6b7280', // gray-500
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 8,
                    font: {
                        size: 10
                    }
                }
            },
            'y-left': {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Temp (°C) / Humidity (%)',
                    color: '#9ca3af',
                    font: { size: 10 }
                },
                suggestedMin: 0,
                suggestedMax: 100,
                grid: {
                    display: false
                },
                ticks: {
                    color: '#9ca3af'
                }
            },
            'y-right': {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Moisture / Rain (%)',
                    color: '#22c55e',
                    font: { size: 10 }
                },
                min: 0,
                max: 100,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    color: '#22c55e'
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center bg-white/5 rounded-2xl border border-white/10">
                <RefreshCw className="w-8 h-8 text-cane-green animate-spin opacity-50" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[300px] w-full flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/10 text-white/50 gap-2">
                <WifiOff className="w-8 h-8 opacity-50" />
                <span className="text-sm">Failed to load history data</span>
            </div>
        );
    }

    if (!chartData.datasets.length) {
        return (
            <div className="h-[300px] w-full flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/10 text-white/50 gap-2">
                <span className="text-sm">No historical data available</span>
            </div>
        );
    }

    return (
        <div className="w-full h-[300px] sm:h-[400px]">
            <Line data={chartData} options={options} />
        </div>
    );
};

export default FieldHistoryChart;

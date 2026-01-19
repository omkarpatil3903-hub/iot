import { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, Droplets } from 'lucide-react';
import { fetchWeatherForecast } from '../services/weatherService';

const WeatherForecast = () => {
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadForecast();
        const interval = setInterval(loadForecast, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const loadForecast = async () => {
        try {
            const data = await fetchWeatherForecast();
            setForecast(data);
        } catch (error) {
            console.error('Failed to load forecast:', error);
        } finally {
            setLoading(false);
        }
    };

    const getWeatherIcon = (condition) => {
        switch (condition?.toLowerCase()) {
            case 'clear': return <Sun className="w-5 h-5 text-yellow-400" />;
            case 'clouds': return <Cloud className="w-5 h-5 text-gray-400" />;
            case 'rain':
            case 'drizzle': return <CloudRain className="w-5 h-5 text-blue-400" />;
            default: return <Cloud className="w-5 h-5 text-gray-400" />;
        }
    };

    const formatDay = (date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tom';
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    if (loading) {
        return (
            <div className="bg-surface-card rounded-xl p-4 border border-white/10 flex items-center justify-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cane-green"></div>
            </div>
        );
    }

    return (
        <div className="bg-surface-card rounded-xl p-3 border border-white/10">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {forecast.slice(0, 7).map((day, index) => (
                    <div key={index} className="flex-shrink-0 flex flex-col items-center p-2 bg-white/5 rounded-lg min-w-[60px] hover:bg-white/10 transition-colors">
                        <span className="text-[10px] text-white/50 font-medium">{formatDay(day.date)}</span>
                        {getWeatherIcon(day.condition)}
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-xs font-bold text-white">{Math.round(day.tempMax)}°</span>
                            <span className="text-[10px] text-white/40">{Math.round(day.tempMin)}°</span>
                        </div>
                        {day.precipitation > 0 && (
                            <div className="flex items-center gap-0.5 mt-1">
                                <Droplets className="w-2.5 h-2.5 text-blue-400" />
                                <span className="text-[9px] text-blue-400">{day.precipitation.toFixed(0)}mm</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeatherForecast;

import { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, Droplets } from 'lucide-react';
import { fetchCurrentWeather } from '../services/weatherService';

const HeaderWeatherWidget = () => {
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        loadWeather();
        const interval = setInterval(loadWeather, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const loadWeather = async () => {
        try {
            const data = await fetchCurrentWeather();
            setWeather(data);
        } catch (error) {
            console.error('Weather error:', error);
        }
    };

    const getIcon = (condition) => {
        switch (condition?.toLowerCase()) {
            case 'clear': return <Sun className="w-4 h-4 text-yellow-400" />;
            case 'clouds': return <Cloud className="w-4 h-4 text-gray-400" />;
            case 'rain':
            case 'drizzle': return <CloudRain className="w-4 h-4 text-blue-400" />;
            default: return <Cloud className="w-4 h-4 text-gray-400" />;
        }
    };

    if (!weather) {
        return (
            <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg">
                <div className="w-4 h-4 bg-white/10 rounded animate-pulse" />
                <span className="text-xs text-white/40">--°</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-default" title={`${weather.location}: ${weather.description}`}>
            {getIcon(weather.condition)}
            <span className="text-sm font-semibold text-white">{Math.round(weather.temperature)}°</span>
            <div className="hidden sm:flex items-center gap-1 text-white/50 border-l border-white/10 pl-2">
                <Droplets className="w-3 h-3" />
                <span className="text-xs">{weather.humidity}%</span>
            </div>
        </div>
    );
};

export default HeaderWeatherWidget;

import { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer } from 'lucide-react';
import { fetchCurrentWeather } from '../services/weatherService';

const WeatherCard = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

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
            console.error('Failed to load weather:', error);
        } finally {
            setLoading(false);
        }
    };

    const getWeatherIcon = (condition) => {
        switch (condition?.toLowerCase()) {
            case 'clear': return <Sun className="w-8 h-8 text-yellow-400" />;
            case 'clouds': return <Cloud className="w-8 h-8 text-gray-400" />;
            case 'rain':
            case 'drizzle': return <CloudRain className="w-8 h-8 text-blue-400" />;
            default: return <Cloud className="w-8 h-8 text-gray-400" />;
        }
    };

    if (loading) {
        return (
            <div className="bg-surface-card rounded-xl p-4 border border-white/10 flex items-center justify-center h-24">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cane-green"></div>
            </div>
        );
    }

    if (!weather) return null;

    return (
        <div className="bg-surface-card rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between">
                {/* Left: Icon + Temp */}
                <div className="flex items-center gap-3">
                    {getWeatherIcon(weather.condition)}
                    <div>
                        <div className="text-3xl font-bold text-white">{Math.round(weather.temperature)}°C</div>
                        <p className="text-xs text-white/50 capitalize">{weather.description}</p>
                    </div>
                </div>

                {/* Right: Key metrics */}
                <div className="flex gap-4">
                    <div className="text-center">
                        <div className="flex items-center gap-1 text-blue-400">
                            <Droplets className="w-3 h-3" />
                            <span className="text-sm font-semibold">{weather.humidity}%</span>
                        </div>
                        <p className="text-[10px] text-white/40">Humidity</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center gap-1 text-cyan-400">
                            <Wind className="w-3 h-3" />
                            <span className="text-sm font-semibold">{Math.round(weather.windSpeed)} km/h</span>
                        </div>
                        <p className="text-[10px] text-white/40">Wind</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center gap-1 text-orange-400">
                            <Thermometer className="w-3 h-3" />
                            <span className="text-sm font-semibold">{Math.round(weather.feelsLike)}°</span>
                        </div>
                        <p className="text-[10px] text-white/40">Feels Like</p>
                    </div>
                </div>
            </div>
            {weather.isMock && <p className="text-[10px] text-amber-400 mt-2">Demo Data - Add API key</p>}
        </div>
    );
};

export default WeatherCard;

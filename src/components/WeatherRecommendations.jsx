import { useEffect, useState } from 'react';
import { Droplet, Flame, CheckCircle, Calendar, AlertTriangle } from 'lucide-react';
import { fetchWeatherForecast, getWeatherRecommendations } from '../services/weatherService';

const WeatherRecommendations = ({ currentMoisture }) => {
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecommendations();
        const interval = setInterval(loadRecommendations, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, [currentMoisture]);

    const loadRecommendations = async () => {
        try {
            const forecast = await fetchWeatherForecast();
            const rec = getWeatherRecommendations(forecast, currentMoisture || 60);
            setRecommendation(rec);
        } catch (error) {
            console.error('Failed to load recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = () => {
        switch (recommendation?.action) {
            case 'SKIP_IRRIGATION': return <Droplet className="w-5 h-5 text-blue-400" />;
            case 'IRRIGATE_NOW': return <Flame className="w-5 h-5 text-red-400" />;
            case 'SCHEDULE_IRRIGATION': return <Calendar className="w-5 h-5 text-amber-400" />;
            default: return <CheckCircle className="w-5 h-5 text-emerald-400" />;
        }
    };

    const getBgColor = () => {
        switch (recommendation?.urgency) {
            case 'HIGH': return 'bg-red-500/10 border-red-500/30';
            case 'MEDIUM': return 'bg-amber-500/10 border-amber-500/30';
            default: return 'bg-emerald-500/10 border-emerald-500/30';
        }
    };

    if (loading) {
        return (
            <div className="bg-surface-card rounded-xl p-4 border border-white/10 flex items-center justify-center h-24">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cane-green"></div>
            </div>
        );
    }

    if (!recommendation) return null;

    return (
        <div className={`rounded-xl p-4 border ${getBgColor()} transition-colors`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${recommendation.bg}`}>
                    {getIcon()}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold ${recommendation.color}`}>
                            {recommendation.action.replace(/_/g, ' ')}
                        </h4>
                        {recommendation.urgency === 'HIGH' && (
                            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                        )}
                    </div>
                    <p className="text-xs text-white/60 mt-0.5">{recommendation.message}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${recommendation.urgency === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                        recommendation.urgency === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-emerald-500/20 text-emerald-400'
                    }`}>
                    {recommendation.urgency}
                </span>
            </div>
        </div>
    );
};

export default WeatherRecommendations;

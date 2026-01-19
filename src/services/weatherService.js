import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const LAT = import.meta.env.VITE_WEATHER_LAT || '18.5204';
const LON = import.meta.env.VITE_WEATHER_LON || '73.8567';

// Cache duration: 10 minutes
const CACHE_DURATION = 10 * 60 * 1000;
let weatherCache = null;
let forecastCache = null;
let lastFetchTime = 0;

/**
 * Fetch current weather data
 */
export const fetchCurrentWeather = async () => {
    // Return cached data if still valid
    if (weatherCache && Date.now() - lastFetchTime < CACHE_DURATION) {
        return weatherCache;
    }

    // Return mock data if no API key
    if (!API_KEY || API_KEY === 'your_openweather_api_key_here') {
        return getMockCurrentWeather();
    }

    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather`,
            {
                params: {
                    lat: LAT,
                    lon: LON,
                    appid: API_KEY,
                    units: 'metric'
                }
            }
        );

        weatherCache = {
            temperature: response.data.main.temp,
            feelsLike: response.data.main.feels_like,
            humidity: response.data.main.humidity,
            pressure: response.data.main.pressure,
            windSpeed: response.data.wind.speed,
            windDirection: response.data.wind.deg,
            cloudiness: response.data.clouds.all,
            condition: response.data.weather[0].main,
            description: response.data.weather[0].description,
            icon: response.data.weather[0].icon,
            sunrise: response.data.sys.sunrise * 1000,
            sunset: response.data.sys.sunset * 1000,
            location: response.data.name,
            timestamp: Date.now()
        };

        lastFetchTime = Date.now();
        return weatherCache;
    } catch (error) {
        console.error('Weather API error:', error);
        return getMockCurrentWeather();
    }
};

/**
 * Fetch 7-day weather forecast
 */
export const fetchWeatherForecast = async () => {
    // Return cached data if still valid
    if (forecastCache && Date.now() - lastFetchTime < CACHE_DURATION) {
        return forecastCache;
    }

    // Return mock data if no API key
    if (!API_KEY || API_KEY === 'your_openweather_api_key_here') {
        return getMockForecast();
    }

    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast`,
            {
                params: {
                    lat: LAT,
                    lon: LON,
                    appid: API_KEY,
                    units: 'metric',
                    cnt: 40 // 5 days, 3-hour intervals
                }
            }
        );

        // Group by day and calculate daily stats
        const dailyData = {};

        response.data.list.forEach(item => {
            const date = new Date(item.dt * 1000).toDateString();

            if (!dailyData[date]) {
                dailyData[date] = {
                    temps: [],
                    humidity: [],
                    precipitation: 0,
                    conditions: [],
                    icons: [],
                    wind: []
                };
            }

            dailyData[date].temps.push(item.main.temp);
            dailyData[date].humidity.push(item.main.humidity);
            dailyData[date].precipitation += item.rain?.['3h'] || 0;
            dailyData[date].conditions.push(item.weather[0].main);
            dailyData[date].icons.push(item.weather[0].icon);
            dailyData[date].wind.push(item.wind.speed);
        });

        // Convert to array format
        forecastCache = Object.keys(dailyData).slice(0, 7).map(date => ({
            date: new Date(date),
            tempMin: Math.min(...dailyData[date].temps),
            tempMax: Math.max(...dailyData[date].temps),
            avgHumidity: dailyData[date].humidity.reduce((a, b) => a + b, 0) / dailyData[date].humidity.length,
            precipitation: dailyData[date].precipitation,
            condition: getMostFrequent(dailyData[date].conditions),
            icon: getMostFrequent(dailyData[date].icons),
            windSpeed: dailyData[date].wind.reduce((a, b) => a + b, 0) / dailyData[date].wind.length
        }));

        return forecastCache;
    } catch (error) {
        console.error('Forecast API error:', error);
        return getMockForecast();
    }
};

/**
 * Get weather-based irrigation recommendations
 */
export const getWeatherRecommendations = (forecast, currentMoisture) => {
    if (!forecast || forecast.length === 0) {
        return { action: 'MONITOR', message: 'Weather data unavailable', urgency: 'LOW' };
    }

    const next3Days = forecast.slice(0, 3);
    const totalRain = next3Days.reduce((sum, day) => sum + day.precipitation, 0);
    const avgTemp = next3Days.reduce((sum, day) => sum + day.tempMax, 0) / 3;

    // Rain expected in next 3 days
    if (totalRain > 10) {
        return {
            action: 'SKIP_IRRIGATION',
            message: `${totalRain.toFixed(1)}mm rain expected. Skip irrigation.`,
            urgency: 'LOW',
            icon: '🌧️',
            color: 'text-blue-400',
            bg: 'bg-blue-500/20'
        };
    }

    // High temperature + low moisture
    if (avgTemp > 35 && currentMoisture < 50) {
        return {
            action: 'IRRIGATE_NOW',
            message: 'High temperatures ahead. Irrigate immediately.',
            urgency: 'HIGH',
            icon: '🔥',
            color: 'text-red-400',
            bg: 'bg-red-500/20'
        };
    }

    // Moderate conditions
    if (currentMoisture < 60 && totalRain < 5) {
        return {
            action: 'SCHEDULE_IRRIGATION',
            message: 'No significant rain expected. Plan irrigation.',
            urgency: 'MEDIUM',
            icon: '💧',
            color: 'text-amber-400',
            bg: 'bg-amber-500/20'
        };
    }

    return {
        action: 'MONITOR',
        message: 'Conditions favorable. Continue monitoring.',
        urgency: 'LOW',
        icon: '✅',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/20'
    };
};

// Helper functions
const getMostFrequent = (arr) => {
    return arr.sort((a, b) =>
        arr.filter(v => v === a).length - arr.filter(v => v === b).length
    ).pop();
};

const getMockCurrentWeather = () => ({
    temperature: 32.5,
    feelsLike: 35.2,
    humidity: 68,
    pressure: 1013,
    windSpeed: 12,
    windDirection: 180,
    cloudiness: 40,
    condition: 'Clouds',
    description: 'scattered clouds',
    icon: '02d',
    sunrise: Date.now() - 6 * 60 * 60 * 1000,
    sunset: Date.now() + 6 * 60 * 60 * 1000,
    location: 'Pune',
    timestamp: Date.now(),
    isMock: true
});

const getMockForecast = () => {
    const forecast = [];
    const conditions = ['Clear', 'Clouds', 'Rain', 'Clouds', 'Clear', 'Clouds', 'Clear'];
    const icons = ['01d', '02d', '10d', '03d', '01d', '02d', '01d'];

    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);

        forecast.push({
            date,
            tempMin: 22 + Math.random() * 3,
            tempMax: 32 + Math.random() * 5,
            avgHumidity: 60 + Math.random() * 20,
            precipitation: i === 2 ? 15 : Math.random() * 5,
            condition: conditions[i],
            icon: icons[i],
            windSpeed: 8 + Math.random() * 8,
            isMock: true
        });
    }

    return forecast;
};

export default {
    fetchCurrentWeather,
    fetchWeatherForecast,
    getWeatherRecommendations
};

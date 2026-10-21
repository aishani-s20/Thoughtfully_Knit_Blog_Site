import { WeatherCondition } from '../types/index.ts';

interface WeatherCache {
  condition: WeatherCondition;
  temperatureC: number;
  timestamp: number;
}

let cachedWeather: WeatherCache | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function detectLocalWeather(): Promise<{ condition: WeatherCondition; temp: number }> {
  // Check memory cache first
  if (cachedWeather && Date.now() - cachedWeather.timestamp < CACHE_TTL_MS) {
    return {
      condition: cachedWeather.condition,
      temp: cachedWeather.temperatureC,
    };
  }

  try {
    // 1. Attempt browser geolocation with quick timeout
    const coords = await getBrowserCoordinates().catch(() => null);

    const lat = coords ? coords.latitude : 12.9716; // Default coordinates if denied
    const lon = coords ? coords.longitude : 77.5946;

    // 2. Query Open-Meteo edge API (free, open-access, zero API key required)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo responded ${res.status}`);

    const data = await res.json();
    const current = data.current;
    const code = current?.weather_code ?? 0;
    const isDay = current?.is_day ?? 1;
    const temp = Math.round(current?.temperature_2m ?? 21);

    const condition = mapWeatherCode(code, isDay);

    cachedWeather = {
      condition,
      temperatureC: temp,
      timestamp: Date.now(),
    };

    return { condition, temp };
  } catch (err) {
    console.warn('Weather detection fallback triggered:', err);
    // Graceful fallback to contemplative rain
    return {
      condition: 'rain',
      temp: 19,
    };
  }
}

function getBrowserCoordinates(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(err),
      { timeout: 4000, maximumAge: 600000 }
    );
  });
}

function mapWeatherCode(code: number, isDay: number): WeatherCondition {
  // If it's night time and no heavy storm, return night
  if (isDay === 0 && (code <= 3 || code === 45 || code === 48)) {
    return 'night';
  }

  // WMO Code interpretation
  if (code >= 51 && code <= 99) {
    // 51-55: Drizzle, 61-65: Rain, 80-82: Showers, 95-99: Thunderstorms
    return 'rain';
  }
  if (code === 45 || code === 48) {
    // Fog and depositing rime fog
    return 'fog';
  }
  if (isDay === 0) {
    return 'night';
  }
  return 'clear';
}

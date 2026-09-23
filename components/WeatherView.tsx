import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Wind, 
  Droplets, 
  Sun, 
  MapPin, 
  Search, 
  RefreshCw,
  Sparkles,
  Thermometer,
  ShieldAlert
} from 'lucide-react';
import { WeatherData, UserProfile } from '../types';
import { POPULAR_CITIES, fetchCityWeather } from '../services/weatherService';

interface WeatherViewProps {
  profile: UserProfile;
}

export const WeatherView: React.FC<WeatherViewProps> = ({ profile }) => {
  const [selectedCity, setSelectedCity] = useState('Islamabad');
  const [customCity, setCustomCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  const isUrdu = profile.language === 'ur';
  const isRoman = profile.language === 'roman-ur';

  const loadWeather = async (city: string) => {
    setLoading(true);
    try {
      const data = await fetchCityWeather(city);
      setWeather(data);
      setSelectedCity(city);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather('Islamabad');
  }, []);

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCity.trim()) {
      loadWeather(customCity.trim());
      setCustomCity('');
    }
  };

  const getAdvisory = (w: WeatherData) => {
    if (isUrdu) {
      if (w.temp > 35) {
        return 'گرمی کی شدت زیادہ ہے۔ براہ کرم پانی کا زیادہ استعمال کریں اور دھوپ میں غیر ضروری جانے سے گریز کریں۔';
      } else if (w.temp < 15) {
        return 'موسم سرد ہے۔ گرم لباس کا استعمال کریں اور چائے یا قہوہ سے لطف اندوز ہوں۔';
      } else if (w.condition.includes('بارش') || w.condition.includes('Rain')) {
        return 'بارش کا امکان ہے۔ چھتری ساتھ رکھیں اور ڈرائیونگ کے دوران احتیاط کریں۔';
      }
      return 'موسم خوشگوار اور معتدل ہے۔ روزمرہ کاموں اور چہل قدمی کے لیے بہترین وقت ہے۔';
    } else if (isRoman) {
      if (w.temp > 35) {
        return 'Garmi zyada hai, paani ka istamaal zyada karein aur dhoop se bachein.';
      } else if (w.temp < 15) {
        return 'Mausam thanda hai, garam kapray pehnein aur chai/coffee enjoy karein.';
      } else if (w.condition.includes('Rain') || w.condition.includes('بارش')) {
        return 'Baarish ka imkaan hai, umbrella sath rakhein aur safe driving karein.';
      }
      return 'Mausam khushgawar aur normal hai, outdoor activities ke liye perfect hai.';
    } else {
      if (w.temp > 35) return 'Hot temperatures expected. Stay hydrated and avoid direct sun exposure.';
      if (w.temp < 15) return 'Chilly weather. Keep warm and enjoy a hot drink.';
      return 'Pleasant and moderate weather conditions throughout the day.';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 space-y-6">
      {/* City selector bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
          {POPULAR_CITIES.slice(0, 7).map((c) => (
            <button
              key={c.name}
              onClick={() => loadWeather(c.name)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCity.toLowerCase() === c.name.toLowerCase()
                  ? 'bg-[var(--theme-primary)] text-slate-950 font-bold shadow-md'
                  : 'glass-panel text-slate-300 hover:text-white border border-[var(--theme-border-subtle)]'
              }`}
            >
              {isUrdu ? c.urdu : c.name}
            </button>
          ))}
        </div>

        {/* Custom search */}
        <form onSubmit={handleCustomSearch} className="flex items-center gap-1.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <input
              type="text"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              placeholder={isUrdu ? 'کوئی اور شہر...' : isRoman ? 'Koi aur city...' : 'Search city...'}
              className="w-full glass-panel px-3 py-1.5 text-xs rounded-full border border-[var(--theme-border-subtle)] text-white placeholder:text-slate-500 outline-none focus:border-[var(--theme-primary)]"
            />
          </div>
          <button
            type="submit"
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => loadWeather(selectedCity)}
            disabled={loading}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </form>
      </div>

      {weather && (
        <div className="space-y-6">
          {/* Main Weather Card */}
          <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 glass-panel border border-[var(--theme-border)] shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--theme-badge-bg)] text-[var(--theme-primary)] text-xs font-mono">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{weather.city}, {weather.country}</span>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl md:text-6xl font-extrabold text-white tracking-tighter">
                    {weather.temp}°C
                  </span>
                  <span className="text-lg md:text-xl font-medium text-slate-300">
                    {weather.condition}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-400 font-sans">
                  {isUrdu ? weather.summaryUrdu : isRoman ? weather.summaryRoman : weather.summaryEnglish}
                </p>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
                  <Droplets className="w-5 h-5 text-sky-400 mb-1" />
                  <span className="text-[10px] text-slate-400 uppercase font-mono">{isUrdu ? 'نمی' : 'Humidity'}</span>
                  <span className="text-sm font-bold text-white">{weather.humidity}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
                  <Wind className="w-5 h-5 text-teal-400 mb-1" />
                  <span className="text-[10px] text-slate-400 uppercase font-mono">{isUrdu ? 'ہوا کی رفتار' : 'Wind'}</span>
                  <span className="text-sm font-bold text-white">{weather.windSpeed} km/h</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center col-span-2 sm:col-span-1">
                  <Thermometer className="w-5 h-5 text-amber-400 mb-1" />
                  <span className="text-[10px] text-slate-400 uppercase font-mono">{isUrdu ? 'محسوس' : 'Feels Like'}</span>
                  <span className="text-sm font-bold text-white">{weather.feelsLike}°C</span>
                </div>
              </div>
            </div>

            {/* URFI Advisory */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[var(--theme-badge-bg)] text-[var(--theme-primary)] shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--theme-primary)] font-semibold">
                  {isUrdu ? 'عرفی کا روزمرہ مشورہ:' : isRoman ? 'Urfi ka Mashwara:' : 'Urfi Weather Advisory:'}
                </span>
                <p className="text-xs text-slate-300">
                  {getAdvisory(weather)}
                </p>
              </div>
            </div>
          </div>

          {/* 5-Day Forecast */}
          <div className="space-y-3">
            <h3 className="text-xs md:text-sm font-mono uppercase tracking-widest text-[var(--theme-primary)] font-semibold flex items-center gap-2">
              <CloudSun className="w-4 h-4" />
              <span>{isUrdu ? 'آئندہ دنوں کی پیش گوئی' : '5-Day Forecast'}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {weather.forecast.map((day, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl glass-panel border border-[var(--theme-border-subtle)] flex flex-col items-center text-center space-y-1.5"
                >
                  <span className="text-xs font-semibold text-slate-300">{day.day}</span>
                  <span className="text-2xl my-1">{day.icon || '⛅'}</span>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="font-bold text-white">{day.tempMax}°</span>
                    <span className="text-slate-400 text-[11px]">/ {day.tempMin}°</span>
                  </div>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{day.condition}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherView;

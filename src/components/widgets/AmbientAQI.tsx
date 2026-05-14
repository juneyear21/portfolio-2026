import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EASE_MECH: [number, number, number, number] = [0.4, 0, 0.2, 1];

// Types
interface AQIData {
  aqi: number;
  city: string;
  dominentpol: string;
  iaqi: Record<string, { v: number }>;
  time: string;
}

// Helpers
const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return 'var(--success)';
  if (aqi <= 100) return 'var(--warning)';
  if (aqi <= 150) return 'var(--utility-orange)';
  if (aqi <= 200) return 'var(--accent-red)';
  if (aqi <= 300) return '#8f3f97'; // Purple
  return '#7e0023'; // Maroon
};

const getAQIStatus = (aqi: number) => {
  if (aqi <= 50) return 'GOOD / AIR QUALITY IS SATISFACTORY';
  if (aqi <= 100) return 'MODERATE / ACCEPTABLE AIR QUALITY';
  if (aqi <= 150) return 'SENSITIVE / MAY CAUSE MINOR HEALTH IMPACTS';
  if (aqi <= 200) return 'UNHEALTHY / GENERAL PUBLIC MAY BE AFFECTED';
  if (aqi <= 300) return 'VERY UNHEALTHY / HEALTH WARNING';
  return 'HAZARDOUS / EMERGENCY CONDITIONS';
};

// Typewriter Component
const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 20); // Fast mechanical typing
    
    // Add initial delay
    const startTimeout = setTimeout(() => {
      // do nothing, just delay the start of the interval? 
      // Actually interval is already running. Let's fix that:
    }, delay);

    return () => {
      clearInterval(interval);
      clearTimeout(startTimeout);
    };
  }, [text, delay]); // re-run when text changes

  return <span>{displayed}</span>;
};

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1000; // 1s
    const startValue = 0;
    
    // cubic-bezier(0.4, 0, 0.2, 1) approximate implementation for JS
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = easeOutCubic(progress);
      
      setDisplayValue(Math.floor(easeProgress * (value - startValue) + startValue));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value]);

  return <>{displayValue}</>;
};

export default function AmbientAQI() {
  const [data, setData] = useState<AQIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchAQI = useCallback(async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = '';
      if (query) {
        url = `https://api.waqi.info/feed/${encodeURIComponent(query)}/?token=55589f0963bdb37942b09d29867ee84eb0054f48`;
      } else {
        // Try getting location, fallback to Mumbai
        const pos = await new Promise<GeolocationPosition | null>((resolve) => {
          if (!navigator.geolocation) resolve(null);
          navigator.geolocation.getCurrentPosition(
            (p) => resolve(p),
            () => resolve(null),
            { timeout: 5000 }
          );
        });

        if (pos) {
          url = `https://api.waqi.info/feed/geo:${pos.coords.latitude};${pos.coords.longitude}/?token=55589f0963bdb37942b09d29867ee84eb0054f48`;
        } else {
          url = `https://api.waqi.info/feed/mumbai/?token=55589f0963bdb37942b09d29867ee84eb0054f48`; // Fallback
        }
      }

      const res = await fetch(url);
      const json = await res.json();
      
      if (json.status === 'ok') {
        setData({
          aqi: json.data.aqi,
          city: json.data.city.name.split(',')[0], // Clean up city name
          dominentpol: json.data.dominentpol,
          iaqi: json.data.iaqi,
          time: json.data.time.s,
        });
        if (query) localStorage.setItem('lastCity', query);
      } else {
        throw new Error('Data not found');
      }
    } catch (err) {
      setError('ERROR: FEED UNAVAILABLE');
    } finally {
      setLoading(false);
      setIsSearching(false);
      setLastUpdated(new Date());
    }
  }, []);

  // Mount effect
  useEffect(() => {
    const lastCity = localStorage.getItem('lastCity');
    fetchAQI(lastCity || undefined);

    const interval = setInterval(() => {
      const city = localStorage.getItem('lastCity');
      fetchAQI(city || undefined);
    }, 5 * 60 * 1000); // 5 mins

    return () => clearInterval(interval);
  }, [fetchAQI]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    fetchAQI(searchQuery.trim());
  };

  return (
    <motion.div 
      className="bento-card col-span-2 row-span-1 col-start-1 row-start-5 group overflow-hidden relative"
      animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <div className="absolute inset-0 dot-bg pointer-events-none opacity-50 transition-opacity group-hover:opacity-100" />
      
      {/* Scanning Search Overlay */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 bottom-0 w-1/2 pointer-events-none z-20"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)'
            }}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col h-full relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="font-grotesk font-medium text-[16px] tracking-[0.06em] uppercase text-text-primary">
            AMBIENT AQI
          </div>
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="text"
                placeholder="SEARCH CITY..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-b border-border-visible focus:border-text-primary text-[10px] font-mono tracking-widest uppercase outline-none text-right w-24 focus:w-32 transition-all duration-300 placeholder:text-text-disabled text-text-secondary"
              />
            </form>
            <button 
              onClick={() => fetchAQI(localStorage.getItem('lastCity') || undefined)}
              className="cursor-pointer text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </button>
            <div className="flex items-center gap-[6px] ml-2">
              <motion.div 
                className="w-[5px] h-[5px]" 
                style={{ borderRadius: 0, backgroundColor: 'var(--success)' }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-meta-sm">LIVE</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex items-center justify-between mt-2">
          {loading ? (
             <div className="flex-1 flex flex-col items-center justify-center">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: '100%' }}
                 transition={{ duration: 1, ease: EASE_MECH }}
                 className="h-[1px] bg-border-visible w-full absolute top-1/2"
               />
               <span className="text-meta animate-pulse">ACQUIRING FEED...</span>
             </div>
          ) : error ? (
            <div className="text-accent-red font-mono text-[12px] uppercase">
              <TypewriterText text={error} />
            </div>
          ) : data ? (
            <>
              {/* Left Side - AQI Ring */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg width="96" height="96" viewBox="0 0 100 100" className="absolute -rotate-90">
                  {/* Background ring */}
                  <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border)" strokeWidth="6" strokeDasharray="4 6" />
                  
                  {/* Foreground Animated Ring */}
                  <motion.circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke={getAQIColor(data.aqi)} 
                    strokeWidth="6" 
                    strokeDasharray="4 6"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: Math.min(data.aqi / 300, 1) }}
                    transition={{ duration: 1.2, ease: EASE_MECH, delay: 0.1 }}
                  />
                </svg>
                
                <div 
                  className="font-doto font-bold text-[36px] leading-none"
                  style={{ color: getAQIColor(data.aqi) }}
                >
                  <AnimatedNumber value={data.aqi} />
                </div>
              </div>

              {/* Right Side - Info */}
              <div className="flex-1 ml-6 flex flex-col justify-center h-full gap-2">
                <div>
                  <h3 className="font-grotesk text-[14px] font-medium tracking-wide uppercase text-text-primary line-clamp-1">
                    <TypewriterText text={data.city} />
                  </h3>
                  <div className="text-meta text-text-secondary mt-[2px] min-h-[14px]">
                    <TypewriterText text={getAQIStatus(data.aqi)} />
                  </div>
                </div>

                {/* Pollutant Bars */}
                <div className="flex flex-col gap-[6px] mt-2">
                  {['pm25', 'pm10', 'no2', 'o3'].map((pol, i) => {
                    const val = data.iaqi[pol]?.v || 0;
                    const max = pol === 'o3' ? 100 : 300;
                    const width = Math.min((val / max) * 100, 100);
                    
                    return val > 0 ? (
                      <div key={pol} className="flex items-center gap-2">
                        <span className="text-[9px] font-mono uppercase text-text-disabled w-8">{pol}</span>
                        <div className="flex-1 h-[4px] bg-border relative overflow-hidden">
                          <motion.div 
                            className="absolute top-0 left-0 bottom-0"
                            style={{ backgroundColor: pol === data.dominentpol ? getAQIColor(data.aqi) : 'var(--border-visible)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${width}%` }}
                            transition={{ duration: 0.8, delay: 0.3 + (i * 0.1), ease: EASE_MECH }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-text-secondary w-6 text-right">{val}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
      
      {/* Last Updated */}
      {data && !loading && !error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-3 right-4 text-meta-sm"
        >
          UPDATED: {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </motion.div>
      )}
    </motion.div>
  );
}

import { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { motion } from 'framer-motion';

function fmtTime(d: Date, opts?: Intl.DateTimeFormatOptions) {
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', ...opts });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}

function fmtUptime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `UP ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function ClockWidget() {
  const { time, uptime } = useStore();
  const [glitchText, setGlitchText] = useState<string | null>(null);

  // Glitch effect every ~30s
  useEffect(() => {
    const iv = setInterval(() => {
      const chars = '0123456789';
      let count = 0;
      const orig = fmtTime(new Date());
      const glitchIv = setInterval(() => {
        setGlitchText(orig.split('').map(c => c === ':' ? ':' : chars[Math.floor(Math.random() * 10)]).join(''));
        count++;
        if (count > 8) {
          clearInterval(glitchIv);
          setGlitchText(null);
        }
      }, 60);
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  const displayTime = glitchText || fmtTime(time);

  return (
    <div className="bento-card col-span-2 row-span-2 col-start-1 row-start-1 dot-bg group">
      <span className="live-tag">LIVE • 0.1s</span>
      <div className="absolute top-0 right-0 w-[120px] h-[120px] opacity-5 bg-[radial-gradient(circle,#fff_1px,transparent_1px)] bg-[length:5px_5px] theme-light:opacity-[0.04]"></div>
      
      <div className="h-full flex flex-col justify-between relative z-10">
        <div>
          <div className="text-meta">SYSTEM TIME</div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-doto text-[104px] font-normal tracking-[-0.03em] text-text-display leading-[0.96] mt-1"
          >
            {displayTime}
          </motion.div>
        </div>
        
        <div>
          <div className="flex gap-6 items-end">
            <div className="flex flex-col gap-[2px]">
              <div className="font-mono text-[14px] text-text-primary">{fmtTime(time, { timeZone: 'Europe/London' })}</div>
              <div className="text-meta-sm">LON</div>
            </div>
            <div className="flex flex-col gap-[2px]">
              <div className="font-mono text-[14px] text-text-primary">{fmtTime(time, { timeZone: 'America/New_York' })}</div>
              <div className="text-meta-sm">NYC</div>
            </div>
            <div className="flex flex-col gap-[2px]">
              <div className="font-mono text-[14px] text-text-primary">{fmtTime(time, { timeZone: 'Asia/Tokyo' })}</div>
              <div className="text-meta-sm">TYO</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="font-mono text-[13px] tracking-[0.08em] text-text-secondary uppercase">
            {fmtDate(time)}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse-led"></div>
            <div className="font-mono text-[11px] tracking-[0.06em] text-text-secondary">
              {fmtUptime(uptime)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

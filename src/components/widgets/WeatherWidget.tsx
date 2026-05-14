import { useStore } from '../../store';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export default function WeatherWidget() {
  const temp = useStore((state) => state.temp);
  
  const springTemp = useSpring(0, { bounce: 0, duration: 800 });
  const displayTemp = useTransform(springTemp, (v) => Math.round(v));

  useEffect(() => {
    springTemp.set(temp);
  }, [temp, springTemp]);

  return (
    <div className="bento-card col-start-3 row-start-1 group">
      <span className="live-tag">0.2s</span>
      <div className="h-full flex flex-col justify-between relative z-10">
        <div>
          <div className="text-meta">MUMBAI — WEATHER</div>
          <div className="flex items-start gap-0">
            <motion.div className="font-doto text-[72px] font-normal tracking-[-0.03em] text-text-display leading-none">
              {displayTemp}
            </motion.div>
            <div className="font-mono text-[13px] text-text-secondary mt-[14px] tracking-[0.06em]">°C</div>
          </div>
          <div className="font-grotesk text-[14px] text-text-primary mt-1">Partly Cloudy</div>
        </div>
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-[2px]">
            <div className="text-meta-sm">HUMIDITY</div>
            <div className="font-mono text-[13px] text-text-primary">74%</div>
          </div>
          <div className="flex flex-col gap-[2px]">
            <div className="text-meta-sm">WIND</div>
            <div className="font-mono text-[13px] text-text-primary">18 km/h</div>
          </div>
          <div className="flex flex-col gap-[2px]">
            <div className="text-meta-sm">FEELS</div>
            <div className="font-mono text-[11px] text-text-secondary tracking-[0.06em]">27°</div>
          </div>
        </div>
      </div>
    </div>
  );
}

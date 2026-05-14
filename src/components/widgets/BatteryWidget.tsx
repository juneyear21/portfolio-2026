import { useStore } from '../../store';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { clsx } from 'clsx';

export default function BatteryWidget() {
  const battery = useStore((state) => state.battery);
  
  const springBatt = useSpring(0, { bounce: 0, duration: 700 });
  const displayBatt = useTransform(springBatt, (v) => Math.round(v));

  useEffect(() => {
    springBatt.set(battery);
  }, [battery, springBatt]);

  const totalSegs = 20;
  const filledSegs = Math.round((battery / 100) * totalSegs);

  return (
    <div className="bento-card col-start-4 row-start-1 group">
      <span className="live-tag">LIVE</span>
      <div className="h-full flex flex-col justify-between relative z-10">
        <div>
          <div className="text-meta">POWER</div>
          <div className="flex items-start">
            <motion.div className="font-doto text-[72px] font-normal tracking-[-0.03em] text-text-display leading-none">
              {displayBatt}
            </motion.div>
            <div className="font-mono text-[11px] tracking-[0.08em] text-text-secondary mt-4">%</div>
          </div>
        </div>
        
        <div>
          <div className="flex gap-[3px] mt-2">
            {Array.from({ length: totalSegs }).map((_, i) => {
              const isFilled = i < filledSegs;
              let colorClass = 'bg-surface-raised theme-light:bg-[#E8E8E8]';
              if (isFilled) {
                if (battery <= 20) colorClass = 'bg-accent-red';
                else if (battery <= 40) colorClass = 'bg-warning';
                else colorClass = 'bg-success';
              }

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.045 + 0.2 }}
                  className={clsx('h-[6px] flex-1', colorClass)}
                />
              );
            })}
          </div>
          <div className="mt-[10px] flex justify-between items-center">
            <div className="font-mono text-[11px] tracking-[0.06em] text-text-secondary">DISCHARGING</div>
            <div className="font-mono text-[11px] tracking-[0.06em] text-text-secondary">3h 21m</div>
          </div>
        </div>
      </div>
    </div>
  );
}

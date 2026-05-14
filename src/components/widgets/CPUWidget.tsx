import { useStore } from '../../store';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export default function CPUWidget() {
  const { cpu, cpuHistory } = useStore();

  const springCpu = useSpring(0, { bounce: 0, duration: 400 });
  const displayCpu = useTransform(springCpu, (v) => Math.round(v));

  useEffect(() => {
    springCpu.set(cpu);
  }, [cpu, springCpu]);

  const W = 160;
  const H = 40;
  const min = 0;
  const max = 100;
  const ptStr = cpuHistory.map((v, i) => {
    const x = (i / (cpuHistory.length - 1 || 1)) * W;
    const y = H - ((v - min) / (max - min)) * H;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bento-card col-start-1 row-start-3 group">
      <span className="live-tag">LIVE</span>
      <div className="h-full flex flex-col justify-between relative z-10">
        <div>
          <div className="text-meta">CPU LOAD</div>
          <div className="flex items-end gap-1 mt-2">
            <motion.div className="font-mono text-[40px] font-normal tracking-[-0.02em] text-text-display leading-none">
              {displayCpu}
            </motion.div>
            <div className="text-meta mb-2">%</div>
          </div>
          <div className="font-mono text-[10px] text-text-disabled tracking-[0.06em] mt-1">8-CORE · 3.2GHZ</div>
        </div>
        
        <div className="w-full h-[40px]">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 160 40" preserveAspectRatio="none">
            <motion.polyline 
              points={ptStr}
              fill="none"
              stroke="var(--text-secondary)"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={{ strokeDasharray: W * 3, strokeDashoffset: W * 3 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

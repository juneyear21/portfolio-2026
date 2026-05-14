import { useStore } from '../../store';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export default function MemoryWidget() {
  const { mem, memTotal } = useStore();

  const springMem = useSpring(0, { bounce: 0, duration: 400 });
  const displayMem = useTransform(springMem, (v) => v.toFixed(1));

  useEffect(() => {
    springMem.set(mem);
  }, [mem, springMem]);

  const usedPct = Math.round((mem / memTotal) * 100);

  return (
    <div className="bento-card col-start-2 row-start-3 group">
      <span className="live-tag">LIVE</span>
      <div className="h-full flex flex-col justify-between relative z-10">
        <div>
          <div className="text-meta">MEMORY</div>
          <div className="flex items-end gap-1 mt-2">
            <motion.div className="font-mono text-[40px] font-normal tracking-[-0.02em] text-text-display leading-none">
              {displayMem}
            </motion.div>
            <div className="text-meta mb-2">GB</div>
          </div>
        </div>

        <div className="flex flex-col gap-[6px]">
          <div className="flex flex-col gap-[3px]">
            <div className="flex justify-between">
              <div className="text-meta-sm">USED</div>
              <div className="text-meta-sm">{usedPct}%</div>
            </div>
            <div className="h-[3px] bg-surface-raised theme-light:bg-[#E8E8E8] relative">
              <motion.div 
                className="h-full bg-text-primary"
                animate={{ width: `${usedPct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-[3px] mt-1">
            <div className="flex justify-between">
              <div className="text-meta-sm">CACHE</div>
              <div className="text-meta-sm">22%</div>
            </div>
            <div className="h-[3px] bg-surface-raised theme-light:bg-[#E8E8E8] relative">
              <div className="h-full bg-text-disabled w-[22%]" />
            </div>
          </div>

          <div className="flex flex-col gap-[3px] mt-1">
            <div className="flex justify-between">
              <div className="text-meta-sm">SWAP</div>
              <div className="text-meta-sm">5%</div>
            </div>
            <div className="h-[3px] bg-surface-raised theme-light:bg-[#E8E8E8] relative">
              <div className="h-full bg-text-disabled w-[5%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

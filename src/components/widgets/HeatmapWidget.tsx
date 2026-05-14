import { useStore } from '../../store';
import { motion } from 'framer-motion';

export default function HeatmapWidget() {
  const heatmap = useStore((state) => state.heatmap);

  return (
    <div className="bento-card col-span-2 col-start-1 row-start-4 group">
      <span className="live-tag">LIVE</span>
      <div className="h-full flex flex-col justify-between relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-meta">UPTIME ACTIVITY</div>
            <div className="mt-[6px] font-mono text-[11px] text-text-secondary">
              LAST 36 WEEKS · <span className="text-text-primary">194</span> DAYS
            </div>
          </div>
          <div className="flex gap-4">
            <div>
              <div className="text-meta-sm">PEAK</div>
              <div className="font-mono text-[13px] text-text-primary">99.7%</div>
            </div>
            <div>
              <div className="text-meta-sm">AVG</div>
              <div className="font-mono text-[13px] text-text-primary">94.2%</div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-[3px] flex-nowrap overflow-hidden flex-1 mt-2 items-end">
          {heatmap.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-[3px]">
              {col.map((v, ri) => {
                const delay = (ci * 5 + ri) * 0.018;
                return (
                  <motion.div
                    key={ri}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: delay + 0.05, duration: 0.2, ease: "easeOut" }}
                    className={`w-[10px] h-[10px] rounded-none hm-cell ${v > 0 ? 'l' + Math.min(v, 4) : 'bg-surface-raised theme-light:bg-[#E8E8E8]'}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-1">
          <div className="text-meta-sm">36 WKS AGO</div>
          <div className="text-meta-sm">NOW</div>
        </div>
      </div>
    </div>
  );
}

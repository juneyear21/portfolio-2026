import { useStore } from '../../store';

export default function FocusWidget() {
  const { focusSec, focusTotal, focusPhase } = useStore();

  const m = Math.floor(focusSec / 60);
  const s = focusSec % 60;
  
  const circ = 238.76;
  const pct = focusSec / focusTotal;
  const strokeDashoffset = circ * (1 - pct);

  return (
    <div className="bento-card col-start-4 row-start-3 group">
      <span className="live-tag">LIVE</span>
      <div className="h-full flex flex-col justify-between items-start relative z-10">
        <div className="text-meta">FOCUS TIMER</div>
        
        <div className="relative w-[88px] h-[88px] mt-1">
          <svg className="w-[88px] h-[88px] -rotate-90" viewBox="0 0 88 88">
            <circle 
              className="fill-none stroke-surface-raised theme-light:stroke-[#E8E8E8]" 
              cx="44" cy="44" r="38" strokeWidth="3"
            />
            <circle 
              className="fill-none stroke-text-primary transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]" 
              cx="44" cy="44" r="38" strokeWidth="3" strokeLinecap="square"
              strokeDasharray={circ}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[18px] text-text-display tracking-[-0.02em] whitespace-nowrap">
            {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
          </div>
        </div>
        
        <div className="w-full flex flex-col gap-[6px]">
          <div className="font-grotesk text-[14px] text-text-primary">Deep Work</div>
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div 
                key={i} 
                className={`w-[6px] h-[6px] rounded-none ${i < focusPhase ? 'bg-text-primary' : 'bg-surface-raised theme-light:bg-[#E8E8E8]'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

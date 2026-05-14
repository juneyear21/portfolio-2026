import { useStore } from '../../store';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

export default function NowPlayingWidget() {
  const { playing, playProgress, playDuration, wfFreqs, wfPhases, togglePlay } = useStore();
  
  const elapsed = Math.floor(playProgress * playDuration);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;

  // Let's create an animated waveform by driving the height via style
  // We'll rely on the global time in our store for standard react rendering,
  // but to get 60fps waveform we could use requestAnimationFrame in a ref, 
  // or just rely on the store's high freq tick. The store ticks via requestAnimationFrame.
  const glyphFrame = useStore(state => state.glyphFrame); // use as a generic time ticker

  return (
    <div className="bento-card col-span-2 col-start-3 row-start-2 group">
      <span className="live-tag">LIVE</span>
      <div className="h-full flex flex-col justify-between relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-meta">NOW PLAYING</div>
            <div className="font-grotesk font-medium text-[22px] tracking-[-0.01em] text-text-display mt-2">Nightcall</div>
            <div className="font-mono text-[11px] tracking-[0.06em] text-text-secondary uppercase mt-1">Kavinsky · OutRun</div>
          </div>
          <div className="flex gap-4 items-center">
            <button className="text-text-secondary hover:text-text-primary transition-colors p-1">
              <SkipBack className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button className="text-text-secondary hover:text-text-primary transition-colors p-1" onClick={togglePlay}>
              {playing ? <Pause className="w-4 h-4" strokeWidth={1.5} fill="currentColor" /> : <Play className="w-4 h-4" strokeWidth={1.5} fill="currentColor" />}
            </button>
            <button className="text-text-secondary hover:text-text-primary transition-colors p-1">
              <SkipForward className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-[2px] h-[36px]">
            {Array.from({ length: 28 }).map((_, i) => {
              const freq = wfFreqs[i % wfFreqs.length];
              const phase = wfPhases[i % wfPhases.length];
              const t = glyphFrame * (playing ? 0.05 : 0.03);
              const amp = playing ? (Math.sin(t * freq + phase) * 0.5 + 0.5) * 28 + 4 : 4;
              
              return (
                <div
                  key={i}
                  className="w-[3px] bg-text-disabled theme-light:bg-[#CCC] origin-bottom rounded-none transition-all duration-[80ms] ease-linear"
                  style={{ height: `${amp}px` }}
                />
              );
            })}
          </div>
          <div className="flex flex-col gap-[6px] mt-[10px]">
            <div className="h-[2px] bg-surface-raised theme-light:bg-[#E8E8E8] relative">
              <div 
                className="h-full bg-text-primary absolute left-0 top-0 transition-all duration-75"
                style={{ width: `${playProgress * 100}%` }}
              />
            </div>
            <div className="flex justify-between">
              <div className="font-mono text-[10px] text-text-disabled">{m}:{String(s).padStart(2, '0')}</div>
              <div className="font-mono text-[10px] text-text-disabled">3:34</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

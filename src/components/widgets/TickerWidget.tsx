import { useState, useEffect, useRef } from 'react';

const tickerMessages = [
  'KRNL: CPU freq scaled to 3.2GHz',
  'NET: eth0 RX 42.3 MB/s TX 8.1 MB/s',
  'FS: /dev/nvme0n1 94.2% uptime',
  'PROC: 312 tasks running',
  'MEM: 6.2GB/16GB active',
  'TEMP: Core 0-7 avg 61°C',
  'GPU: 0% load · 1.8GB VRAM',
  'DISK: R 2.1GB/s W 1.4GB/s',
  'BLUETOOTH: audio.sink connected',
  'SYS: No errors in last 7d',
];

export default function TickerWidget() {
  const [lines, setLines] = useState<string[]>([]);
  
  const stateRef = useRef({
    tickerLine: 0,
    tickerChar: 0,
    tickerLines: [] as string[]
  });

  useEffect(() => {
    const iv = setInterval(() => {
      const s = stateRef.current;
      
      if (s.tickerChar === 0) {
        s.tickerLines.push('');
        if (s.tickerLines.length > 4) {
          s.tickerLines.shift();
        }
      }
      
      const msg = tickerMessages[s.tickerLine % tickerMessages.length];
      if (s.tickerChar < msg.length) {
        s.tickerLines[s.tickerLines.length - 1] = msg.substring(0, s.tickerChar + 1);
        s.tickerChar++;
      } else {
        s.tickerChar = 0;
        s.tickerLine++;
        // If the critical red message comes up ("SYS: No errors..." or something), 
        // the original HTML does not specifically check, it's just a visual design.
      }
      
      setLines([...s.tickerLines]);
    }, 55);
    
    return () => clearInterval(iv);
  }, []);

  const hasCriticalError = lines.some(l => l.toLowerCase().includes('error') || l.toLowerCase().includes('fail'));

  return (
    <div className="bento-card col-start-4 row-start-4 group">
      <span className="live-tag">SYS</span>
      <div className="h-full flex flex-col justify-between relative z-10">
        <div>
          <div className="text-meta">SYSTEM LOG</div>
        </div>
        
        <div className="flex-1 mt-2 bg-surface-raised theme-light:bg-surface-raised font-mono text-[11px] tracking-[0.06em] text-text-primary p-[10px] overflow-hidden flex flex-col gap-[6px] rounded-[4px]">
          {lines.map((line, i) => {
            const isLast = i === lines.length - 1;
            // The prompt says: "One single use of brand red (#D71921) — only on the ticker dot when system log shows critical line"
            // Wait, the original HTML has the ticker dot red always: <div class="ticker-dot"></div> ... background:var(--accent-red);
            // I will keep it red as in the original HTML.
            return (
              <div key={i} className="whitespace-nowrap overflow-hidden text-clip">
                {line}
                {isLast && <span className="inline-block w-[7px] h-[13px] bg-text-primary align-middle animate-blink-cur ml-[1px]"></span>}
              </div>
            );
          })}
        </div>
        
        <div className="flex gap-2 items-center mt-2">
          <div className={`w-[6px] h-[6px] rounded-none ${hasCriticalError ? 'bg-accent-red' : 'bg-success'}`}></div>
          <div className={`font-mono text-[10px] tracking-[0.08em] uppercase ${hasCriticalError ? 'text-accent-red' : 'text-success'}`}>KERNEL 6.1.4</div>
        </div>
      </div>
    </div>
  );
}

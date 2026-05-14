import { useRef, useEffect } from 'react';
import { useStore } from '../../store';

export default function GlyphWidget() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glyphFrame = useStore(state => state.glyphFrame);
  const cpu = useStore(state => state.cpu);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.offsetWidth;
    }
    const W = canvas.width;
    const H = 110;
    ctx.clearRect(0, 0, W, H);

    const COLS = 14;
    const ROWS = 8;
    const cw = Math.floor((W - 13 * 3) / COLS);
    const ch = Math.floor((H - 7 * 3) / ROWS);
    const offx = (W - COLS * cw - (COLS - 1) * 3) / 2;
    const offy = (H - ROWS * ch - (ROWS - 1) * 3) / 2;
    
    const mode = Math.floor(glyphFrame / 180) % 4;

    // Check if we are inside the light layer by finding a parent with .theme-light
    const isDark = !canvas.closest('.theme-light');

    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        let on;
        const x = offx + c * (cw + 3);
        const y = offy + r * (ch + 3);

        if (mode === 0) { // WAVE
          const wave = Math.sin(glyphFrame * 0.035 + c * 0.6 + r * 0.35);
          on = wave > 0.15;
        } else if (mode === 1) { // SCANLINE
          const scan = (glyphFrame * 0.8 + r * 4) % (ROWS * 5);
          on = Math.abs(scan - r * 5) < 2.5;
        } else if (mode === 2) { // PULSE + RANDOM
          const pulse = Math.sin(glyphFrame * 0.025 + c * 0.3) * 0.6 + 0.4;
          on = pulse > 0.55 || Math.random() < 0.03;
        } else { // CENTRAL BURST (CPU reactive)
          const dist = Math.hypot(c - COLS / 2, r - ROWS / 2);
          const burst = Math.sin(glyphFrame * 0.04) * (1 - dist / 8) * (cpu / 100);
          on = burst > 0.25;
        }

        if (on) {
          ctx.fillStyle = isDark ? '#E8E8E8' : '#1A1A1A';
          ctx.fillRect(x, y, cw, ch);
          if (Math.random() < 0.12 && mode === 3) {
            ctx.fillStyle = isDark ? '#D71921' : '#B0151A'; // rare red accent
            ctx.fillRect(x + 1, y + 1, 2, 2);
          }
        } else {
          ctx.fillStyle = isDark ? '#1A1A1A' : '#E8E8E8';
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = isDark ? '#222' : '#CCC';
          ctx.fillRect(x, y, cw, ch);
        }
      }
    }
  }, [glyphFrame, cpu]);

  return (
    <div className="bento-card col-start-3 row-start-3 group">
      <span className="live-tag">LIVE</span>
      <div className="h-full flex flex-col justify-between relative z-10">
        <div className="text-meta">GLYPH INTERFACE</div>
        
        <canvas ref={canvasRef} height={110} className="w-full flex-1 mt-2" />
        
        <div className="flex gap-4">
          <div className="flex items-center gap-[6px]">
            <div className="w-[6px] h-[6px] rounded-full bg-success"></div>
            <div className="text-meta-sm">ACTIVE</div>
          </div>
          <div className="flex items-center gap-[6px]">
            <div className="w-[6px] h-[6px] rounded-none bg-text-disabled"></div>
            <div className="text-meta-sm">IDLE</div>
          </div>
        </div>
      </div>
    </div>
  );
}

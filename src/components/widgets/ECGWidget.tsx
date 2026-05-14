import { useRef, useEffect, useState } from 'react';

function ecgWave(t: number) {
  const mod = t % 60;
  if (mod < 5) return 0;
  if (mod < 8) return ((mod - 5) / 3) * 0.3;
  if (mod < 10) return 0.3 - ((mod - 8) / 2) * 0.6;
  if (mod < 11) return -0.3 + (mod - 10) * 1.3;
  if (mod < 13) return 1.0 - ((mod - 11) / 2) * 1.6;
  if (mod < 15) return -0.6 + ((mod - 13) / 2) * 0.7;
  if (mod < 18) return 0.1 + ((mod - 15) / 3) * 0.2;
  if (mod < 22) return 0.3 - ((mod - 18) / 4) * 0.3;
  return 0;
}

export default function ECGWidget() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [latency, setLatency] = useState(12);
  const pointsRef = useRef<number[]>(Array.from({ length: 80 }, () => 0));
  const phaseRef = useRef(0);

  useEffect(() => {
    let frameId: number;
    let loopCount = 0;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const par = canvas.parentElement;
      if (par) canvas.width = par.offsetWidth;
      canvas.height = 60;

      const W = canvas.width;
      const H = canvas.height;

      // Update logic (we do this slightly less frequently than full RAF, or we just do it on RAF)
      if (loopCount % 2 === 0) {
        pointsRef.current.push(ecgWave(phaseRef.current));
        if (pointsRef.current.length > 80) pointsRef.current.shift();
        phaseRef.current += 1.5;
        if (Math.random() < 0.05) {
          setLatency(Math.round(10 + Math.random() * 8));
        }
      }
      loopCount++;

      ctx.clearRect(0, 0, W, H);
      const isDark = !canvas.closest('.theme-light');
      ctx.strokeStyle = isDark ? '#E8E8E8' : '#1A1A1A';
      ctx.lineWidth = 1.6;
      ctx.beginPath();

      const pts = pointsRef.current;
      for (let i = 0; i < pts.length; i++) {
        const x = (i / (pts.length - 1)) * W;
        const y = H / 2 - pts[i] * H * 0.42;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = isDark ? '#1e1e1e' : '#e8e8e8';
      ctx.lineWidth = 0.5;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (H / 4) * i);
        ctx.lineTo(W, (H / 4) * i);
        ctx.stroke();
      }

      frameId = requestAnimationFrame(draw);
    };

    frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="bento-card col-start-3 row-start-4 group">
      <span className="live-tag">LIVE</span>
      <div className="h-full flex flex-col justify-between relative z-10">
        <div className="flex justify-between items-start">
          <div className="text-meta">SYSTEM PULSE</div>
          <div className="flex items-center gap-[6px]">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse-led" style={{ animationDelay: '-0.4s' }}></div>
          </div>
        </div>
        
        <canvas ref={canvasRef} className="w-full h-[60px] mt-2" />
        
        <div className="flex justify-between">
          <div>
            <div className="text-meta-sm">LATENCY</div>
            <div className="font-mono text-[18px] text-text-display">{latency}ms</div>
          </div>
          <div>
            <div className="text-meta-sm">THROUGHPUT</div>
            <div className="font-mono text-[18px] text-text-display">
              847<span className="text-[11px] text-text-secondary"> req/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

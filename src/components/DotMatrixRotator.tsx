import { useRef, useEffect, useCallback, useState } from 'react';

// ─── Config ───────────────────────────────────────────────────────────────────
const ROLES = [
  'Rahul Chauhan',
  'UI/UX Designer',
  'Vibe Coder',
  'Frontend Engineer',
  'Nothing Enthusiast',
  'Creative Developer',
];

const DOT_SPACING = 6;
const DOT_RADIUS = 2.5;

const COLOR_WHITE = '#E8E8E8';
const COLOR_RED = '#D71921';

// Phase durations (ms)
const T_ASSEMBLE = 700;
const T_HOLD = 2800;
const T_RED = 350;
const T_DESTROY = 900;
const T_CLEAR = 350;
const T_TOTAL = T_ASSEMBLE + T_HOLD + T_RED + T_DESTROY + T_CLEAR;

// ─── Easing ───────────────────────────────────────────────────────────────────
function easeMech(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ─── Dot type ─────────────────────────────────────────────────────────────────
interface Dot {
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  delay: number;
  col: number;
  opacity: number;
}

// ─── Sample text into dot positions ───────────────────────────────────────────
function sampleText(
  text: string,
  canvasWidth: number,
  canvasHeight: number,
  fontSize: number
): { tx: number; ty: number }[] {
  const offscreen = document.createElement('canvas');
  offscreen.width = canvasWidth;
  offscreen.height = canvasHeight;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return [];

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = '#FFF';
  
  let usedSize = fontSize;
  ctx.font = `${usedSize}px "Doto", monospace`;

  // Scale down if the longest single word exceeds width
  const words = text.split(' ');
  let maxWordWidth = 0;
  for (const w of words) {
    const ww = ctx.measureText(w).width;
    if (ww > maxWordWidth) maxWordWidth = ww;
  }
  
  const maxWidth = canvasWidth - 16;
  if (maxWordWidth > maxWidth) {
    usedSize = usedSize * (maxWidth / maxWordWidth);
    ctx.font = `${usedSize}px "Doto", monospace`;
  }

  // Wrap text into lines
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < canvasWidth - 16) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);

  // Draw lines starting near the top
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  const lineHeight = usedSize * 1.1;
  let startY = 10;

  lines.forEach((line) => {
    ctx.fillText(line, 4, startY);
    startY += lineHeight;
  });

  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const dots: { tx: number; ty: number }[] = [];

  for (let y = 0; y < canvasHeight; y += DOT_SPACING) {
    for (let x = 0; x < canvasWidth; x += DOT_SPACING) {
      const idx = (y * canvasWidth + x) * 4;
      if (imageData.data[idx + 3] > 128) {
        dots.push({ tx: x, ty: y });
      }
    }
  }
  return dots;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DotMatrixRotator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const stateRef = useRef({
    roleIndex: 0,
    phaseStart: 0,
    dots: [] as Dot[],
    initialized: false,
    lastW: 0,
    lastH: 0,
  });

  // Compute responsive font size to match clamp(56px, 7.5vw, 100px)
  const [fontSize, setFontSize] = useState(72);

  useEffect(() => {
    const updateSize = () => {
      const vw = window.innerWidth;
      const fs = Math.min(100, Math.max(56, vw * 0.075));
      setFontSize(fs);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const buildDots = useCallback((text: string, w: number, h: number, fs: number): Dot[] => {
    const positions = sampleText(text, w, h, fs);
    return positions.map((p) => {
      const scatterX = w * 0.6;
      const scatterY = h * 1.5;
      return {
        tx: p.tx,
        ty: p.ty,
        sx: p.tx + (Math.random() - 0.5) * scatterX,
        sy: p.ty - Math.random() * scatterY - 20,
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 2,
        delay: Math.random() * 0.25,
        col: Math.floor(p.tx / DOT_SPACING),
        opacity: 0,
      };
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const state = stateRef.current;

    const loop = (now: number) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const container = containerRef.current;
      const W = container ? container.offsetWidth : canvas.offsetWidth;
      // Canvas height is explicitly much taller than container for particle physics
      const targetCanvasHeight = fontSize * 4.5;
      const H = targetCanvasHeight;
      const dpr = window.devicePixelRatio || 1;

      // Resize canvas if needed
      if (canvas.width !== Math.floor(W * dpr) || canvas.height !== Math.floor(H * dpr)) {
        canvas.width = Math.floor(W * dpr);
        canvas.height = Math.floor(H * dpr);
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Rebuild dots if container resized
      if (!state.initialized || state.lastW !== W || state.lastH !== H) {
        state.dots = buildDots(ROLES[state.roleIndex], W, H, fontSize);
        state.phaseStart = now;
        state.initialized = true;
        state.lastW = W;
        state.lastH = H;
      }

      const elapsed = now - state.phaseStart;

      let phase: 'assemble' | 'hold' | 'red' | 'destroy' | 'clear';
      let phaseT: number;

      if (elapsed < T_ASSEMBLE) {
        phase = 'assemble';
        phaseT = elapsed / T_ASSEMBLE;
      } else if (elapsed < T_ASSEMBLE + T_HOLD) {
        phase = 'hold';
        phaseT = (elapsed - T_ASSEMBLE) / T_HOLD;
      } else if (elapsed < T_ASSEMBLE + T_HOLD + T_RED) {
        phase = 'red';
        phaseT = (elapsed - T_ASSEMBLE - T_HOLD) / T_RED;
      } else if (elapsed < T_ASSEMBLE + T_HOLD + T_RED + T_DESTROY) {
        phase = 'destroy';
        phaseT = (elapsed - T_ASSEMBLE - T_HOLD - T_RED) / T_DESTROY;
      } else if (elapsed < T_TOTAL) {
        phase = 'clear';
        phaseT = (elapsed - T_ASSEMBLE - T_HOLD - T_RED - T_DESTROY) / T_CLEAR;
      } else {
        // Cycle
        state.roleIndex = (state.roleIndex + 1) % ROLES.length;
        state.dots = buildDots(ROLES[state.roleIndex], W, H, fontSize);
        state.phaseStart = now;
        phase = 'assemble';
        phaseT = 0;
      }

      ctx.clearRect(0, 0, W, H);

      const maxCol = Math.max(1, ...state.dots.map((d) => d.col));

      for (const dot of state.dots) {
        switch (phase) {
          case 'assemble': {
            const t = Math.max(0, Math.min(1, (phaseT - dot.delay) / (1 - dot.delay)));
            const e = easeMech(t);
            dot.x = dot.sx + (dot.tx - dot.sx) * e;
            dot.y = dot.sy + (dot.ty - dot.sy) * e;
            dot.opacity = e;
            break;
          }
          case 'hold': {
            dot.x = dot.tx;
            dot.y = dot.ty;
            const breath = Math.sin(phaseT * Math.PI * 2) * 0.08 + 0.92;
            dot.opacity = breath;
            break;
          }
          case 'red': {
            dot.x = dot.tx;
            dot.y = dot.ty;
            dot.opacity = 1;
            break;
          }
          case 'destroy': {
            const colDelay = (dot.col / maxCol) * 0.3;
            const t = Math.max(0, (phaseT - colDelay) / (1 - colDelay));
            if (t <= 0) {
              dot.x = dot.tx;
              dot.y = dot.ty;
              dot.opacity = 1;
            } else {
              const gravity = 350;
              dot.x = dot.tx + dot.vx * t * 10;
              dot.y = dot.ty + dot.vy * t * 5 + 0.5 * gravity * t * t;
              dot.opacity = Math.max(0, 1 - t * 1.4);
            }
            break;
          }
          case 'clear': {
            dot.opacity = 0;
            break;
          }
        }

        if (dot.opacity <= 0.01) continue;

        let color: string;
        if (phase === 'red' || phase === 'destroy') {
          const colDelay = phase === 'destroy' ? (dot.col / maxCol) * 0.3 : 0;
          const t = phase === 'destroy' ? Math.max(0, (phaseT - colDelay) / (1 - colDelay)) : 0;
          color = t > 0.4 ? '#6b0000' : COLOR_RED;
        } else {
          color = COLOR_WHITE;
        }

        ctx.globalAlpha = dot.opacity;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [buildDots, fontSize]);

  // Container height only needs to fit up to 2 lines of text so it doesn't push page content down
  const containerHeight = fontSize * 2.4;
  // Canvas height is much taller to act as a "stage" for the falling dots
  const canvasHeight = fontSize * 4.5;

  return (
    <div ref={containerRef} className="w-full relative overflow-visible" style={{ height: containerHeight }}>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 block w-full pointer-events-none"
        style={{ height: canvasHeight }}
      />
    </div>
  );
}

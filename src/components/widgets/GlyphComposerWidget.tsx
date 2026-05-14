import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Constants ────────────────────────────────────────────────────────────────
const COLS = 11;
const ROWS = 7;
const DOT_SIZE = 18;
const DOT_GAP = 2;
const EASE_MECHANICAL: [number, number, number, number] = [0.4, 0, 0.2, 1];

// ─── Presets ──────────────────────────────────────────────────────────────────
const BLANK = (): number[][] =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const PRESET_PULSE = (): number[][] => {
  const g = BLANK();
  // Diamond pulse pattern
  const cx = 5, cy = 3;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (Math.abs(c - cx) + Math.abs(r - cy) <= 3) g[r][c] = 1;
    }
  }
  return g;
};

const PRESET_CALL = (): number[][] => {
  // Phone / incoming call icon shape
  const pattern = [
    [0,0,0,1,1,1,1,1,0,0,0],
    [0,0,1,0,0,0,0,0,1,0,0],
    [0,1,0,0,0,0,0,0,0,1,0],
    [0,1,0,0,0,0,0,0,0,1,0],
    [0,0,1,0,0,0,0,0,1,0,0],
    [0,0,0,1,1,0,1,1,0,0,0],
    [0,0,0,0,0,1,0,0,0,0,0],
  ];
  return pattern;
};

const PRESET_MUSIC = (): number[][] => {
  // Equalizer bars pattern
  const g = BLANK();
  const heights = [2, 4, 6, 5, 7, 3, 5, 6, 4, 2, 3];
  for (let c = 0; c < COLS; c++) {
    for (let r = ROWS - 1; r >= ROWS - heights[c]; r--) {
      if (r >= 0) g[r][c] = 1;
    }
  }
  return g;
};

const PRESET_CUSTOM1 = (): number[][] => {
  // Nothing logo-like chevron pattern
  const g = BLANK();
  for (let c = 0; c < COLS; c++) {
    const dist = Math.abs(c - 5);
    const row1 = dist;
    const row2 = dist + 1;
    if (row1 < ROWS) g[row1][c] = 1;
    if (row2 < ROWS) g[row2][c] = 1;
  }
  return g;
};

const PRESETS: { name: string; gen: () => number[][] }[] = [
  { name: 'BLANK', gen: BLANK },
  { name: 'PULSE', gen: PRESET_PULSE },
  { name: 'CALL', gen: PRESET_CALL },
  { name: 'MUSIC', gen: PRESET_MUSIC },
  { name: 'CUSTOM', gen: PRESET_CUSTOM1 },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function GlyphComposerWidget() {
  const [grid, setGrid] = useState<number[][]>(PRESET_PULSE);
  const [redMode, setRedMode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [scanKey, setScanKey] = useState(0);
  const [activePreset, setActivePreset] = useState(1);
  const [previewCol, setPreviewCol] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(true);
  const isEditing = useRef(false);
  const editTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const previewInterval = useRef<ReturnType<typeof setInterval>>(undefined);

  // ─── Toggle a dot ──────────────────────────────────────────────────────────
  const toggleDot = useCallback((r: number, c: number) => {
    isEditing.current = true;
    clearTimeout(editTimeout.current);
    editTimeout.current = setTimeout(() => { 
      isEditing.current = false; 
      setScanKey((k) => k + 1); // trigger re-render to resume play if needed
    }, 3000);

    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = next[r][c] ? 0 : 1;
      return next;
    });
    setScanKey((k) => k + 1);
  }, []);

  // ─── Preview animation ─────────────────────────────────────────────────────
  const runPreview = useCallback(() => {
    let col = -1;
    clearInterval(previewInterval.current);
    previewInterval.current = setInterval(() => {
      col++;
      if (col > COLS) col = -1;
      setPreviewCol(col);
    }, 120);
  }, []);

  // Manage play/pause state
  useEffect(() => {
    if (isPlaying && !isEditing.current) {
      runPreview();
    } else {
      clearInterval(previewInterval.current);
      setPreviewCol(COLS); // show full pattern when not playing
    }
    return () => clearInterval(previewInterval.current);
  }, [isPlaying, runPreview, scanKey]);

  // ─── Load preset ───────────────────────────────────────────────────────────
  const loadPreset = useCallback((idx: number) => {
    setActivePreset(idx);
    setGrid(PRESETS[idx].gen());
    setScanKey((k) => k + 1);
    setIsPlaying(true);
  }, []);

  // ─── Export pattern ────────────────────────────────────────────────────────
  const exportPattern = useCallback(() => {
    const json = JSON.stringify({ pattern: grid });
    navigator.clipboard.writeText(json).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  }, [grid]);

  // ─── Dot color ──────────────────────────────────────────────────────────────
  const dotOnColor = redMode ? 'var(--accent-red)' : 'var(--text-primary)';

  // Check if any column in grid has active dots (for preview strip)
  const colHasActive = (c: number): boolean => {
    for (let r = 0; r < ROWS; r++) {
      if (grid[r][c]) return true;
    }
    return false;
  };

  return (
    <div className="bento-card col-span-2 row-span-2 col-start-3 row-start-5 group dot-bg p-4">
      <span className="live-tag">LIVE PREVIEW</span>

      {/* Scanline on dot toggle */}
      <AnimatePresence>
        <motion.div
          key={scanKey}
          initial={{ left: '-120%' }}
          animate={{ left: '120%' }}
          transition={{ duration: 0.5, ease: EASE_MECHANICAL }}
          className="absolute top-0 w-full h-full pointer-events-none z-20"
          style={{
            background: 'linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.035) 50%, transparent 80%)',
          }}
        />
      </AnimatePresence>

      <div className="h-full flex flex-col relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-grotesk font-medium text-[16px] tracking-[0.06em] uppercase text-text-primary">
            GLYPH COMPOSER
          </span>
          <div className="flex items-center gap-[6px]">
            <div className="w-[5px] h-[5px] bg-success animate-pulse-led" style={{ borderRadius: 0 }} />
            <span className="text-meta-sm">LIVE</span>
          </div>
        </div>

        {/* LED Dot-Matrix Grid */}
        <div
          className="flex-shrink-0 mx-auto"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, ${DOT_SIZE}px)`,
            gridTemplateRows: `repeat(${ROWS}, ${DOT_SIZE}px)`,
            gap: `${DOT_GAP}px`,
          }}
        >
          {grid.map((row, r) =>
            row.map((val, c) => {
              const active = val === 1;
              const lit = active && previewCol >= c;
              
              return (
                <motion.button
                  key={`${r}-${c}`}
                  onClick={() => toggleDot(r, c)}
                  animate={{
                    scale: lit ? 1 : 0.85,
                    opacity: lit ? 1 : (active ? 0.2 : 0.05),
                  }}
                  whileTap={{ scale: 0.7 }}
                  transition={{ duration: 0.08, ease: EASE_MECHANICAL }}
                  className="cursor-pointer border-0 p-0"
                  style={{
                    width: DOT_SIZE,
                    height: DOT_SIZE,
                    borderRadius: '50%',
                    background: lit ? dotOnColor : 'var(--border)',
                    border: `1px solid ${lit ? (redMode ? '#a0131a' : 'var(--text-mid)') : 'var(--border-visible)'}`,
                    transition: 'background 80ms, border-color 80ms',
                  }}
                  aria-label={`Dot ${r},${c} ${active ? 'on' : 'off'}`}
                />
              );
            })
          )}
        </div>

        {/* Preview Strip */}
        <div className="flex gap-[2px] mt-3 mx-auto">
          {Array.from({ length: COLS }, (_, c) => {
            const active = colHasActive(c);
            const lit = active && previewCol >= c;
            return (
              <motion.div
                key={c}
                animate={{
                  opacity: lit ? 1 : active ? 0.2 : 0.06,
                  scaleY: lit ? 1 : 0.6,
                }}
                transition={{
                  duration: 0.1,
                  delay: lit ? 0 : 0.05,
                }}
                style={{
                  width: DOT_SIZE,
                  height: 4,
                  background: active ? dotOnColor : 'var(--border)',
                  transformOrigin: 'bottom',
                }}
              />
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col justify-end mt-3 gap-2">
          {/* Presets */}
          <div className="flex gap-[6px] flex-wrap">
            {PRESETS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => loadPreset(i)}
                className="font-mono text-[9px] tracking-[0.08em] uppercase px-[10px] py-[4px] cursor-pointer transition-all duration-150"
                style={{
                  background: activePreset === i ? 'var(--text-primary)' : 'var(--surface-raised)',
                  color: activePreset === i ? 'var(--surface)' : 'var(--text-secondary)',
                  border: `1px solid ${activePreset === i ? 'var(--text-primary)' : 'var(--border-visible)'}`,
                  borderRadius: 0,
                }}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="font-mono text-[9px] tracking-[0.08em] uppercase px-3 py-[5px] cursor-pointer text-text-primary border border-border-visible hover:border-text-secondary transition-colors duration-150"
              style={{
                background: isPlaying ? 'var(--border)' : 'var(--surface-raised)',
                borderRadius: 0,
              }}
            >
              {isPlaying ? 'PAUSE' : 'PLAY'}
            </button>

            {/* Clear */}
            <button
              onClick={() => { setGrid(BLANK()); setActivePreset(0); setScanKey((k) => k + 1); setIsPlaying(false); }}
              className="font-mono text-[9px] tracking-[0.08em] uppercase px-3 py-[5px] cursor-pointer bg-surface-raised text-text-secondary border border-border-visible hover:border-text-disabled transition-colors duration-150"
              style={{ borderRadius: 0 }}
            >
              CLEAR ALL
            </button>

            {/* Export — the ONE place red is allowed */}
            <button
              onClick={exportPattern}
              className="font-mono text-[9px] tracking-[0.08em] uppercase px-3 py-[5px] cursor-pointer text-white transition-colors duration-150"
              style={{
                background: 'var(--accent-red)',
                border: '1px solid var(--accent-red)',
                borderRadius: 0,
              }}
            >
              EXPORT PATTERN
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Glyph Red toggle */}
            <div className="flex items-center gap-[6px]">
              <span className="text-meta-sm">GLYPH RED</span>
              <button
                onClick={() => setRedMode(!redMode)}
                className="relative cursor-pointer"
                style={{
                  width: 28,
                  height: 14,
                  background: redMode ? 'var(--accent-red)' : 'var(--border-visible)',
                  border: 'none',
                  borderRadius: 0,
                  transition: 'background 200ms',
                }}
                aria-label="Toggle Glyph Red mode"
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: redMode ? 14 : 2,
                    width: 10,
                    height: 10,
                    background: redMode ? '#fff' : 'var(--text-disabled)',
                    transition: 'left 200ms, background 200ms',
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: EASE_MECHANICAL }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 font-mono text-[10px] tracking-[0.10em] uppercase px-4 py-[6px]"
            style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-visible)',
              color: 'var(--text-primary)',
            }}
          >
            ■ COPIED
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

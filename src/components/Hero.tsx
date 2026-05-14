import { useRef, useEffect, useState, useCallback } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  AnimatePresence,
} from 'framer-motion';
import DotMatrixRotator from './DotMatrixRotator';

// ─── Constants ────────────────────────────────────────────────────────────────
const IMAGE_URL =
  'https://i.ibb.co/KxFPWCcp/Generate-image-no-202604270914-jpeg-202604271920.jpg';
const FALLBACK_IMAGE = 'https://picsum.photos/id/1062/800/900';
const EASE_MECHANICAL: [number, number, number, number] = [0.4, 0, 0.2, 1];

// ─── Dot-Matrix Canvas (pulsing glyph background) ────────────────────────────
function DotMatrixCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;

      const COLS = Math.floor(W / 12);
      const ROWS = Math.floor(H / 12);
      tRef.current += 0.018;
      const t = tRef.current;

      ctx.clearRect(0, 0, W, H);
      for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS; r++) {
          const wave = Math.sin(t + c * 0.35 + r * 0.28) * 0.5 + 0.5;
          const alpha = wave * 0.11 + 0.02;
          ctx.fillStyle = `rgba(232,232,232,${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(c * 12 + 6, r * 12 + 6, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}

// ─── Scanline Sweep ──────────────────────────────────────────────────────────
function ScanlineOverlay({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="scanline"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: EASE_MECHANICAL }}
          className="absolute inset-0 pointer-events-none z-10 w-[60%]"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
          }}
        />
      )}
    </AnimatePresence>
  );
}

// ─── Pulsing LED Dot ─────────────────────────────────────────────────────────
function LEDDot() {
  return (
    <span className="relative inline-block w-[10px] h-[10px]">
      <motion.span
        animate={{ opacity: [1, 0.25, 1] }}
        transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
        className="block w-2 h-2 rounded-full bg-success absolute top-[1px] left-[1px]"
      />
    </span>
  );
}

// ─── Nothing Button ──────────────────────────────────────────────────────────
interface NothingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  children: React.ReactNode;
}

function NothingButton({ variant = 'primary', children, onClick, ...rest }: NothingButtonProps) {
  const [ripple, setRipple] = useState(false);
  const isPrimary = variant === 'primary';

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      setRipple(true);
      setTimeout(() => setRipple(false), 520);
      onClick?.(e);
    },
    [onClick]
  );

  return (
    <motion.button
      {...(rest as React.ComponentProps<typeof motion.button>)}
      onClick={handleClick}
      whileHover={{ borderColor: 'var(--border-visible)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.12, ease: EASE_MECHANICAL }}
      className={`relative overflow-hidden inline-flex items-center gap-2 px-6 py-3 cursor-pointer font-mono text-[11px] tracking-[0.08em] uppercase select-none border ${isPrimary
        ? 'bg-text-display text-black border-text-display'
        : 'bg-transparent text-text-primary border-border-visible'
        }`}
      style={{ borderRadius: 0 }}
    >
      {/* Scanline hover sweep */}
      <motion.span
        initial={{ x: '-110%', opacity: 0 }}
        whileHover={{ x: '110%', opacity: 1 }}
        transition={{ duration: 0.45, ease: EASE_MECHANICAL }}
        className="absolute inset-0 pointer-events-none w-[60%]"
        style={{
          background: isPrimary
            ? 'linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
        }}
      />

      {/* Dot-matrix dissolve on click */}
      <AnimatePresence>
        {ripple && (
          <motion.span
            key="ripple"
            initial={{ opacity: 0.7, scale: 0.6 }}
            animate={{ opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_MECHANICAL }}
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
              backgroundSize: '6px 6px',
            }}
          />
        )}
      </AnimatePresence>

      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

// ─── Image Column ────────────────────────────────────────────────────────────
function ImageColumn({ scrollY }: { scrollY: ReturnType<typeof useMotionValue<number>> }) {
  const [imgError, setImgError] = useState(false);
  const [scanActive, setScanActive] = useState(false);

  const y = useTransform(scrollY, [0, 600], [0, -48]);
  const springY = useSpring(y, { stiffness: 80, damping: 20 });

  return (
    <motion.div
      style={{ position: 'relative', y: springY }}
      onHoverStart={() => setScanActive(true)}
      onHoverEnd={() => setScanActive(false)}
      className="order-2 lg:order-1"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.1, ease: EASE_MECHANICAL }}
        className="relative rounded-card border border-border overflow-hidden bg-surface"
        style={{ aspectRatio: '4 / 5', maxHeight: 560 }}
      >
        {/* Dot matrix background */}
        <div className="absolute inset-0 z-[1]">
          <DotMatrixCanvas />
        </div>

        {/* Portrait image */}
        <motion.img
          src={imgError ? FALLBACK_IMAGE : IMAGE_URL}
          alt="Rahul Chauhan"
          onError={() => setImgError(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute inset-0 w-full h-full object-cover object-[center_top] z-[2]"
          style={{ mixBlendMode: 'luminosity', filter: 'contrast(1.05) brightness(0.92)' }}
          loading="eager"
        />

        {/* Dot-matrix overlay grid */}
        <div
          className="absolute inset-0 z-[3] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.55) 1px, transparent 1px)',
            backgroundSize: '4px 4px',
          }}
        />

        {/* Scanline on hover */}
        <ScanlineOverlay active={scanActive} />

        {/* Corner brackets */}
        <div className="absolute top-3 left-3 w-5 h-5 border-t-[1.5px] border-l-[1.5px] border-border-visible z-[5]" />
        <div className="absolute bottom-3 right-3 w-5 h-5 border-b-[1.5px] border-r-[1.5px] border-border-visible z-[5]" />

        {/* Bottom meta strip */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-[10px] bg-black/70 flex items-center justify-between z-[5]">
          <span className="font-mono text-[9px] tracking-[0.10em] uppercase text-text-disabled">
            RC — PORTRAIT 2026
          </span>
          <LEDDot />
        </div>
      </motion.div>

      {/* Side rule line (decorative) */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: EASE_MECHANICAL }}
        className="absolute top-6 bottom-6 -left-5 w-px bg-border origin-top hidden lg:block"
      />
    </motion.div>
  );
}

// ─── Text Column ─────────────────────────────────────────────────────────────
function TextColumn({
  dashboardRef,
  scanActive,
}: {
  dashboardRef?: React.RefObject<HTMLElement | null>;
  scanActive: boolean;
}) {
  const scrollToDashboard = useCallback(() => {
    if (dashboardRef?.current) {
      dashboardRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      document.getElementById('dashboard-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dashboardRef]);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.25 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 22, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.65, ease: EASE_MECHANICAL },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col justify-center relative pl-2 order-1 lg:order-2"
    >
      <ScanlineOverlay active={scanActive} />

      {/* Meta */}
      <motion.div variants={itemVariants} className="flex items-center gap-[10px]">
        <span className="w-5 h-px bg-border-visible inline-block flex-shrink-0" />
        <span className="text-meta">PORTFOLIO 2026</span>
      </motion.div>

      {/* Headline */}
      <motion.div variants={itemVariants} className="mt-5 w-full">
        <div className="flex flex-col w-full">
          <div className="flex items-start gap-3">
            <h1
              className="font-doto font-normal tracking-[-0.03em] text-text-display leading-none m-0"
              style={{ fontSize: 'clamp(56px, 7.5vw, 100px)' }}
            >
              Hi, I'm
            </h1>
            <LEDDot />
          </div>
          {/* Animated role rotator — replaces static "Rahul Chauhan" */}
          <div className="w-full max-w-full">
            <DotMatrixRotator />
          </div>
        </div>
      </motion.div>

      {/* Subtitle */}
      <motion.div variants={itemVariants} className="mt-5">
        <p
          className="font-grotesk font-medium text-text-primary tracking-[-0.01em] m-0"
          style={{ fontSize: 'clamp(15px, 1.6vw, 19px)' }}
        >
          Frontend Engineer & Nothing OS Aficionado
        </p>
      </motion.div>

      {/* Bio */}
      <motion.div variants={itemVariants} className="mt-4">
        <p
          className="font-grotesk font-normal text-text-secondary leading-[1.7] max-w-[420px] m-0"
          style={{ fontSize: 'clamp(13px, 1.2vw, 15px)' }}
        >
          I design and build interfaces that feel like hardware. Obsessed with
          industrial minimalism, dot-matrix aesthetics, and mechanical
          micro-interactions.
        </p>
      </motion.div>

      {/* Rule */}
      <motion.div variants={itemVariants} className="mt-8 h-px w-12 bg-border-visible" />

      {/* Tech stack tags */}
      <motion.div variants={itemVariants} className="mt-4 flex gap-4 flex-wrap">
        {['REACT', 'TYPESCRIPT', 'FRAMER MOTION', 'TAILWIND'].map((tag) => (
          <span
            key={tag}
            className="font-mono text-[9px] tracking-[0.10em] text-text-disabled uppercase pb-[2px] border-b border-border"
          >
            {tag}
          </span>
        ))}
      </motion.div>

      {/* Buttons */}
      <motion.div variants={itemVariants} className="mt-9 flex gap-3 flex-wrap">
        <NothingButton variant="primary" onClick={scrollToDashboard}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 1v10M1 6l5 5 5-5" />
          </svg>
          Explore the Dashboard
        </NothingButton>
        <NothingButton variant="ghost">
          View My Work
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 9L9 1M9 1H3M9 1v6" />
          </svg>
        </NothingButton>
      </motion.div>

      {/* Bottom rule */}
      <motion.div variants={itemVariants} className="mt-12 flex items-center gap-3">
        <div className="flex-1 h-px bg-gradient-to-r from-border-visible to-transparent" />
        <span className="font-mono text-[9px] tracking-[0.10em] text-text-disabled">RC — 01</span>
      </motion.div>
    </motion.div>
  );
}

// ─── Hero (main export) ──────────────────────────────────────────────────────
export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [scanActive, setScanActive] = useState(false);

  const { scrollY } = useScroll();
  const rawScrollY = useMotionValue(0);

  useEffect(() => {
    const unsub = scrollY.on('change', (v) => rawScrollY.set(v));
    return unsub;
  }, [scrollY, rawScrollY]);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="w-full relative overflow-hidden py-16"
      style={{ background: 'var(--black)' }}
      onMouseEnter={() => setScanActive(true)}
      onMouseLeave={() => setScanActive(false)}
    >
      {/* Full-bleed scanline */}
      <ScanlineOverlay active={scanActive} />

      {/* Background dot texture */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--surface-raised) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Hairline borders */}
      <div className="absolute top-0 left-0 right-0 h-px bg-border" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />

      {/* Content */}
      <div className="max-w-[1120px] mx-auto px-8 relative z-[1]">
        {/* Nav bar */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_MECHANICAL }}
          className="flex justify-between items-center mb-16"
        >
          <span className="font-doto text-[18px] font-normal tracking-[0.02em] text-text-display">
            RC
          </span>
          <div className="flex gap-8 items-center">
            {['WORK', 'ABOUT', 'CONTACT'].map((item) => (
              <span
                key={item}
                className="font-mono text-[10px] tracking-[0.10em] text-text-secondary cursor-pointer uppercase hover:text-text-primary transition-colors duration-200"
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <ImageColumn scrollY={rawScrollY} />
          <TextColumn scanActive={scanActive} />
        </div>

        {/* Bottom stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.0 }}
          className="mt-16 pt-6 border-t border-border flex gap-10 flex-wrap"
        >
          {[
            { label: 'PROJECTS SHIPPED', value: '24' },
            { label: 'YEARS EXPERIENCE', value: '06' },
            { label: 'OPEN SOURCE CONTRIB', value: '138' },
            { label: 'NOTHING WIDGETS BUILT', value: '12' },
          ].map(({ label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 + i * 0.08, ease: EASE_MECHANICAL }}
              className="flex flex-col gap-1"
            >
              <span className="text-meta-sm">{label}</span>
              <span className="font-doto text-[32px] font-normal tracking-[-0.02em] text-text-display leading-none">
                {value}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

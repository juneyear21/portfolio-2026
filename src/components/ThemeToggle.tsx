import { useStore } from '../store';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { darkMode, toggleTheme } = useStore();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-[200] group/toggle"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-12 h-12 rounded-full bg-surface border border-border hover:border-border-visible flex items-center justify-center cursor-pointer transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
        {/* Scanline sweep on hover */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <div className="hero-btn-scanline" />
        </div>

        {/* Icon */}
        <motion.div
          key={darkMode ? 'moon' : 'sun'}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
          className="relative z-10"
        >
          {darkMode ? (
            <Moon className="w-[18px] h-[18px] text-text-primary" strokeWidth={1.5} />
          ) : (
            <Sun className="w-[18px] h-[18px] text-text-primary" strokeWidth={1.5} />
          )}
        </motion.div>

        {/* Status LED */}
        <div className="absolute -bottom-0.5 -right-0.5 w-[6px] h-[6px] rounded-full bg-success animate-pulse-led" />
      </div>

      {/* Tooltip */}
      <div className="absolute right-14 top-1/2 -translate-y-1/2 opacity-0 group-hover/toggle:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        <div className="bg-surface border border-border rounded-[8px] px-3 py-1.5 font-mono text-[9px] tracking-[0.10em] uppercase text-text-secondary shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
          {darkMode ? 'LIGHT MODE' : 'DARK MODE'}
        </div>
      </div>
    </motion.button>
  );
}

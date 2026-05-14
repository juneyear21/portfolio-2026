import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ComparisonSliderProps {
  children: ReactNode;
}

export default function ComparisonSlider({ children }: ComparisonSliderProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(2, Math.min(98, pct));
    setSliderPos(pct);
  };

  const startDrag = () => {
    isDraggingRef.current = true;
    setIsDragging(true);
  };

  const stopDrag = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  // Apply cursor-ew-resize to body while dragging
  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  useEffect(() => {
    const handleMouseUp = () => stopDrag();
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchEnd = () => stopDrag();
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Dark Layer */}
      <div className="w-full">
        {children}
      </div>

      {/* Light Layer */}
      <div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none theme-light"
        style={{ clipPath: `polygon(${sliderPos}% 0%, 100% 0%, 100% 100%, ${sliderPos}% 100%)` }}
      >
        {children}
      </div>

      {/* Divider & Handle */}
      <div 
        className="absolute top-0 w-[2px] h-full bg-white/90 z-[100] cursor-ew-resize select-none pointer-events-auto"
        style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
        onMouseDown={(e) => { startDrag(); e.preventDefault(); }}
        onTouchStart={() => { startDrag(); }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#111] border-2 border-white flex items-center justify-center text-white shadow-[0_2px_8px_rgba(0,0,0,0.5)] cursor-ew-resize">
          <ChevronLeft className="w-4 h-4 -mr-1" />
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

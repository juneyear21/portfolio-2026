import { useEffect } from 'react';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import ThemeToggle from './components/ThemeToggle';
import { useStore } from './store';

function App() {
  const updateTime = useStore((state) => state.updateTime);
  const tickSystem = useStore((state) => state.tickSystem);
  const driftMetrics = useStore((state) => state.driftMetrics);
  const darkMode = useStore((state) => state.darkMode);

  useEffect(() => {
    const secInterval = setInterval(() => {
      updateTime();
      driftMetrics();
    }, 1000);

    let frameId: number;
    const loop = () => {
      tickSystem();
      frameId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      clearInterval(secInterval);
      cancelAnimationFrame(frameId);
    };
  }, [updateTime, tickSystem, driftMetrics]);

  return (
    <div className={`w-full min-h-screen transition-colors duration-500 ${darkMode ? '' : 'theme-light'}`}
      style={{ background: 'var(--black)' }}
    >
      {/* Fixed Theme Toggle */}
      <ThemeToggle />

      {/* Hero */}
      <Hero />

      {/* Dashboard Section */}
      <section
        id="dashboard-section"
        className="w-full pb-16"
        style={{ background: 'var(--black)' }}
      >
        {/* Section label */}
        <div className="max-w-[1120px] mx-auto px-8 pt-8 flex items-center gap-4 mb-0">
          <span className="font-mono text-[11px] tracking-[0.10em] text-text-disabled uppercase">
            SYSTEM DASHBOARD
          </span>
          <div className="flex-1 h-px bg-border" />
          <span className="font-mono text-[9px] tracking-[0.10em] text-text-disabled">
            LIVE METRICS
          </span>
        </div>

        <div className="relative w-full max-w-[1120px] mx-auto py-4 px-8">
          <Dashboard />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border" style={{ background: 'var(--black)' }}>
        <div className="max-w-[1120px] mx-auto px-8 py-6 flex justify-between items-center flex-wrap gap-4">
          <span className="font-mono text-[9px] tracking-[0.10em] text-text-disabled uppercase">
            © 2026 Rahul Chauhan — Built with Nothing Design Language
          </span>
          <span className="font-doto text-[14px] font-normal tracking-[0.04em] text-text-disabled">
            RC
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;

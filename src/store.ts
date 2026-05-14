import { create } from 'zustand';

interface DashboardState {
  time: Date;
  cpu: number;
  mem: number;
  memTotal: number;
  battery: number;
  charging: boolean;
  temp: number;
  netDown: number;
  netUp: number;
  netHistory: number[];
  cpuHistory: number[];
  focusSec: number;
  focusTotal: number;
  focusPhase: number;
  uptime: number;
  playing: boolean;
  playProgress: number;
  playDuration: number;
  wfPhases: number[];
  wfFreqs: number[];
  ecgPoints: number[];
  ecgIdx: number;
  heatmap: number[][];
  glyphFrame: number;
  glyphMode: number;
  darkMode: boolean;
  togglePlay: () => void;
  toggleTheme: () => void;
  updateTime: () => void;
  tickSystem: () => void;
  driftMetrics: () => void;
}

const generateHeatmap = () => {
  const map: number[][] = [];
  for (let c = 0; c < 36; c++) {
    const col: number[] = [];
    for (let r = 0; r < 5; r++) col.push(Math.floor(Math.random() * 5));
    map.push(col);
  }
  return map;
};

export const useStore = create<DashboardState>((set) => ({
  time: new Date(),
  cpu: 34,
  mem: 6.2,
  memTotal: 16,
  battery: 82,
  charging: false,
  temp: 24,
  netDown: 42.3,
  netUp: 8.1,
  netHistory: Array.from({ length: 20 }, () => Math.random() * 80 + 10),
  cpuHistory: Array.from({ length: 20 }, () => Math.random() * 40 + 15),
  focusSec: 1487,
  focusTotal: 1500,
  focusPhase: 2,
  uptime: 194820,
  playing: true,
  playProgress: 0.38,
  playDuration: 214,
  wfPhases: Array.from({ length: 28 }, () => Math.random() * Math.PI * 2),
  wfFreqs: Array.from({ length: 28 }, () => 0.8 + Math.random() * 1.4),
  ecgPoints: Array.from({ length: 80 }, () => 0),
  ecgIdx: 0,
  heatmap: generateHeatmap(),
  glyphFrame: 0,
  glyphMode: 0,
  darkMode: true,

  togglePlay: () => set((state) => ({ playing: !state.playing })),
  toggleTheme: () => set((state) => ({ darkMode: !state.darkMode })),
  
  updateTime: () => set((state) => ({
    time: new Date(),
    uptime: state.uptime + 1,
    focusSec: state.focusSec > 0 ? state.focusSec - 1 : 1500,
  })),

  tickSystem: () => set((state) => {
    let playProgress = state.playProgress;
    if (state.playing) {
      playProgress = Math.min(1, state.playProgress + 1 / state.playDuration / 60);
      if (playProgress >= 1) playProgress = 0;
    }
    return { playProgress, glyphFrame: state.glyphFrame + 1 };
  }),

  driftMetrics: () => set((state) => {
    const cpu = Math.max(5, Math.min(95, state.cpu + (Math.random() - 0.5) * 6));
    const cpuHistory = [...state.cpuHistory, cpu];
    if (cpuHistory.length > 20) cpuHistory.shift();

    const mem = Math.max(2, Math.min(14, state.mem + (Math.random() - 0.5) * 0.3));

    return { cpu, cpuHistory, mem };
  }),
}));

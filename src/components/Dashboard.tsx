import ClockWidget from './widgets/ClockWidget';
import WeatherWidget from './widgets/WeatherWidget';
import BatteryWidget from './widgets/BatteryWidget';
import NowPlayingWidget from './widgets/NowPlayingWidget';
import CPUWidget from './widgets/CPUWidget';
import MemoryWidget from './widgets/MemoryWidget';
import GlyphWidget from './widgets/GlyphWidget';
import FocusWidget from './widgets/FocusWidget';
import HeatmapWidget from './widgets/HeatmapWidget';
import ECGWidget from './widgets/ECGWidget';
import TickerWidget from './widgets/TickerWidget';
import GlyphComposerWidget from './widgets/GlyphComposerWidget';
import AmbientAQI from './widgets/AmbientAQI';

export default function Dashboard() {
  return (
    <div className="bento-grid">
      <ClockWidget />
      <WeatherWidget />
      <BatteryWidget />
      <NowPlayingWidget />
      <CPUWidget />
      <MemoryWidget />
      <GlyphWidget />
      <FocusWidget />
      <HeatmapWidget />
      <ECGWidget />
      <TickerWidget />
      <GlyphComposerWidget />
      <AmbientAQI />
    </div>
  );
}

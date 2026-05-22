// MetricCard — Individual metric display with glow and severity colors
import {
  Thermometer, Zap, Activity, Heart, RotateCw, Battery, Gauge,
} from 'lucide-react';
import { getSeverity, getSeverityColors, formatValue } from '../utils/helpers';

const ICON_MAP = {
  Thermometer,
  Zap,
  Activity,
  Heart,
  RotateCw,
  Battery,
  Gauge,
};

export default function MetricCard({ metricKey, value, config, index }) {
  const severity = getSeverity(metricKey, value);
  const colors = getSeverityColors(severity);
  const Icon = ICON_MAP[config.icon] || Activity;

  const displayValue = metricKey === 'vibration'
    ? Math.round(value)
    : metricKey === 'rpm'
    ? Math.round(value)
    : formatValue(value);

  // Percentage for the mini bar indicator
  const percentage = Math.min(100, Math.max(0,
    ((value - (config.min || 0)) / ((config.max || 100) - (config.min || 0))) * 100
  ));

  return (
    <div
      id={`metric-${metricKey}`}
      className={`glass-card p-4 sm:p-5 ${colors.glow} animate-fade-in`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${colors.text}`} />
        </div>
        <span className={`text-[10px] font-mono uppercase tracking-wider ${colors.text} opacity-80`}>
          {severity}
        </span>
      </div>

      <div className="mb-1">
        <span className={`metric-value text-2xl sm:text-3xl ${colors.text}`}>
          {displayValue}
        </span>
        <span className="text-gray-500 text-sm ml-1.5">{config.unit}</span>
      </div>

      <p className="text-gray-400 text-xs mb-3 tracking-wide">{config.name}</p>

      {/* Mini progress bar */}
      <div className="h-1 bg-navy-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${config.thresholds.inverse ? 100 - percentage : percentage}%`,
            background: colors.hex,
            boxShadow: `0 0 8px ${colors.hex}40`,
          }}
        />
      </div>
    </div>
  );
}

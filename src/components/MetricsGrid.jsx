// MetricsGrid — Responsive grid of all metric cards
import MetricCard from './MetricCard';
import { METRICS } from '../utils/constants';

export default function MetricsGrid({ motorData }) {
  if (!motorData) return null;

  const metricEntries = [
    ['temperature', motorData.temperature],
    ['current', motorData.current],
    ['vibration', motorData.vibration],
    ['health', motorData.health],
  ];

  return (
    <div id="metrics-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {metricEntries.map(([key, value], index) => (
        <MetricCard
          key={key}
          metricKey={key}
          value={value}
          config={METRICS[key]}
          index={index}
        />
      ))}
    </div>
  );
}

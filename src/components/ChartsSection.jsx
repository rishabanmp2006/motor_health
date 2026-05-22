// ChartsSection — Grid of live charts
import LiveChart from './LiveChart';

export default function ChartsSection({ history }) {
  return (
    <div id="charts-section" className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <LiveChart
        title="Temperature vs Time"
        data={history.temperature}
        color="#22d3ee"
        unit="°C"
        domain={[0, 160]}
      />
      <LiveChart
        title="Current vs Time"
        data={history.current}
        color="#fbbf24"
        unit="A"
        domain={[0, 45]}
      />
      <LiveChart
        title="Health vs Time"
        data={history.health}
        color="#4ade80"
        unit="%"
        domain={[0, 105]}
      />
    </div>
  );
}

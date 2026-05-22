// Dashboard — Main monitoring dashboard layout
import Header from './Header';
import MetricsGrid from './MetricsGrid';
import ChartsSection from './ChartsSection';
import MotorStatus from './MotorStatus';
import AlertPanel from './AlertPanel';
import AIPrediction from './AIPrediction';
import ActivityFeed from './ActivityFeed';
import { Sliders } from 'lucide-react';

export default function Dashboard({ motorData, isConnected, alerts, activityFeed, history }) {
  return (
    <div className="dashboard-bg min-h-screen pb-8">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 pt-4">
        <Header isConnected={isConnected} motorData={motorData} />

        {/* Metrics */}
        <MetricsGrid motorData={motorData} />

        {/* Charts */}
        <ChartsSection history={history} />

        {/* Bottom Section: Status + Alerts + AI + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          {/* Motor Status */}
          <div className="lg:col-span-3">
            <MotorStatus motorData={motorData} />
          </div>

          {/* Alert Panel */}
          <div className="lg:col-span-3">
            <AlertPanel alerts={alerts} />
          </div>

          {/* AI Predictions */}
          <div className="lg:col-span-3">
            <AIPrediction motorData={motorData} />
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-3">
            <ActivityFeed feed={activityFeed} />
          </div>
        </div>

        {/* Control Panel Link (visible on desktop) */}
        <div className="text-center mb-4">
          <a
            href="/control"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 transition-all"
          >
            <Sliders className="w-4 h-4" />
            Open Sensor Control Panel
          </a>
        </div>

        {/* Footer */}
        <footer className="text-center py-4 border-t border-white/5">
          <p className="text-[10px] text-gray-600 font-mono">
            AI Predictive Maintenance System v2.0 • Real-time Motor Health Monitoring • WebSocket Connected
          </p>
        </footer>
      </div>
    </div>
  );
}

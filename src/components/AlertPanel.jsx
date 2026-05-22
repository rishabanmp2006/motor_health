// AlertPanel — Scrollable alert history with severity colors
import { AlertTriangle, Bell, Info, AlertOctagon, XOctagon } from 'lucide-react';
import { SEVERITY_COLORS } from '../utils/constants';
import { formatTimestamp } from '../utils/helpers';

const SEVERITY_ICONS = {
  info: Info,
  warning: AlertTriangle,
  danger: AlertOctagon,
  critical: XOctagon,
};

export default function AlertPanel({ alerts }) {
  return (
    <div id="alert-panel" className="glass-card-static p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
            Alert History
          </h3>
        </div>
        {alerts.length > 0 && (
          <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-mono">
            {alerts.length}
          </span>
        )}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Info className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">No alerts</p>
            <p className="text-gray-700 text-xs">System operating normally</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const severityStyle = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.info;
            const Icon = SEVERITY_ICONS[alert.severity] || Info;

            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg ${severityStyle.bg} border ${severityStyle.border} animate-fade-in`}
              >
                {/* Severity bar */}
                <div className={`w-1 self-stretch rounded-full ${severityStyle.bar} flex-shrink-0`} />

                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${severityStyle.text}`} />

                <div className="flex-1 min-w-0">
                  <p className={`text-xs ${severityStyle.text} leading-relaxed`}>
                    {alert.message}
                  </p>
                  <p className="text-[10px] text-gray-600 font-mono mt-1">
                    {formatTimestamp(alert.timestamp)}
                  </p>
                </div>

                <span className={`text-[9px] uppercase font-bold tracking-wider ${severityStyle.text} flex-shrink-0`}>
                  {alert.severity}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

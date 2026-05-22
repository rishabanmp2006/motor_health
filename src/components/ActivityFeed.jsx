// ActivityFeed — Compact live feed of system events
import { Radio, Info, AlertTriangle, AlertOctagon, XOctagon } from 'lucide-react';
import { formatTimestamp } from '../utils/helpers';

const TYPE_CONFIG = {
  info: { icon: Info, color: 'text-cyan-400' },
  warning: { icon: AlertTriangle, color: 'text-amber-400' },
  danger: { icon: AlertOctagon, color: 'text-orange-400' },
  critical: { icon: XOctagon, color: 'text-red-400' },
};

export default function ActivityFeed({ feed }) {
  return (
    <div id="activity-feed" className="glass-card-static p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Radio className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
          Live Activity
        </h3>
        <span className="relative flex h-2 w-2 ml-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
        </span>
      </div>

      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
        {(!feed || feed.length === 0) ? (
          <p className="text-gray-600 text-xs text-center py-4">No activity yet</p>
        ) : (
          feed.map((item) => {
            const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.info;
            const Icon = config.icon;

            return (
              <div key={item.id} className="flex items-start gap-2 py-1.5 px-2 rounded hover:bg-white/[0.02] transition-colors">
                <Icon className={`w-3 h-3 mt-0.5 flex-shrink-0 ${config.color}`} />
                <p className="text-[11px] text-gray-400 leading-relaxed flex-1">
                  {item.message}
                </p>
                <span className="text-[9px] text-gray-600 font-mono flex-shrink-0">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

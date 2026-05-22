// MotorStatus — Large status display with blinking on critical states
import {
  CheckCircle2, AlertTriangle, Thermometer, Zap, Activity,
  AlertOctagon, XOctagon, ShieldAlert,
} from 'lucide-react';
import { STATUS_CONFIG } from '../utils/constants';

const ICON_MAP = {
  CheckCircle2,
  AlertTriangle,
  Thermometer,
  Zap,
  Activity,
  AlertOctagon,
  XOctagon,
  ShieldAlert,
};

export default function MotorStatus({ motorData }) {
  if (!motorData) return null;

  const status = motorData.status || 'NORMAL';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['NORMAL'];
  const Icon = ICON_MAP[config.icon] || ShieldAlert;

  const isCritical = status === 'CRITICAL FAILURE RISK' || status === 'BEARING FAILURE PREDICTED';

  return (
    <div id="motor-status" className={`glass-card-static p-5 sm:p-6 ${config.bgClass} ${isCritical ? 'animate-blink-critical' : ''}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-cyan-400" />
        <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
          Motor Status
        </h3>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
          isCritical ? 'bg-red-500/20' : config.color === 'green' ? 'bg-green-500/10' : 'bg-amber-500/10'
        }`}>
          <Icon className={`w-7 h-7 ${
            config.color === 'green' ? 'text-green-400' :
            config.color === 'amber' ? 'text-amber-400' : 'text-red-400'
          }`} />
        </div>
        <div>
          <h2 className={`text-xl sm:text-2xl font-bold font-mono tracking-wide ${
            config.color === 'green' ? 'text-green-400' :
            config.color === 'amber' ? 'text-amber-400' : 'text-red-400'
          }`}>
            {status}
          </h2>
          <p className="text-gray-500 text-xs mt-1">{config.description}</p>
        </div>
      </div>

      {/* Status indicators */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="bg-navy-900/50 rounded-lg px-3 py-2">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Health</p>
          <p className={`text-sm font-bold font-mono ${
            motorData.health > 70 ? 'text-green-400' : motorData.health > 40 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {motorData.health?.toFixed(1)}%
          </p>
        </div>
        <div className="bg-navy-900/50 rounded-lg px-3 py-2">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Efficiency</p>
          <p className={`text-sm font-bold font-mono ${
            motorData.efficiency > 70 ? 'text-cyan-400' : motorData.efficiency > 50 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {motorData.efficiency?.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}

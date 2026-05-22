// Header — Title, live clock, connection status, health badge, uptime
import { useState, useEffect } from 'react';
import { Shield, Wifi, WifiOff, Clock, Activity } from 'lucide-react';
import { formatUptime } from '../utils/helpers';

export default function Header({ isConnected, motorData }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const health = motorData?.health ?? 100;
  const healthColor =
    health > 70 ? 'text-green-400' : health > 40 ? 'text-amber-400' : 'text-red-400';
  const healthBg =
    health > 70 ? 'status-normal' : health > 40 ? 'status-warning' : 'status-critical';

  return (
    <header className="glass-card-static px-4 sm:px-6 py-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 id="app-title" className="text-lg sm:text-xl font-bold text-white tracking-wide">
              AI Predictive Maintenance System
            </h1>
            <p className="text-[10px] text-gray-500 tracking-widest uppercase font-mono">
              Industrial Motor Health Monitor
            </p>
          </div>
        </div>

        {/* Right section: clock, connection, health */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {/* Uptime */}
          {motorData && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400">
              <Activity className="w-3.5 h-3.5 text-cyan-500" />
              <span>{formatUptime(motorData.uptime || 0)}</span>
            </div>
          )}

          {/* Clock */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400">
            <Clock className="w-3.5 h-3.5 text-cyan-500" />
            <span>
              {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
              {time.toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </div>

          {/* Connection status */}
          <div
            id="connection-status"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              isConnected
                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                : 'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}
          >
            <div className={`relative w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}>
              {isConnected && (
                <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-40" />
              )}
            </div>
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3" />
                <span>Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Health badge */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${healthBg}`}>
            <span className={healthColor}>⬤</span>{' '}
            <span className={healthColor}>{health.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </header>
  );
}

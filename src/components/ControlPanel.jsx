// ControlPanel — Mobile-friendly sensor control page
import { useState } from 'react';
import {
  Thermometer, Zap, Activity, AlertTriangle,
  XOctagon, RotateCcw, OctagonX, Wifi, WifiOff,
  Plus, Minus, ChevronLeft, Settings,
} from 'lucide-react';

export default function ControlPanel({ sendCommand, isConnected, motorData }) {
  const [lastAction, setLastAction] = useState('');

  const handleCommand = (action, label) => {
    sendCommand(action);
    setLastAction(label);
    setTimeout(() => setLastAction(''), 1500);
  };

  const SectionTitle = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-3 mt-6 first:mt-0">
      <Icon className="w-4 h-4 text-cyan-400" />
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
    </div>
  );

  const ActionButton = ({ label, icon: Icon, color, action, fullWidth, size = 'normal' }) => {
    const colorClasses = {
      cyan: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 active:bg-cyan-500/35',
      green: 'bg-green-500/15 border-green-500/30 text-green-400 hover:bg-green-500/25 active:bg-green-500/35',
      amber: 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25 active:bg-amber-500/35',
      orange: 'bg-orange-500/15 border-orange-500/30 text-orange-400 hover:bg-orange-500/25 active:bg-orange-500/35',
      red: 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25 active:bg-red-500/35',
      blue: 'bg-blue-500/15 border-blue-500/30 text-blue-400 hover:bg-blue-500/25 active:bg-blue-500/35',
    };

    return (
      <button
        onClick={() => handleCommand(action, label)}
        className={`control-btn ${colorClasses[color]} border rounded-xl font-semibold
          ${fullWidth ? 'w-full' : ''} 
          ${size === 'large' ? 'py-5 text-base' : 'py-3.5 text-sm'}
          flex items-center justify-center gap-2 transition-all`}
      >
        {Icon && <Icon className="w-5 h-5" />}
        {label}
      </button>
    );
  };

  return (
    <div className="dashboard-bg min-h-screen pb-8">
      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="glass-card-static px-4 py-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/" className="w-9 h-9 rounded-lg bg-navy-700 flex items-center justify-center hover:bg-navy-600 transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </a>
              <div>
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-cyan-400" />
                  <h1 className="text-base font-bold text-white">Sensor Control Panel</h1>
                </div>
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider ml-6">
                  Simulated Sensor Input
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
              isConnected
                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                : 'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isConnected ? 'Live' : 'Offline'}
            </div>
          </div>
        </div>

        {/* Action feedback */}
        {lastAction && (
          <div className="mb-3 py-2 px-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-center text-xs text-cyan-400 font-mono animate-fade-in">
            ✓ {lastAction}
          </div>
        )}

        {/* Live Values */}
        {motorData && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'TEMP', value: `${motorData.temperature?.toFixed(1)}°`, color: motorData.temperature > 80 ? 'text-amber-400' : 'text-cyan-400' },
              { label: 'AMP', value: `${motorData.current?.toFixed(1)}A`, color: motorData.current > 15 ? 'text-amber-400' : 'text-cyan-400' },
              { label: 'VIB', value: `L${motorData.vibration}`, color: motorData.vibration >= 3 ? 'text-red-400' : 'text-cyan-400' },
            ].map((item) => (
              <div key={item.label} className="glass-card-static rounded-xl p-3 text-center">
                <p className="text-[9px] text-gray-500 font-mono uppercase">{item.label}</p>
                <p className={`text-lg font-bold font-mono ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Temperature Controls */}
        <SectionTitle icon={Thermometer} title="Temperature" />
        <div className="grid grid-cols-2 gap-3">
          <ActionButton label="Temp +" icon={Plus} color="amber" action="temp_up" />
          <ActionButton label="Temp −" icon={Minus} color="cyan" action="temp_down" />
        </div>

        {/* Current Controls */}
        <SectionTitle icon={Zap} title="Current" />
        <div className="grid grid-cols-2 gap-3">
          <ActionButton label="Current +" icon={Plus} color="amber" action="current_up" />
          <ActionButton label="Current −" icon={Minus} color="cyan" action="current_down" />
        </div>

        {/* Vibration Controls */}
        <SectionTitle icon={Activity} title="Vibration Level" />
        <div className="grid grid-cols-3 gap-3">
          <ActionButton label="Level 1" color="green" action="vibration_1" />
          <ActionButton label="Level 2" color="amber" action="vibration_2" />
          <ActionButton label="Level 3" color="red" action="vibration_3" />
        </div>

        {/* Special Actions */}
        <SectionTitle icon={AlertTriangle} title="Special Actions" />
        <div className="space-y-3">
          <ActionButton label="Trigger Overload" icon={AlertTriangle} color="orange" action="trigger_overload" fullWidth />
          <ActionButton label="Trigger Critical Failure" icon={XOctagon} color="red" action="trigger_critical" fullWidth />
          <ActionButton label="Reset System" icon={RotateCcw} color="blue" action="reset_system" fullWidth />
          <ActionButton label="EMERGENCY STOP" icon={OctagonX} color="red" action="emergency_stop" fullWidth size="large" />
        </div>

        <p className="text-center text-[10px] text-gray-600 mt-6 font-mono">
          Sensor Simulator v2.0 • Controls connected via WebSocket
        </p>
      </div>
    </div>
  );
}

// Loading Screen — Displayed during app initialization
import { useState, useEffect } from 'react';
import { Settings, Shield } from 'lucide-react';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing system...');
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const steps = [
      { at: 15, text: 'Connecting to motor sensors...' },
      { at: 35, text: 'Loading AI prediction models...' },
      { at: 55, text: 'Establishing WebSocket link...' },
      { at: 75, text: 'Calibrating health algorithms...' },
      { at: 90, text: 'System ready.' },
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 3 + 1;
        const step = steps.find((s) => prev < s.at && next >= s.at);
        if (step) setStatusText(step.text);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => setFadeOut(true), 400);
          setTimeout(() => onComplete(), 900);
          return 100;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className={`loading-screen fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Logo and spinner */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-2 border-cyan-500/20 flex items-center justify-center">
          <Settings className="w-12 h-12 text-cyan-400 loading-gear" />
        </div>
        <div className="absolute inset-0 w-24 h-24 rounded-full border-t-2 border-cyan-400 animate-spin" />
      </div>

      {/* Title */}
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-6 h-6 text-cyan-400" />
        <h1 className="text-2xl font-bold text-white tracking-wide">
          AI Predictive Maintenance
        </h1>
      </div>
      <p className="text-cyan-400/60 text-sm mb-10 tracking-widest uppercase">
        Industrial Motor Monitoring v2.0
      </p>

      {/* Progress bar */}
      <div className="w-72 mb-4">
        <div className="h-1 bg-navy-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status text */}
      <p className="text-cyan-400/50 text-xs font-mono tracking-wider">
        {statusText}
      </p>
      <p className="text-gray-600 text-xs font-mono mt-2">
        {Math.round(progress)}%
      </p>
    </div>
  );
}

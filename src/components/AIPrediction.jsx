// AIPrediction — Futuristic AI prediction section
import { Brain, TrendingDown, Wrench, Shield, Sparkles } from 'lucide-react';
import { formatLife } from '../utils/helpers';

export default function AIPrediction({ motorData }) {
  if (!motorData) return null;

  const failureProb = motorData.failureProb || 0;
  const probColor =
    failureProb < 30 ? 'text-green-400' : failureProb < 60 ? 'text-amber-400' : 'text-red-400';
  const probBarColor =
    failureProb < 30 ? 'bg-green-400' : failureProb < 60 ? 'bg-amber-400' : 'bg-red-400';

  const confidence = motorData.confidence || 0;

  return (
    <div id="ai-prediction" className="glass-card-static p-5 sm:p-6 neural-bg scan-line-overlay gradient-border relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <span className="ai-badge flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          AI Engine
        </span>
        <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
          Predictive Analysis
        </h3>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Predicted Motor Life */}
        <div className="bg-navy-900/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-violet-400" />
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Predicted Life</p>
          </div>
          <p className="text-2xl font-bold font-mono text-violet-400">
            {formatLife(motorData.predictedLife || 0)}
          </p>
          <p className="text-[10px] text-gray-600 mt-1">
            {motorData.predictedLife || 0} hours remaining
          </p>
        </div>

        {/* Failure Probability */}
        <div className="bg-navy-900/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Failure Risk</p>
          </div>
          <p className={`text-2xl font-bold font-mono ${probColor}`}>
            {failureProb}%
          </p>
          <div className="mt-2 h-1.5 bg-navy-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${probBarColor}`}
              style={{ width: `${failureProb}%`, boxShadow: `0 0 8px ${failureProb > 60 ? '#ef444460' : failureProb > 30 ? '#fbbf2440' : '#4ade8040'}` }}
            />
          </div>
        </div>

        {/* Maintenance Recommendation */}
        <div className="bg-navy-900/50 rounded-xl p-4 col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-4 h-4 text-cyan-400" />
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Maintenance Recommendation</p>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            {motorData.recommendation || 'Continue monitoring.'}
          </p>
        </div>

        {/* AI Confidence Score */}
        <div className="bg-navy-900/50 rounded-xl p-4 col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">AI Confidence</p>
            </div>
            <span className="text-lg font-bold font-mono text-cyan-400">{confidence}%</span>
          </div>
          <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-700"
              style={{ width: `${confidence}%`, boxShadow: '0 0 10px rgba(6, 182, 212, 0.4)' }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[9px] text-gray-600 font-mono">Low</span>
            <span className="text-[9px] text-gray-600 font-mono">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}

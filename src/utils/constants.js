// Metric thresholds and configuration constants

export const METRICS = {
  temperature: {
    name: 'Temperature',
    unit: '°C',
    icon: 'Thermometer',
    thresholds: { warning: 80, danger: 100 },
    min: 20,
    max: 150,
  },
  current: {
    name: 'Current',
    unit: 'A',
    icon: 'Zap',
    thresholds: { warning: 15, danger: 25 },
    min: 0,
    max: 40,
  },
  vibration: {
    name: 'Vibration',
    unit: 'Level',
    icon: 'Activity',
    thresholds: { warning: 2, danger: 3 },
    min: 1,
    max: 3,
  },
  health: {
    name: 'Motor Health',
    unit: '%',
    icon: 'Heart',
    thresholds: { warning: 60, danger: 30, inverse: true },
    min: 0,
    max: 100,
  },
  rpm: {
    name: 'RPM',
    unit: 'rpm',
    icon: 'RotateCw',
    thresholds: { warning: 3500, danger: 4500 },
    min: 0,
    max: 5000,
  },
  power: {
    name: 'Power',
    unit: 'kW',
    icon: 'Battery',
    thresholds: { warning: 15, danger: 25 },
    min: 0,
    max: 30,
  },
  efficiency: {
    name: 'Efficiency',
    unit: '%',
    icon: 'Gauge',
    thresholds: { warning: 70, danger: 50, inverse: true },
    min: 0,
    max: 100,
  },
};

export const STATUS_CONFIG = {
  'NORMAL': {
    color: 'green',
    bgClass: 'status-normal',
    glowClass: 'glow-green',
    icon: 'CheckCircle2',
    description: 'All systems operating within normal parameters',
  },
  'WARNING': {
    color: 'amber',
    bgClass: 'status-warning',
    glowClass: 'glow-amber',
    icon: 'AlertTriangle',
    description: 'Parameters approaching warning thresholds',
  },
  'HIGH TEMPERATURE': {
    color: 'amber',
    bgClass: 'status-warning',
    glowClass: 'glow-amber',
    icon: 'Thermometer',
    description: 'Motor temperature exceeds safe operating range',
  },
  'OVERLOAD DETECTED': {
    color: 'red',
    bgClass: 'status-danger',
    glowClass: 'glow-red',
    icon: 'Zap',
    description: 'Electrical overload detected — reduce load immediately',
  },
  'ABNORMAL VIBRATION': {
    color: 'red',
    bgClass: 'status-danger',
    glowClass: 'glow-red',
    icon: 'Activity',
    description: 'Excessive vibration detected — check bearings and alignment',
  },
  'BEARING FAILURE PREDICTED': {
    color: 'red',
    bgClass: 'status-critical',
    glowClass: 'glow-red',
    icon: 'AlertOctagon',
    description: 'AI predicts imminent bearing failure',
  },
  'CRITICAL FAILURE RISK': {
    color: 'red',
    bgClass: 'status-critical',
    glowClass: 'glow-red',
    icon: 'XOctagon',
    description: 'CRITICAL: Motor at high risk of catastrophic failure',
  },
};

export const SEVERITY_COLORS = {
  info: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', bar: 'severity-bar-info' },
  warning: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', bar: 'severity-bar-warning' },
  danger: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', bar: 'severity-bar-danger' },
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', bar: 'severity-bar-critical' },
};

export const WS_URL = 'ws://localhost:3001';

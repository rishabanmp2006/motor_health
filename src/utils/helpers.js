// Helper utilities for formatting, severity calculation, etc.

import { METRICS } from './constants';

/**
 * Get severity level for a metric value
 * Returns: 'normal', 'warning', or 'danger'
 */
export function getSeverity(metricKey, value) {
  const metric = METRICS[metricKey];
  if (!metric) return 'normal';

  const { warning, danger, inverse } = metric.thresholds;

  if (inverse) {
    // Lower is worse (health, efficiency)
    if (value <= danger) return 'danger';
    if (value <= warning) return 'warning';
    return 'normal';
  } else {
    // Higher is worse (temperature, current, etc.)
    if (value >= danger) return 'danger';
    if (value >= warning) return 'warning';
    return 'normal';
  }
}

/**
 * Get color classes based on severity
 */
export function getSeverityColors(severity) {
  const colors = {
    normal: {
      text: 'text-green-400',
      bg: 'bg-green-500/10',
      glow: 'glow-green',
      hex: '#4ade80',
    },
    warning: {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      glow: 'glow-amber',
      hex: '#fbbf24',
    },
    danger: {
      text: 'text-red-400',
      bg: 'bg-red-500/10',
      glow: 'glow-red',
      hex: '#ef4444',
    },
  };
  return colors[severity] || colors.normal;
}

/**
 * Format a numeric value
 */
export function formatValue(value, decimals = 1) {
  if (value === undefined || value === null) return '—';
  return Number(value).toFixed(decimals);
}

/**
 * Format time string for charts (HH:MM:SS)
 */
export function getTimeString(date = new Date()) {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format uptime from seconds to readable string
 */
export function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Format timestamp for alerts
 */
export function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format predicted life hours to readable string
 */
export function formatLife(hours) {
  if (hours <= 0) return 'Imminent';
  if (hours < 24) return `${hours}h`;
  if (hours < 720) return `${Math.round(hours / 24)}d`;
  if (hours < 8760) return `${(hours / 720).toFixed(1)}mo`;
  return `${(hours / 8760).toFixed(1)}yr`;
}

/**
 * Play a beep sound for critical alerts
 */
export function playAlertBeep() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.value = 880;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    // Audio not available
  }
}

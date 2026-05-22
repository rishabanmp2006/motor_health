// Alert Manager — multi-level warnings + WhatsApp (CallMeBot) via axios

import axios from 'axios';
import { getWarningLevel } from './motorLogic.js';

const MAX_ALERTS = 50;
const WHATSAPP_COOLDOWN_MS = 60_000;

const LEVEL_RANK = { NORMAL: 0, LEVEL_1: 1, LEVEL_2: 2, CRITICAL: 3 };

let alerts = [];
let alertIdCounter = 0;
let lastWhatsAppSentAt = 0;
const whatsappCooldownKeys = new Set();
let previousWarningLevel = 'NORMAL';

const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE || 'YOUR_PHONE';
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY || 'YOUR_API_KEY';

function getSeverityForLevel(level) {
  const map = {
    NORMAL: 'info',
    LEVEL_1: 'warning',
    LEVEL_2: 'danger',
    CRITICAL: 'critical',
  };
  return map[level] || 'info';
}

function pushAlert(alert, newAlerts) {
  alerts.unshift(alert);
  newAlerts.push(alert);
  if (alerts.length > MAX_ALERTS) {
    alerts = alerts.slice(0, MAX_ALERTS);
  }
}

function canSendWhatsApp(cooldownKey) {
  const now = Date.now();
  if (now - lastWhatsAppSentAt < WHATSAPP_COOLDOWN_MS) return false;
  if (whatsappCooldownKeys.has(cooldownKey)) return false;
  return true;
}

function markWhatsAppSent(cooldownKey) {
  lastWhatsAppSentAt = Date.now();
  whatsappCooldownKeys.add(cooldownKey);
  setTimeout(() => whatsappCooldownKeys.delete(cooldownKey), WHATSAPP_COOLDOWN_MS);
}

export function buildLevel2WhatsAppMessage(motorData) {
  return (
    `⚠ LEVEL 2 WARNING\n\n` +
    `Temperature: ${motorData.temperature.toFixed(0)}°C\n` +
    `Current: ${motorData.current.toFixed(0)}A\n\n` +
    `Motor entering overload condition.`
  );
}

export function buildCriticalWhatsAppMessage(motorData) {
  return (
    `⚠ CRITICAL FAILURE\n\n` +
    `Temperature: ${motorData.temperature.toFixed(0)}°C\n` +
    `Current: ${motorData.current.toFixed(0)}A\n` +
    `Health: ${motorData.health.toFixed(0)}%\n\n` +
    `Immediate inspection required.`
  );
}

export async function sendWhatsAppAlert(message, cooldownKey = 'default') {
  const phone = WHATSAPP_PHONE;
  const apiKey = WHATSAPP_API_KEY;

  if (!canSendWhatsApp(cooldownKey)) {
    console.log(`[WhatsApp] Skipped (cooldown): key=${cooldownKey}`);
    return { sent: false, reason: 'cooldown' };
  }

  const notConfigured =
    !phone ||
    phone === 'YOUR_PHONE' ||
    !apiKey ||
    apiKey === 'YOUR_API_KEY';

  if (notConfigured) {
    console.log(`[WhatsApp] Not configured — would send:\n${message}`);
    console.log('[WhatsApp] Set YOUR_PHONE and YOUR_API_KEY in alertManager.js or env vars');
    return { sent: false, reason: 'not_configured' };
  }

  const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;

  try {
    const response = await axios.get('https://api.callmebot.com/whatsapp.php', {
      params: {
        phone: normalizedPhone,
        text: message,
        apikey: apiKey,
      },
      timeout: 15_000,
      validateStatus: () => true,
    });

    const body =
      typeof response.data === 'string'
        ? response.data
        : JSON.stringify(response.data);

    if (response.status >= 200 && response.status < 300) {
      console.log('[WhatsApp] Alert sent successfully');
      console.log(`[WhatsApp] Response (${response.status}):`, body.slice(0, 120));
      markWhatsAppSent(cooldownKey);
      return { sent: true, status: response.status };
    }

    console.error('[WhatsApp] API error — HTTP', response.status);
    console.error('[WhatsApp] Response body:', body);
    return { sent: false, reason: 'http_error', status: response.status, body };
  } catch (error) {
    const detail = error.response?.data ?? error.message;
    console.error('[WhatsApp] API request failed:', detail);
    if (error.code) console.error('[WhatsApp] Error code:', error.code);
    return { sent: false, reason: 'error', error: error.message };
  }
}

/**
 * Progressive escalation alerts — only on level increase (NORMAL → L1 → L2 → CRITICAL)
 */
export async function checkAndGenerateAlerts(motorData, previousStatus) {
  const newAlerts = [];
  const currentLevel = getWarningLevel(motorData);
  const prevRank = LEVEL_RANK[previousWarningLevel] ?? 0;
  const currRank = LEVEL_RANK[currentLevel] ?? 0;

  motorData.warningLevel = currentLevel;

  if (currRank > prevRank) {
    if (currentLevel === 'LEVEL_1') {
      console.log('[Alert] Level 1 warning triggered');
      console.log(
        `[Alert] temp=${motorData.temperature.toFixed(1)}°C current=${motorData.current.toFixed(1)}A`
      );
      pushAlert(
        {
          id: ++alertIdCounter,
          message: `Level 1: elevated readings (temp ${motorData.temperature.toFixed(1)}°C, current ${motorData.current.toFixed(1)}A)`,
          severity: 'warning',
          timestamp: new Date().toISOString(),
          status: 'LEVEL 1 WARNING',
          warningLevel: 'LEVEL_1',
        },
        newAlerts
      );
    }

    if (currentLevel === 'LEVEL_2') {
      console.log('[Alert] Level 2 warning triggered');
      console.log(
        `[Alert] temp=${motorData.temperature.toFixed(1)}°C current=${motorData.current.toFixed(1)}A`
      );
      pushAlert(
        {
          id: ++alertIdCounter,
          message: `Level 2: overload developing (temp ${motorData.temperature.toFixed(1)}°C, current ${motorData.current.toFixed(1)}A)`,
          severity: 'danger',
          timestamp: new Date().toISOString(),
          status: 'LEVEL 2 WARNING',
          warningLevel: 'LEVEL_2',
        },
        newAlerts
      );
      await sendWhatsAppAlert(buildLevel2WhatsAppMessage(motorData), 'level_2');
    }

    if (currentLevel === 'CRITICAL') {
      console.log('[Alert] Critical failure triggered');
      console.log(
        `[Alert] temp=${motorData.temperature.toFixed(1)}°C current=${motorData.current.toFixed(1)}A vib=${motorData.vibration}`
      );
      pushAlert(
        {
          id: ++alertIdCounter,
          message: `Critical failure: ${motorData.status}`,
          severity: 'critical',
          timestamp: new Date().toISOString(),
          status: motorData.status,
          warningLevel: 'CRITICAL',
        },
        newAlerts
      );
      await sendWhatsAppAlert(buildCriticalWhatsAppMessage(motorData), 'critical');
    }
  }

  if (motorData.status !== previousStatus && motorData.status !== 'NORMAL') {
    const existing = newAlerts.find((a) => a.message.includes(motorData.status));
    if (!existing) {
      pushAlert(
        {
          id: ++alertIdCounter,
          message: `Status: ${motorData.status}`,
          severity: getSeverityForLevel(currentLevel),
          timestamp: new Date().toISOString(),
          status: motorData.status,
          warningLevel: currentLevel,
        },
        newAlerts
      );
    }
  }

  if (currRank < prevRank) {
    console.log(`[Alert] Warning level de-escalated: ${previousWarningLevel} → ${currentLevel}`);
  }

  previousWarningLevel = currentLevel;

  return newAlerts;
}

export function getAlerts() {
  return alerts;
}

export function clearAlerts() {
  alerts = [];
  alertIdCounter = 0;
  whatsappCooldownKeys.clear();
  previousWarningLevel = 'NORMAL';
}

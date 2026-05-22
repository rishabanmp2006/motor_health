// Alert Manager — Handles alert history and WhatsApp placeholder

const MAX_ALERTS = 50;
let alerts = [];
let alertIdCounter = 0;

/**
 * Severity levels: info, warning, danger, critical
 */
function getSeverityFromStatus(status) {
  const severityMap = {
    'NORMAL': 'info',
    'WARNING': 'warning',
    'HIGH TEMPERATURE': 'warning',
    'OVERLOAD DETECTED': 'danger',
    'ABNORMAL VIBRATION': 'danger',
    'BEARING FAILURE PREDICTED': 'critical',
    'CRITICAL FAILURE RISK': 'critical',
  };
  return severityMap[status] || 'info';
}

/**
 * Check for status changes and generate alerts
 */
export function checkAndGenerateAlerts(motorData, previousStatus) {
  const newAlerts = [];

  if (motorData.status !== previousStatus && motorData.status !== 'NORMAL') {
    const alert = {
      id: ++alertIdCounter,
      message: `Motor status changed to: ${motorData.status}`,
      severity: getSeverityFromStatus(motorData.status),
      timestamp: new Date().toISOString(),
      status: motorData.status,
    };

    alerts.unshift(alert);
    newAlerts.push(alert);

    // Trim alerts array
    if (alerts.length > MAX_ALERTS) {
      alerts = alerts.slice(0, MAX_ALERTS);
    }

    // Trigger WhatsApp alert for critical events
    if (alert.severity === 'critical') {
      sendWhatsAppAlert(`🚨 CRITICAL: ${alert.message} | Health: ${motorData.health.toFixed(1)}%`);
    }
  }

  // Temperature threshold alerts
  if (motorData.temperature > 100 && previousStatus !== 'HIGH TEMPERATURE') {
    const alert = {
      id: ++alertIdCounter,
      message: `Temperature critical: ${motorData.temperature.toFixed(1)}°C`,
      severity: 'critical',
      timestamp: new Date().toISOString(),
      status: motorData.status,
    };
    alerts.unshift(alert);
    newAlerts.push(alert);
  }

  // Health threshold alerts
  if (motorData.health < 20) {
    const existing = alerts.find(a => a.message.includes('Health critically low') && 
      Date.now() - new Date(a.timestamp).getTime() < 10000);
    if (!existing) {
      const alert = {
        id: ++alertIdCounter,
        message: `Health critically low: ${motorData.health.toFixed(1)}%`,
        severity: 'critical',
        timestamp: new Date().toISOString(),
        status: motorData.status,
      };
      alerts.unshift(alert);
      newAlerts.push(alert);
    }
  }

  return newAlerts;
}

/**
 * Get all alerts
 */
export function getAlerts() {
  return alerts;
}

/**
 * Clear all alerts
 */
export function clearAlerts() {
  alerts = [];
  alertIdCounter = 0;
}

/**
 * WhatsApp Alert Placeholder using CallMeBot API
 * Replace YOUR_PHONE and YOUR_API_KEY with real credentials
 * 
 * CallMeBot API: https://www.callmebot.com/blog/free-api-whatsapp-messages/
 * To get API key: Send "I allow callmebot to send me messages" to +34 644 71 89 22
 */
export async function sendWhatsAppAlert(message) {
  const phone = 'YOUR_PHONE';      // Replace with your phone number (international format)
  const apiKey = 'YOUR_API_KEY';    // Replace with your CallMeBot API key

  if (phone === 'YOUR_PHONE' || apiKey === 'YOUR_API_KEY') {
    console.log(`[WhatsApp Placeholder] Would send: "${message}"`);
    console.log(`[WhatsApp Placeholder] Configure phone and API key in alertManager.js`);
    return;
  }

  try {
    const encodedMsg = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMsg}&apikey=${apiKey}`;
    
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url);
    
    if (response.ok) {
      console.log('[WhatsApp] Alert sent successfully');
    } else {
      console.error('[WhatsApp] Failed to send alert:', response.status);
    }
  } catch (error) {
    console.error('[WhatsApp] Error sending alert:', error.message);
  }
}

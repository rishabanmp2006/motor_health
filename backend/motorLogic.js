// Motor Logic — health, multi-level warning escalation, predictions

/** Escalation levels: NORMAL → LEVEL_1 → LEVEL_2 → CRITICAL (highest wins) */
export function getWarningLevel(motorData) {
  if (motorData.criticalFailureActive) {
    return 'CRITICAL';
  }
  if (
    motorData.temperature > 80 ||
    motorData.current > 30 ||
    motorData.vibration >= 3
  ) {
    return 'CRITICAL';
  }
  if (motorData.temperature > 37 || motorData.current > 22) {
    return 'LEVEL_2';
  }
  if (motorData.temperature > 35 || motorData.current > 1) {
    return 'LEVEL_1';
  }
  return 'NORMAL';
}

export function isLevel1(motorData) {
  return getWarningLevel(motorData) === 'LEVEL_1';
}

export function isLevel2(motorData) {
  return getWarningLevel(motorData) === 'LEVEL_2';
}

export function isCriticalLevel(motorData) {
  return getWarningLevel(motorData) === 'CRITICAL';
}

const LEVEL_STATUS = {
  NORMAL: 'NORMAL',
  LEVEL_1: 'LEVEL 1 WARNING',
  LEVEL_2: 'LEVEL 2 WARNING',
  CRITICAL: 'CRITICAL FAILURE RISK',
};

export function calculateHealth(motorData) {
  let degradation = 0;

  if (motorData.temperature > 100) {
    degradation += 2.0;
  } else if (motorData.temperature > 90) {
    degradation += 1.0;
  } else if (motorData.temperature > 80) {
    degradation += 0.5;
  }

  if (motorData.current > 30) {
    degradation += 1.5;
  } else if (motorData.current > 22) {
    degradation += 0.8;
  } else if (motorData.current > 15) {
    degradation += 0.3;
  }

  if (motorData.vibration >= 3) {
    degradation += 1.2;
  } else if (motorData.vibration >= 2) {
    degradation += 0.4;
  }

  motorData.health = Math.max(0, motorData.health - degradation * 0.1);

  if (degradation === 0 && motorData.health < 100) {
    motorData.health = Math.min(100, motorData.health + 0.05);
  }

  return motorData.health;
}

/**
 * Status from progressive warning level (no instant skip — level derived from sensors)
 */
export function generateStatus(motorData) {
  const level = getWarningLevel(motorData);
  motorData.warningLevel = level;
  return LEVEL_STATUS[level] || 'NORMAL';
}

export function predictLife(motorData) {
  if (motorData.health <= 0) return 0;
  if (motorData.health >= 95) return 8760;

  let life = motorData.health * 87.6;

  if (motorData.temperature > 80) life *= 0.6;
  if (motorData.current > 20) life *= 0.5;
  if (motorData.vibration >= 3) life *= 0.4;

  return Math.max(0, Math.round(life));
}

export function failureProbability(motorData) {
  let probability = 0;

  probability += (100 - motorData.health) * 0.5;

  if (motorData.temperature > 80) {
    probability += (motorData.temperature - 80) * 0.5;
  }

  if (motorData.current > 15) {
    probability += (motorData.current - 15) * 1.5;
  }

  probability += (motorData.vibration - 1) * 10;

  return Math.min(100, Math.max(0, Math.round(probability)));
}

export function getRecommendation(motorData) {
  const level = getWarningLevel(motorData);

  const recommendations = {
    NORMAL: 'No immediate action required. Continue regular monitoring schedule.',
    LEVEL_1: 'Elevated readings detected. Monitor temperature and current.',
    LEVEL_2: 'Overload condition developing. Reduce load and inspect motor.',
    CRITICAL: 'IMMEDIATE SHUTDOWN REQUIRED. Schedule emergency maintenance.',
  };

  return recommendations[level] || 'Continue monitoring.';
}

export function getConfidenceScore(motorData) {
  let confidence = 75;

  const abnormalCount = [
    motorData.temperature > 80,
    motorData.current > 15,
    motorData.vibration >= 2,
    motorData.health < 70,
  ].filter(Boolean).length;

  if (abnormalCount === 0) {
    confidence = 92;
  } else if (abnormalCount >= 3) {
    confidence = 96;
  } else {
    confidence = 78 + abnormalCount * 5;
  }

  confidence += (Math.random() - 0.5) * 2;

  return Math.min(99, Math.max(70, Math.round(confidence)));
}

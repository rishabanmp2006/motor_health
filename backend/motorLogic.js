// Motor Logic — Health calculation, status generation, predictions
// All the "AI" logic for the predictive maintenance system

/**
 * Calculate motor health based on current sensor readings
 * Health degrades when sensors exceed thresholds
 */
export function calculateHealth(motorData) {
  let degradation = 0;

  // Temperature-based degradation
  if (motorData.temperature > 100) {
    degradation += 2.0;
  } else if (motorData.temperature > 90) {
    degradation += 1.0;
  } else if (motorData.temperature > 80) {
    degradation += 0.5;
  }

  // Current-based degradation
  if (motorData.current > 25) {
    degradation += 1.5;
  } else if (motorData.current > 20) {
    degradation += 0.8;
  } else if (motorData.current > 15) {
    degradation += 0.3;
  }

  // Vibration-based degradation
  if (motorData.vibration >= 3) {
    degradation += 1.2;
  } else if (motorData.vibration >= 2) {
    degradation += 0.4;
  }

  // Apply degradation
  motorData.health = Math.max(0, motorData.health - degradation * 0.1);

  // Slow natural recovery when conditions are normal
  if (degradation === 0 && motorData.health < 100) {
    motorData.health = Math.min(100, motorData.health + 0.05);
  }

  return motorData.health;
}

/**
 * Generate motor status string based on current conditions
 * Priority: most critical condition wins
 */
export function generateStatus(motorData) {
  if (motorData.health < 15) {
    return 'CRITICAL FAILURE RISK';
  }
  if (motorData.health < 30) {
    return 'BEARING FAILURE PREDICTED';
  }
  if (motorData.vibration >= 3) {
    return 'ABNORMAL VIBRATION';
  }
  if (motorData.current > 25) {
    return 'OVERLOAD DETECTED';
  }
  if (motorData.temperature > 90) {
    return 'HIGH TEMPERATURE';
  }
  if (motorData.temperature > 80 || motorData.current > 15 || motorData.vibration >= 2) {
    return 'WARNING';
  }
  return 'NORMAL';
}

/**
 * Predict remaining motor life in hours
 */
export function predictLife(motorData) {
  if (motorData.health <= 0) return 0;
  if (motorData.health >= 95) return 8760; // ~1 year

  // Base life proportional to health
  let life = motorData.health * 87.6; // 100% = 8760 hours

  // Reduce based on current stress
  if (motorData.temperature > 80) life *= 0.6;
  if (motorData.current > 20) life *= 0.5;
  if (motorData.vibration >= 3) life *= 0.4;

  return Math.max(0, Math.round(life));
}

/**
 * Calculate failure probability (0-100%)
 */
export function failureProbability(motorData) {
  let probability = 0;

  // Inverse of health is base probability
  probability += (100 - motorData.health) * 0.5;

  // Temperature contribution
  if (motorData.temperature > 80) {
    probability += (motorData.temperature - 80) * 0.5;
  }

  // Current contribution
  if (motorData.current > 15) {
    probability += (motorData.current - 15) * 1.5;
  }

  // Vibration contribution
  probability += (motorData.vibration - 1) * 10;

  return Math.min(100, Math.max(0, Math.round(probability)));
}

/**
 * Get maintenance recommendation based on current state
 */
export function getRecommendation(motorData) {
  const status = motorData.status;

  const recommendations = {
    'CRITICAL FAILURE RISK': 'IMMEDIATE SHUTDOWN REQUIRED. Schedule emergency maintenance. Replace bearings and inspect windings.',
    'BEARING FAILURE PREDICTED': 'Schedule maintenance within 24 hours. Bearing replacement recommended. Reduce load immediately.',
    'ABNORMAL VIBRATION': 'Inspect motor mounts and alignment. Check for bearing wear. Schedule vibration analysis.',
    'OVERLOAD DETECTED': 'Reduce electrical load. Check for mechanical binding. Verify supply voltage.',
    'HIGH TEMPERATURE': 'Check cooling system. Reduce load if possible. Verify ambient temperature and ventilation.',
    'WARNING': 'Monitor closely. Schedule preventive maintenance within 1 week.',
    'NORMAL': 'No immediate action required. Continue regular monitoring schedule.',
  };

  return recommendations[status] || 'Continue monitoring.';
}

/**
 * Calculate AI confidence score
 */
export function getConfidenceScore(motorData) {
  // Higher confidence when more data points are abnormal (clearer pattern)
  let confidence = 75; // Base confidence

  const abnormalCount = [
    motorData.temperature > 80,
    motorData.current > 15,
    motorData.vibration >= 2,
    motorData.health < 70,
  ].filter(Boolean).length;

  if (abnormalCount === 0) {
    confidence = 92; // High confidence everything is fine
  } else if (abnormalCount >= 3) {
    confidence = 96; // Very clear failure pattern
  } else {
    confidence = 78 + abnormalCount * 5;
  }

  // Add small random variation for realism
  confidence += (Math.random() - 0.5) * 2;

  return Math.min(99, Math.max(70, Math.round(confidence)));
}

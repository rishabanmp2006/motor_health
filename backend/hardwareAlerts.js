// ESP8266 live hardware state — NORMAL | LEVEL_1 | LEVEL_2 | CRITICAL

import { getWarningLevel } from './motorLogic.js';

export function getHardwareAlertState(motorData) {
  const warningLevel = getWarningLevel(motorData);

  switch (warningLevel) {
    case 'CRITICAL':
      return {
        warningLevel: 'CRITICAL',
        level: 'CRITICAL',
        buzzer: 'continuous',
        buzzerIntervalMs: 0,
        greenLed: false,
        greenLedBlink: 'off',
        warningLed: false,
        redLedBlink: 'fast',
      };

    case 'LEVEL_2':
      return {
        warningLevel: 'LEVEL_2',
        level: 'LEVEL_2',
        buzzer: 'fast_beep',
        buzzerIntervalMs: 500,
        greenLed: false,
        greenLedBlink: 'off',
        warningLed: true,
        redLedBlink: 'off',
      };

    case 'LEVEL_1':
      return {
        warningLevel: 'LEVEL_1',
        level: 'LEVEL_1',
        buzzer: 'slow_beep',
        buzzerIntervalMs: 2000,
        greenLed: true,
        greenLedBlink: 'slow',
        warningLed: false,
        redLedBlink: 'off',
      };

    default:
      // NORMAL: temp <= 35°C and current <= 1A
      return {
        warningLevel: 'NORMAL',
        level: 'NORMAL',
        buzzer: 'off',
        buzzerIntervalMs: 0,
        greenLed: true,
        greenLedBlink: 'off',
        warningLed: false,
        redLedBlink: 'off',
      };
  }
}

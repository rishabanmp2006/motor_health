// Express + WebSocket Server for Motor Health Monitoring

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';

import {
  calculateHealth,
  generateStatus,
  predictLife,
  failureProbability,
  getRecommendation,
  getConfidenceScore,
} from './motorLogic.js';

import {
  checkAndGenerateAlerts,
  getAlerts,
  clearAlerts,
} from './alertManager.js';

import { getHardwareAlertState } from './hardwareAlerts.js';

const app = express();

const server = createServer(app);

const wss = new WebSocketServer({
  server
});

app.use(cors());

app.use(express.json());

// ======================================================
// MOTOR DATA
// ======================================================

const motorData = {

  temperature: 35,

  current: 1,

  vibration: 1,

  health: 100,

  status: 'NORMAL',

  uptime: 0,

  predictedLife: 8760,

  failureProb: 0,

  recommendation:
    'No immediate action required.',

  confidence: 92,

  criticalFailureActive: false,

  warningLevel: 'NORMAL',
};

let previousStatus = 'NORMAL';

const startTime = Date.now();

// ======================================================
// WARNING LEVEL LOGIC
// ======================================================

function updateWarningLevel() {

  // ==========================
  // CRITICAL
  // ==========================

  if (
    motorData.temperature > 80 ||
    motorData.current > 30 ||
    motorData.vibration >= 3
  ) {

    motorData.warningLevel =
      'CRITICAL';

    return;
  }

  // ==========================
  // LEVEL 2
  // ==========================

  if (
    motorData.temperature > 37 ||
    motorData.current > 22
  ) {

    motorData.warningLevel =
      'LEVEL_2';

    return;
  }

  // ==========================
  // LEVEL 1
  // ==========================

  if (
    motorData.temperature > 35 ||
    motorData.current > 1
  ) {

    motorData.warningLevel =
      'LEVEL_1';

    return;
  }

  // ==========================
  // NORMAL
  // ==========================

  motorData.warningLevel =
    'NORMAL';
}

// ======================================================
// HARDWARE PAYLOAD
// ======================================================

function buildHardwarePayload() {

  updateWarningLevel();

  return {

    type: 'hardwareUpdate',

    warningLevel:
      motorData.warningLevel,

    motorStatus:
      motorData.status,

    temperature:
      motorData.temperature,

    current:
      motorData.current,

    vibration:
      motorData.vibration,

    timestamp:
      new Date().toISOString(),
  };
}

// ======================================================
// BROADCAST STATE
// ======================================================

async function broadcastState() {

  if (
    !motorData.criticalFailureActive
  ) {

    calculateHealth(motorData);
  }

  motorData.status =
    generateStatus(motorData);

  updateWarningLevel();

  motorData.predictedLife =
    predictLife(motorData);

  motorData.failureProb =
    failureProbability(motorData);

  motorData.recommendation =
    getRecommendation(motorData);

  motorData.confidence =
    getConfidenceScore(motorData);

  motorData.uptime = Math.floor(
    (Date.now() - startTime) / 1000
  );

  motorData.health =
    Math.round(
      motorData.health * 10
    ) / 10;

  const newAlerts =
    await checkAndGenerateAlerts(
      motorData,
      previousStatus
    );

  previousStatus =
    motorData.status;

  const hardware =
    buildHardwarePayload();

  const motorPayload =
    JSON.stringify({

      type: 'motorData',

      data: {
        ...motorData
      },

      alerts:
        getAlerts().slice(0, 20),

      newAlerts,

      hardwareAlert:
        hardware,

      timestamp:
        hardware.timestamp,
    });

  const hardwarePayload =
    JSON.stringify(hardware);

  wss.clients.forEach(client => {

    if (
      client.readyState !== 1
    ) return;

    client.send(motorPayload);

    client.send(hardwarePayload);
  });

  console.log(
    `[${motorData.warningLevel}] Temp=${motorData.temperature}°C Current=${motorData.current}A Vib=${motorData.vibration}`
  );
}

// ======================================================
// DELAY
// ======================================================

function delay(ms) {

  return new Promise(resolve =>
    setTimeout(resolve, ms)
  );
}

// ======================================================
// REALISTIC OVERLOAD
// ======================================================

async function realisticOverload() {

  const currentStages =
    [6, 12, 18, 24];

  const tempStages =
    [38, 42, 46, 50];

  // ==========================
  // CURRENT SPIKE
  // ==========================

  for (let i = 0; i < currentStages.length; i++) {

    motorData.current =
      currentStages[i];

    if (i < tempStages.length) {

      motorData.temperature =
        tempStages[i];
    }

    motorData.vibration = 2;

    motorData.health -= 8;

    await broadcastState();

    await delay(1500);
  }
}

// ======================================================
// CRITICAL FAILURE
// ======================================================

async function runCriticalScenario() {

  // ==========================
  // CURRENT
  // ==========================

  const currentStages =
    [10, 18, 25, 35];

  for (const value of currentStages) {

    motorData.current = value;

    await broadcastState();

    await delay(1200);
  }

  // ==========================
  // VIBRATION
  // ==========================

  const vibrationStages =
    [1, 2, 3];

  for (const value of vibrationStages) {

    motorData.vibration = value;

    await broadcastState();

    await delay(1500);
  }

  // ==========================
  // TEMPERATURE
  // ==========================

  const tempStages =
    [45, 60, 80, 100, 120];

  for (const value of tempStages) {

    motorData.temperature = value;

    motorData.health -= 15;

    await broadcastState();

    await delay(1500);
  }

  motorData.status =
    'CRITICAL FAILURE RISK';

  motorData.health = 0;

  motorData.criticalFailureActive =
    true;

  await broadcastState();
}

// ======================================================
// RECOVERY
// ======================================================

async function recoverSystem() {

  const tempStages =
    [100, 80, 60, 45, 35];

  for (const value of tempStages) {

    motorData.temperature = value;

    if (motorData.current > 1) {

      motorData.current -= 4;
    }

    if (motorData.vibration > 1) {

      motorData.vibration -= 1;
    }

    motorData.health += 10;

    await broadcastState();

    await delay(1500);
  }

  motorData.status = 'NORMAL';

  motorData.warningLevel = 'NORMAL';

  motorData.criticalFailureActive =
    false;

  await broadcastState();
}

// ======================================================
// COMMAND HANDLERS
// ======================================================

const commandHandlers = {

  // ==========================
  // TEMPERATURE
  // ==========================

  temp_up: () => {

    motorData.temperature =
      Math.min(
        120,
        motorData.temperature + 2
      );
  },

  temp_down: () => {

    motorData.temperature =
      Math.max(
        20,
        motorData.temperature - 2
      );
  },

  // ==========================
  // CURRENT
  // ==========================

  current_up: () => {

    motorData.current =
      Math.min(
        40,
        motorData.current + 1
      );
  },

  current_down: () => {

    motorData.current =
      Math.max(
        0,
        motorData.current - 1
      );
  },

  // ==========================
  // VIBRATION
  // ==========================

  vibration_1: () => {

    motorData.vibration = 1;
  },

  vibration_2: () => {

    motorData.vibration = 2;
  },

  vibration_3: () => {

    motorData.vibration = 3;
  },

  // ==========================
  // OVERLOAD
  // ==========================

  trigger_overload: async () => {

    await realisticOverload();
  },

  // ==========================
  // CRITICAL
  // ==========================

  trigger_critical: async () => {

    await runCriticalScenario();
  },

  // ==========================
  // RECOVER
  // ==========================

  recover_system: async () => {

    await recoverSystem();
  },

  // ==========================
  // RESET
  // ==========================

  reset_system: () => {

    motorData.temperature = 35;

    motorData.current = 1;

    motorData.vibration = 1;

    motorData.health = 100;

    motorData.status = 'NORMAL';

    motorData.warningLevel =
      'NORMAL';

    motorData.criticalFailureActive =
      false;

    clearAlerts();
  },

  // ==========================
  // EMERGENCY STOP
  // ==========================

  emergency_stop: () => {

    motorData.current = 0;

    motorData.temperature =
      Math.max(
        25,
        motorData.temperature - 20
      );

    motorData.vibration = 1;
  },
};

// ======================================================
// COMMAND EXECUTION
// ======================================================

async function runCommand(action) {

  if (
    !commandHandlers[action]
  ) return;

  await commandHandlers[action]();

  console.log(
    `[WS] Command executed: ${action}`
  );

  await broadcastState();
}

// ======================================================
// PERIODIC UPDATE
// ======================================================

setInterval(async () => {

  if (
    !motorData.criticalFailureActive
  ) {

    // Live sensor jitter: temp ±0.5°C, current ±0.3A per tick
    motorData.temperature += (Math.random() - 0.5);
    motorData.current += (Math.random() - 0.5) * 0.6;

    motorData.temperature =
      Math.max(
        20,
        Math.round(
          motorData.temperature * 10
        ) / 10
      );

    motorData.current =
      Math.max(
        0,
        Math.round(
          motorData.current * 10
        ) / 10
      );
  }

  await broadcastState();

}, 1000);

// ======================================================
// WEBSOCKET
// ======================================================

wss.on('connection', (ws) => {

  console.log(
    '[WS] Client connected:',
    wss.clients.size
  );

  ws.send(
    JSON.stringify({

      type: 'motorData',

      data: {
        ...motorData
      },

      alerts:
        getAlerts().slice(0, 20),

      newAlerts: [],

      hardwareAlert:
        buildHardwarePayload(),

      timestamp:
        new Date().toISOString(),
    })
  );

  ws.send(
    JSON.stringify(
      buildHardwarePayload()
    )
  );

  ws.on(
    'message',
    async (message) => {

      try {

        const parsed =
          JSON.parse(message);

        if (
          parsed.type === 'command' &&
          commandHandlers[parsed.action]
        ) {

          await runCommand(
            parsed.action
          );
        }

      } catch (err) {

        console.error(
          '[WS] Invalid message:',
          err.message
        );
      }
    }
  );

  ws.on('close', () => {

    console.log(
      '[WS] Client disconnected'
    );
  });
});

// ======================================================
// API
// ======================================================

app.get(
  '/api/health',
  (req, res) => {

    res.json({

      status: 'ok',

      motorData,

      uptime: Math.floor(
        (Date.now() - startTime) / 1000
      )
    });
  }
);

app.get(
  '/api/alerts',
  (req, res) => {

    res.json({

      alerts:
        getAlerts()
    });
  }
);

// ======================================================
// SERVER
// ======================================================

const PORT =
  process.env.PORT || 3001;

server.listen(PORT, () => {

  console.log(
`\n🏭 Motor Health Monitoring Server
HTTP:      http://localhost:${PORT}
WebSocket: ws://localhost:${PORT}\n`
  );
});
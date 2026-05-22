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
  getWarningLevel,
} from './motorLogic.js';
import {
  checkAndGenerateAlerts,
  getAlerts,
  clearAlerts,
} from './alertManager.js';
import { getHardwareAlertState } from './hardwareAlerts.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// ─── Shared Motor Data State ─────────────────────────────────────
const motorData = {
  temperature: 35,
  current: 1,
  vibration: 1,
  health: 100,
  status: 'NORMAL',
  uptime: 0,
  predictedLife: 8760,
  failureProb: 0,
  recommendation: 'No immediate action required. Continue regular monitoring schedule.',
  confidence: 92,
  criticalFailureActive: false,
  warningLevel: 'NORMAL',
};

let previousStatus = 'NORMAL';
const startTime = Date.now();

function buildHardwarePayload() {
  const hardware = getHardwareAlertState(motorData);
  return {
    type: 'hardwareUpdate',
    ...hardware,
    motorStatus: motorData.status,
    temperature: motorData.temperature,
    current: motorData.current,
    vibration: motorData.vibration,
    timestamp: new Date().toISOString(),
  };
}

/** Push motor + hardware state to all clients immediately (live ESP8266 reaction) */
async function broadcastState() {
  if (!motorData.criticalFailureActive) {
    calculateHealth(motorData);
  }
  motorData.status = generateStatus(motorData);
  motorData.warningLevel = getWarningLevel(motorData);
  motorData.predictedLife = predictLife(motorData);
  motorData.failureProb = failureProbability(motorData);
  motorData.recommendation = getRecommendation(motorData);
  motorData.confidence = getConfidenceScore(motorData);
  motorData.uptime = Math.floor((Date.now() - startTime) / 1000);
  motorData.health = Math.round(motorData.health * 10) / 10;

  const newAlerts = await checkAndGenerateAlerts(motorData, previousStatus);
  previousStatus = motorData.status;

  const hardware = buildHardwarePayload();
  const level = hardware.warningLevel;

  if (level !== 'NORMAL') {
    console.log(
      `[Hardware] LIVE → ${level} | temp=${motorData.temperature}°C current=${motorData.current}A vib=${motorData.vibration}`
    );
  }

  const motorPayload = JSON.stringify({
    type: 'motorData',
    data: { ...motorData },
    alerts: getAlerts().slice(0, 20),
    newAlerts,
    hardwareAlert: hardware,
    timestamp: hardware.timestamp,
  });

  const hardwarePayload = JSON.stringify(hardware);

  wss.clients.forEach((client) => {
    if (client.readyState !== 1) return;
    client.send(motorPayload);
    client.send(hardwarePayload);
  });
}

// ─── Command Handlers ────────────────────────────────────────────
const commandHandlers = {
  temp_up: () => {
    motorData.temperature = Math.min(150, motorData.temperature + 2);
  },
  temp_down: () => {
    motorData.temperature = Math.max(20, motorData.temperature - 2);
  },
  current_up: () => {
    motorData.current = Math.min(40, motorData.current + 1);
  },
  current_down: () => {
    motorData.current = Math.max(0, motorData.current - 1);
  },
  vibration_1: () => {
    motorData.vibration = 1;
  },
  vibration_2: () => {
    motorData.vibration = 2;
  },
  vibration_3: () => {
    motorData.vibration = 3;
  },
  trigger_overload: () => {
    motorData.current = 30;
    motorData.temperature = 95;
    motorData.vibration = 2;
  },
  trigger_critical: () => {
    motorData.current = 35;
    motorData.temperature = 120;
    motorData.vibration = 3;
    motorData.health = Math.min(motorData.health, 15);
    motorData.criticalFailureActive = true;
  },
  reset_system: () => {
    motorData.temperature = 35;
    motorData.current = 1;
    motorData.vibration = 1;
    motorData.health = 100;
    motorData.status = 'NORMAL';
    motorData.criticalFailureActive = false;
    motorData.warningLevel = 'NORMAL';
    clearAlerts();
  },
  emergency_stop: () => {
    motorData.current = 0;
    motorData.temperature = Math.max(25, motorData.temperature - 20);
    motorData.vibration = 1;
  },
};

async function runCommand(action) {
  if (!commandHandlers[action]) return;
  commandHandlers[action]();
  console.log(`[WS] Command executed: ${action}`);
  await broadcastState();
}

// ─── Periodic Motor Data Update (noise + keep-alive broadcast) ───
setInterval(async () => {
  motorData.temperature += (Math.random() - 0.5) * 0.5;
  motorData.current += (Math.random() - 0.5) * 0.2;
  motorData.temperature = Math.max(20, Math.round(motorData.temperature * 10) / 10);
  motorData.current = Math.max(0, Math.round(motorData.current * 10) / 10);
  await broadcastState();
}, 500);

// ─── WebSocket Connection Handling ───────────────────────────────
wss.on('connection', (ws) => {
  console.log('[WS] Client connected. Total clients:', wss.clients.size);
  ws.isHardware = false;

  ws.send(
    JSON.stringify({
      type: 'motorData',
      data: { ...motorData },
      alerts: getAlerts().slice(0, 20),
      newAlerts: [],
      hardwareAlert: buildHardwarePayload(),
      timestamp: new Date().toISOString(),
    })
  );
  ws.send(JSON.stringify(buildHardwarePayload()));

  ws.on('message', async (message) => {
    try {
      const parsed = JSON.parse(message);

      if (parsed.type === 'register' && parsed.role === 'hardware') {
        ws.isHardware = true;
        console.log('[WS] ESP8266 hardware client registered');
        ws.send(JSON.stringify(buildHardwarePayload()));
        return;
      }

      if (parsed.type === 'command' && commandHandlers[parsed.action]) {
        await runCommand(parsed.action);
      }
    } catch (err) {
      console.error('[WS] Invalid message:', err.message);
    }
  });

  ws.on('close', () => {
    console.log('[WS] Client disconnected. Total clients:', wss.clients.size);
  });
});

// ─── REST API Endpoints ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', motorData, uptime: Math.floor((Date.now() - startTime) / 1000) });
});

app.get('/api/alerts', (req, res) => {
  res.json({ alerts: getAlerts() });
});

app.get('/api/hardware-alert', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.json(buildHardwarePayload());
});

// ─── Start Server ────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🏭 Motor Health Monitoring Server`);
  console.log(`   HTTP:      http://localhost:${PORT}`);
  console.log(`   WebSocket: ws://localhost:${PORT}`);
  console.log(`   Health:    http://localhost:${PORT}/api/health`);
  console.log(`   Hardware:  http://localhost:${PORT}/api/hardware-alert (live)\n`);
});

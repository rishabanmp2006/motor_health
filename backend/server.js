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

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// ─── Shared Motor Data State ─────────────────────────────────────
const motorData = {
  temperature: 45,
  current: 8,
  vibration: 1,
  health: 100,
  status: 'NORMAL',
  uptime: 0,
  predictedLife: 8760,
  failureProb: 0,
  recommendation: 'No immediate action required. Continue regular monitoring schedule.',
  confidence: 92,
};

let previousStatus = 'NORMAL';
const startTime = Date.now();

// ─── Command Handlers ────────────────────────────────────────────
const commandHandlers = {
  temp_up: () => {
    motorData.temperature = Math.min(150, motorData.temperature + 5);
  },
  temp_down: () => {
    motorData.temperature = Math.max(20, motorData.temperature - 5);
  },
  current_up: () => {
    motorData.current = Math.min(40, motorData.current + 2);
  },
  current_down: () => {
    motorData.current = Math.max(0, motorData.current - 2);
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
  },
  reset_system: () => {
    motorData.temperature = 45;
    motorData.current = 8;
    motorData.vibration = 1;
    motorData.health = 100;
    motorData.status = 'NORMAL';
    clearAlerts();
  },
  emergency_stop: () => {
    motorData.current = 0;
    motorData.temperature = Math.max(25, motorData.temperature - 20);
    motorData.vibration = 1;
  },
};

// ─── Periodic Motor Data Update ──────────────────────────────────
setInterval(() => {
  // Add slight random noise for realism
  motorData.temperature += (Math.random() - 0.5) * 0.5;
  motorData.current += (Math.random() - 0.5) * 0.2;

  // Clamp values
  motorData.temperature = Math.max(20, Math.round(motorData.temperature * 10) / 10);
  motorData.current = Math.max(0, Math.round(motorData.current * 10) / 10);

  // Calculate derived values
  calculateHealth(motorData);
  motorData.status = generateStatus(motorData);
  motorData.predictedLife = predictLife(motorData);
  motorData.failureProb = failureProbability(motorData);
  motorData.recommendation = getRecommendation(motorData);
  motorData.confidence = getConfidenceScore(motorData);
  motorData.uptime = Math.floor((Date.now() - startTime) / 1000);

  // Round health
  motorData.health = Math.round(motorData.health * 10) / 10;

  // Check for alerts
  const newAlerts = checkAndGenerateAlerts(motorData, previousStatus);
  previousStatus = motorData.status;

  // Broadcast to all clients
  const payload = JSON.stringify({
    type: 'motorData',
    data: { ...motorData },
    alerts: getAlerts().slice(0, 20),
    newAlerts,
    timestamp: new Date().toISOString(),
  });

  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(payload);
    }
  });
}, 500);

// ─── WebSocket Connection Handling ───────────────────────────────
wss.on('connection', (ws) => {
  console.log('[WS] Client connected. Total clients:', wss.clients.size);

  // Send current state immediately
  ws.send(JSON.stringify({
    type: 'motorData',
    data: { ...motorData },
    alerts: getAlerts().slice(0, 20),
    newAlerts: [],
    timestamp: new Date().toISOString(),
  }));

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message);
      if (parsed.type === 'command' && commandHandlers[parsed.action]) {
        commandHandlers[parsed.action]();
        console.log(`[WS] Command executed: ${parsed.action}`);
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

// ─── Start Server ────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🏭 Motor Health Monitoring Server`);
  console.log(`   HTTP:      http://localhost:${PORT}`);
  console.log(`   WebSocket: ws://localhost:${PORT}`);
  console.log(`   Health:    http://localhost:${PORT}/api/health\n`);
});

// WebSocket hook for real-time motor data communication
import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_URL } from '../utils/constants';
import { getTimeString, playAlertBeep } from '../utils/helpers';

const MAX_HISTORY = 60; // Keep 60 data points for charts

export default function useWebSocket() {
  const [motorData, setMotorData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [history, setHistory] = useState({
    temperature: [],
    current: [],
    health: [],
  });

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptRef = useRef(0);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WS] Connected');
        setIsConnected(true);
        reconnectAttemptRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'motorData') {
            setMotorData(message.data);
            setAlerts(message.alerts || []);
            setActivityFeed(message.activityFeed || []);

            // Update chart history
            const timeLabel = getTimeString();
            setHistory((prev) => {
              const addPoint = (arr, value) => {
                const next = [...arr, { time: timeLabel, value }];
                return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
              };

              return {
                temperature: addPoint(prev.temperature, message.data.temperature),
                current: addPoint(prev.current, message.data.current),
                health: addPoint(prev.health, message.data.health),
              };
            });

            // Play beep for new critical alerts
            if (message.newAlerts?.some((a) => a.severity === 'critical')) {
              playAlertBeep();
            }
          }
        } catch (err) {
          console.error('[WS] Parse error:', err);
        }
      };

      ws.onclose = () => {
        console.log('[WS] Disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Exponential backoff reconnect
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 10000);
        reconnectAttemptRef.current++;
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };

      ws.onerror = (error) => {
        console.error('[WS] Error:', error);
        ws.close();
      };
    } catch (err) {
      console.error('[WS] Connection failed:', err);
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 10000);
      reconnectAttemptRef.current++;
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  const sendCommand = useCallback((action) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'command', action }));
    }
  }, []);

  return {
    motorData,
    isConnected,
    alerts,
    activityFeed,
    history,
    sendCommand,
  };
}

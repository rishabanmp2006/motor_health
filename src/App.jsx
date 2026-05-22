import {
  Thermometer,
  Activity,
  Cpu,
  AlertTriangle,
  Zap,
  Siren,
} from "lucide-react";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

import {
  useEffect,
  useState,
  useRef,
} from "react";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

export default function App() {

  const socketRef = useRef(null);

  const [temperature, setTemperature] =
    useState(0);

  const [vibration, setVibration] =
    useState(0);

  const [current, setCurrent] =
    useState(0);

  const [health, setHealth] =
    useState(100);

  const [status, setStatus] =
    useState("HEALTHY");

  const [currentLimit, setCurrentLimit] =
    useState(1.5);

  const [alarm, setAlarm] =
    useState(false);

  const [tempData, setTempData] =
    useState([]);

  const [vibrationData, setVibrationData] =
    useState([]);

  const [currentData, setCurrentData] =
    useState([]);

  const [diagnostics, setDiagnostics] =
    useState([]);

  // ==========================================
  // WEBSOCKET
  // ==========================================

  useEffect(() => {

    if (socketRef.current) return;

    const socket =
      new WebSocket("ws://localhost:5050");

    socketRef.current = socket;

    socket.onopen = () => {

      console.log("Connected");

      socket.send(
        JSON.stringify({
          type: "dashboard",
        })
      );
    };

    socket.onmessage = (event) => {

      const data = JSON.parse(event.data);

      const temp =
        Number(data.temperature || 0);

      const vib =
        Number(data.vibration || 0);

      const curr =
        Number(data.current || 0);

      setTemperature(temp);

      setVibration(vib);

      setCurrent(curr);

      // ======================================
      // ALARM
      // ======================================

      if (curr > currentLimit) {

        setAlarm(true);
      }

      else {

        setAlarm(false);
      }

      // ======================================
      // HEALTH SCORE
      // ======================================

      let calculatedHealth = 100;

      // TEMP EFFECT

      if (temp > 40) {

        calculatedHealth -=
          (temp - 40) * 2;
      }

      // CURRENT EFFECT

      if (curr > currentLimit) {

        calculatedHealth -=
          (curr - currentLimit) * 40;
      }

      // VIBRATION EFFECT

      if (vib > 15) {

        calculatedHealth -=
          (vib - 15) * 2;
      }

      if (calculatedHealth < 0) {

        calculatedHealth = 0;
      }

      setHealth(
        Math.round(calculatedHealth)
      );

      // ======================================
      // STATUS
      // ======================================

      let currentStatus = "HEALTHY";

      if (calculatedHealth < 80) {

        currentStatus = "WARNING";
      }

      if (calculatedHealth < 50) {

        currentStatus = "CRITICAL";
      }

      setStatus(currentStatus);

      // ======================================
      // LIVE GRAPHS
      // ======================================

      setTempData((prev) => [
        ...prev.slice(-30),
        temp,
      ]);

      setVibrationData((prev) => [
        ...prev.slice(-30),
        vib,
      ]);

      setCurrentData((prev) => [
        ...prev.slice(-30),
        curr,
      ]);

      // ======================================
      // AI DIAGNOSTICS
      // ======================================

      let diag = [];

      if (alarm) {

        diag = [

          {
            text:
              "Critical current overload detected",
            color: "#ef4444",
          },

          {
            text:
              "Possible motor stall or excessive load",
            color: "#ef4444",
          },

          {
            text:
              "Immediate inspection recommended",
            color: "#ef4444",
          },
        ];
      }

      else if (vib > 15) {

        diag = [

          {
            text:
              "Abnormal vibration pattern detected",
            color: "#facc15",
          },

          {
            text:
              "Possible bearing wear developing",
            color: "#facc15",
          },

          {
            text:
              "Mechanical instability increasing",
            color: "#f97316",
          },
        ];
      }

      else {

        diag = [

          {
            text:
              "Motor operating normally",
            color: "#22c55e",
          },

          {
            text:
              "Current consumption stable",
            color: "#38bdf8",
          },

          {
            text:
              "No abnormal vibration trends",
            color: "#22c55e",
          },
        ];
      }

      setDiagnostics(diag);
    };

    socket.onclose = () => {

      console.log("Disconnected");

      socketRef.current = null;
    };

    return () => {

      socket.close();
    };

  }, [currentLimit]);

  const statusColor =
    status === "HEALTHY"
      ? "#22c55e"
      : status === "WARNING"
      ? "#facc15"
      : "#ef4444";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050816",
        color: "white",
        padding: "25px",
        fontFamily: "Inter, sans-serif",
      }}
    >

      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>

          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "900",
              letterSpacing: "4px",
            }}
          >
            SYMBIOTE
          </h1>

          <p
            style={{
              color: "#7dd3fc",
              marginTop: "5px",
            }}
          >
            AI POWERED PREDICTIVE MAINTENANCE
          </p>
        </div>

        <div
          style={{
            border:
              `1px solid ${statusColor}`,
            color: statusColor,
            padding: "10px 18px",
            borderRadius: "10px",
            fontWeight: "700",
            background: "#07101f",
          }}
        >
          ● {status}
        </div>
      </div>

      {/* ALARM */}

      {alarm && (

        <div
          style={{
            background: "#7f1d1d",
            border: "2px solid #ef4444",
            padding: "18px",
            borderRadius: "16px",
            marginBottom: "25px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            animation:
              "pulse 1s infinite",
          }}
        >
          <Siren color="#ef4444" />

          <h2
            style={{
              color: "#fecaca",
            }}
          >
            CURRENT LIMIT EXCEEDED
          </h2>
        </div>
      )}

      {/* CONTROL PANEL */}

      <div
        style={{
          background: "#07101f",
          border: "1px solid #1e293b",
          borderRadius: "20px",
          padding: "25px",
          marginBottom: "25px",
        }}
      >
        <h3
          style={{
            marginBottom: "20px",
          }}
        >
          MOTOR CURRENT LIMIT
        </h3>

        <input
          type="range"
          min="0.5"
          max="10"
          step="0.1"
          value={currentLimit}
          onChange={(e) =>
            setCurrentLimit(
              Number(e.target.value)
            )
          }

          style={{
            width: "100%",
          }}
        />

        <p
          style={{
            marginTop: "15px",
            color: "#38bdf8",
            fontWeight: "700",
          }}
        >
          Current Limit:
          {currentLimit.toFixed(1)} A
        </p>
      </div>

      {/* TOP CARDS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <Card
          title="Temperature"
          value={`${temperature.toFixed(1)}°C`}
          icon={<Thermometer />}
          color="#f97316"
        />

        <Card
          title="Vibration"
          value={vibration.toFixed(2)}
          icon={<Activity />}
          color="#22c55e"
        />

        <Card
          title="Current"
          value={`${current.toFixed(2)} A`}
          icon={<Zap />}
          color="#38bdf8"
        />

        <Card
          title="Health Score"
          value={`${health}%`}
          icon={<Cpu />}
          color={statusColor}
        />
      </div>

      {/* HEALTH + AI */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "2fr 1fr",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {/* HEALTH */}

        <div
          style={{
            background: "#07101f",
            border:
              `1px solid ${statusColor}`,
            borderRadius: "20px",
            padding: "35px",
          }}
        >
          <p
            style={{
              color: "#94a3b8",
            }}
          >
            MOTOR HEALTH STATUS
          </p>

          <h2
            style={{
              fontSize: "6rem",
              color: statusColor,
              marginTop: "10px",
            }}
          >
            {health}%
          </h2>

          <p
            style={{
              color: statusColor,
              fontWeight: "700",
              fontSize: "1.1rem",
            }}
          >
            {status}
          </p>
        </div>

        {/* AI PANEL */}

        <div
          style={{
            background: "#07101f",
            border: "1px solid #1e293b",
            borderRadius: "20px",
            padding: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <AlertTriangle
              color={statusColor}
            />

            <p
              style={{
                color: statusColor,
                fontWeight: "700",
              }}
            >
              AI DIAGNOSTICS
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {diagnostics.map((item, index) => (

              <Diagnostic
                key={index}
                text={item.text}
                color={item.color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* LIVE GRAPHS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(300px,1fr))",
          gap: "20px",
        }}
      >
        <GraphCard
          title="Temperature Analytics"
          data={tempData}
          color="#f97316"
        />

        <GraphCard
          title="Vibration Analytics"
          data={vibrationData}
          color="#22c55e"
        />

        <GraphCard
          title="Current Analytics"
          data={currentData}
          color="#38bdf8"
        />
      </div>
    </div>
  );
}

// ==========================================
// CARD
// ==========================================

function Card({
  title,
  value,
  icon,
  color,
}) {

  return (
    <div
      style={{
        background: "#07101f",
        border: "1px solid #1e293b",
        borderRadius: "18px",
        padding: "22px",
      }}
    >
      <div
        style={{
          color,
          marginBottom: "18px",
        }}
      >
        {icon}
      </div>

      <p
        style={{
          color: "#94a3b8",
          marginBottom: "10px",
        }}
      >
        {title}
      </p>

      <h2
        style={{
          fontSize: "2rem",
          fontWeight: "700",
        }}
      >
        {value}
      </h2>
    </div>
  );
}

// ==========================================
// DIAGNOSTIC
// ==========================================

function Diagnostic({
  text,
  color,
}) {

  return (
    <div
      style={{
        borderLeft:
          `4px solid ${color}`,
        background: "#020617",
        padding: "14px",
        borderRadius: "10px",
        color: "#cbd5e1",
      }}
    >
      {text}
    </div>
  );
}

// ==========================================
// GRAPH
// ==========================================

function GraphCard({
  title,
  data,
  color,
}) {

  return (
    <div
      style={{
        background: "#07101f",
        border: "1px solid #1e293b",
        borderRadius: "20px",
        padding: "20px",
      }}
    >
      <h3
        style={{
          marginBottom: "20px",
          color: "#cbd5e1",
        }}
      >
        {title}
      </h3>

      <Line
        data={{
          labels:
            data.map((_, i) => i),

          datasets: [
            {
              data,
              borderColor: color,
              tension: 0.4,
              fill: false,
            },
          ],
        }}

        options={{

          responsive: true,

          plugins: {

            legend: {
              display: false,
            },
          },

          scales: {

            x: {

              ticks: {
                color: "#64748b",
              },

              grid: {
                color: "#0f172a",
              },
            },

            y: {

              ticks: {
                color: "#64748b",
              },

              grid: {
                color: "#0f172a",
              },
            },
          },
        }}
      />
    </div>
  );
}
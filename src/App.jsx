import { useEffect, useState } from "react";

export default function App() {

  const [current, setCurrent] =
    useState(0);

  const [temperature, setTemperature] =
    useState(30);

  const [vibration, setVibration] =
    useState(1);

  const [health, setHealth] =
    useState(100);

  const [status, setStatus] =
    useState("HEALTHY");

  useEffect(() => {

    const socket =
      new WebSocket(
        "ws://192.168.137.45:5050"
      );

    socket.onopen = () => {

      console.log(
        "Dashboard Connected"
      );

      socket.send(
        JSON.stringify({
          type: "dashboard"
        })
      );
    };

    socket.onmessage = (event) => {

      const data =
        JSON.parse(event.data);

      console.log(data);

      const curr =
        Number(data.current || 0);

      setCurrent(curr);

      // TEMPERATURE MODEL

      setTemperature(prev => {

        let temp = prev;

        if (curr > 1.5) {

          temp += 0.25;
        }

        else if (curr > 0.7) {

          temp += 0.12;
        }

        else if (curr > 0.2) {

          temp += 0.03;
        }

        else {

          temp -= 0.05;
        }

        if (temp < 29)
          temp = 29;

        if (temp > 45)
          temp = 45;

        return Number(
          temp.toFixed(1)
        );
      });

      // VIBRATION MODEL

      let vib = 0;

      if (curr > 1.5) {

        vib =
          15 +
          Math.random() * 5;
      }

      else if (curr > 0.7) {

        vib =
          7 +
          Math.random() * 3;
      }

      else if (curr > 0.2) {

        vib =
          2 +
          Math.random() * 2;
      }

      else {

        vib =
          0.5 +
          Math.random();
      }

      setVibration(
        Number(vib.toFixed(2))
      );

      // HEALTH MODEL

      let h = 100;

      h -= curr * 20;

      h -= vib;

      h -= Math.max(
        0,
        temperature - 35
      ) * 2;

      if (h < 0)
        h = 0;

      setHealth(
        Math.round(h)
      );

      // STATUS

      if (h > 80) {

        setStatus("HEALTHY");
      }

      else if (h > 50) {

        setStatus("WARNING");
      }

      else {

        setStatus("CRITICAL");
      }
    };

    return () => {

      socket.close();
    };

  }, []);

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
        background: "#020617",
        color: "white",
        padding: "30px",
        fontFamily: "sans-serif",
      }}
    >

      <h1
        style={{
          fontSize: "3rem",
        }}
      >
        SYMBIOTE
      </h1>

      <p
        style={{
          color: "#38bdf8",
          marginBottom: "30px",
        }}
      >
        AI Predictive Maintenance
      </p>

      <h2
        style={{
          color: statusColor,
          marginBottom: "30px",
        }}
      >
        ● {status}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
        }}
      >

        <Card
          title="Current"
          value={`${current.toFixed(2)} A`}
          color="#38bdf8"
        />

        <Card
          title="Temperature"
          value={`${temperature} °C`}
          color="#f97316"
        />

        <Card
          title="Vibration"
          value={vibration}
          color="#22c55e"
        />

        <Card
          title="Health"
          value={`${health}%`}
          color={statusColor}
        />

      </div>

    </div>
  );
}

function Card({
  title,
  value,
  color,
}) {

  return (

    <div
      style={{
        background: "#07101f",
        border:
          `1px solid ${color}`,
        borderRadius: "20px",
        padding: "25px",
      }}
    >

      <p
        style={{
          color: "#94a3b8",
          marginBottom: "10px",
        }}
      >
        {title}
      </p>

      <h1
        style={{
          color,
          fontSize: "2rem",
        }}
      >
        {value}
      </h1>

    </div>
  );
}
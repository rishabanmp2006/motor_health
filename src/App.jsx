import { useEffect, useState } from "react";

export default function App() {

  const [temperature, setTemperature] =
    useState("Waiting...");

  useEffect(() => {

    const socket =
      new WebSocket("ws://localhost:5050");

    socket.onopen = () => {

      console.log("Frontend Connected");

      socket.send(
        JSON.stringify({
          type: "dashboard"
        })
      );
    };

    socket.onmessage = (event) => {

      const data = JSON.parse(event.data);

      console.log(data);

      setTemperature(data.temperature);
    };

    return () => {

      socket.close();
    };

  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#050816",
        color: "white",
        fontSize: "5rem",
        fontFamily: "Inter"
      }}
    >
      {temperature} °C
    </div>
  );
}
const WebSocket = require("ws");

const wss = new WebSocket.Server({
  port: 5050
});

console.log("Backend running on 5050");

// Store dashboard clients

const dashboardClients = new Set();

wss.on("connection", (ws) => {

  console.log("New Client");

  ws.on("message", (message) => {

    try {

      const data = JSON.parse(message);

      // Dashboard registration

      if (data.type === "dashboard") {

        dashboardClients.add(ws);

        console.log("Dashboard Connected");

        return;
      }

      // ESP temperature data

      console.log("ESP DATA:", data);

      // Send ONLY to dashboards

      dashboardClients.forEach((client) => {

        if (client.readyState === WebSocket.OPEN) {

          client.send(JSON.stringify(data));
        }
      });

    } catch (err) {

      console.log("Bad JSON");
    }
  });

  ws.on("close", () => {

    dashboardClients.delete(ws);

    console.log("Disconnected");
  });
});
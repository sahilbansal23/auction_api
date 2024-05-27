require("dotenv").config({
  path: "../.env",
});const WebSocket = require("ws");
const { pool } = require("../config/dbconfig");
const { addnotification } = require("../utils/notification");
// Create a WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });
const websocket_url = process.env.SOCKET_URL;
wss.on("connection", function connection(ws) {
  console.log("A new client connected");

  ws.on("message", async function incoming(message) {
    console.log("Received message:eee", message);
    const parsed_message = JSON.parse(message);
    console.log("Received message: parse", parsed_message);

    if (parsed_message.type == "new bid") {
      // Event listener for WebSocket connection open
      console.log("eeeee");
      const message = `New bidding in item with id ${parsed_message.item_id} of ₹'${parsed_message.bid_price}'`;
      await addnotification(message, parsed_message.item_id);

      // Send a message to the server
      const send_message = {
        type: "notificaiton",
        message: message,
        item_id: parsed_message.item_id,
      };

      //await addnotification(message,parsed_message.item_id);
      //ws.send(JSON.stringify(send_message));
    }
  });

  ws.on("close", function close() {
    console.log("Client disconnected");
  });

  ws.on("error", function error(err) {
    console.error("WebSocket error:", err);
  });
});

console.log("WebSocket server is running on port 8080");

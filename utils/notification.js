const { pool } = require("../config/dbconfig");
const logger = require("../utils/logger");
require("dotenv").config({
  path: "../.env",
});
const { ulid } = require("ulid");
const websocket_url = process.env.SOCKET_URL;
const WebSocket = require("ws");

const addnotification = async (message, item_id) => {
  const client = await pool.connect();
  try {
    const getUsersQuery = "SELECT id FROM public.users";
    const { rows } = await client.query(getUsersQuery);
    console.log("hellllllll",rows);
    // Construct notifications array to be inserted
    const notifications = rows.map((user) => ({
      id: ulid(), // Generate unique ID for each notification
      user_id: user.id,
      message: message,
      is_read: false,
      created_at: new Date(),
    }));

    // Insert notifications for all users into the notifications table
    const values = [];
    const placeholders = notifications
      .map((_, index) => {
        const position = index * 5;
        values.push(
          notifications[index].id,
          notifications[index].user_id,
          notifications[index].message,
          notifications[index].is_read,
          notifications[index].created_at
        );
        return `($${position + 1}, $${position + 2}, $${position + 3}, $${
          position + 4
        }, $${position + 5})`;
      })
      .join(", ");

    const insertQuery = {
      text: `INSERT INTO public.notifications (id, user_id, message, is_read, created_at) VALUES ${placeholders}`,
      values: values,
    };
    console.log(insertQuery.values);
    const result_notify = await client.query(insertQuery);
    console.log(result_notify);
    console.log("Notifications added for all users.");
    console.log(websocket_url);
    const ws = new WebSocket(websocket_url);

    // Event listener for WebSocket connection open
    ws.on("open", function open() {
      console.log("Connected to WebSocket server");

      // Send a message to the server
      const send_message = {
        type: "notificaiton",
        message: message,
        item_id: item_id,
      };
      ws.send(JSON.stringify(send_message));
    });

    // Event listener for receiving messages from the server
    ws.on("message", function incoming(message) {
      console.log("Received messag", message);
    });

    // Event listener for WebSocket connection close
    ws.on("close", function close() {
      console.log("Disconnected from WebSocket server");
    });
  } catch (error) {
    logger.error(error);
    throw new Error(error);
  } finally {
    client.release();
  }
};

module.exports = { addnotification };

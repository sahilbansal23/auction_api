const { pool } = require("../config/dbconfig");
const logger = require("../utils/logger");
const notificaitonQueries = require("../queries/notification");
const { ulid } = require("ulid");
const { auctionauthvalidation } = require("../utils/auth");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const WebSocket = require("ws");
const { addnotification } = require("../utils/notification");
const websocket_url = process.env.SOCKET_URL;

const getNotification = async (req, res) => {
  const client = await pool.connect();
  try {
    const auth = await auctionauthvalidation(req.headers, client);
    const user_id = auth.user_id;

    await client.query("BEGIN");

    const notificaiton = await client.query(notificaitonQueries.getUnread, [
      user_id,
    ]);

    await client.query("COMMIT");
    res.status(200).send({
      status: 200,
      msg: "notifications returned successfully",
      data: notificaiton.rows,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error(error);
    res.status(400).send({
      status: 400,
      msg: error.message,
      Data: req.body,
    });
  } finally {
    client.release();
  }
};

const markRead = async (req, res) => {
  const client = await pool.connect();
  try {
    const auth = await auctionauthvalidation(req.headers, client);
    const user_id = auth.user_id;

    await client.query("BEGIN");

    const notificaiton = await client.query(notificaitonQueries.mark_read, [
      user_id,
    ]);

    await client.query("COMMIT");
    res.status(200).send({
      status: 200,
      msg: "notifications marked as read",
      data: {},
    });
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error(error);
    res.status(400).send({
      status: 400,
      msg: error.message,
      Data: req.body,
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getNotification,
  markRead,
};

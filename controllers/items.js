const { pool } = require("../config/dbconfig");
const logger = require("../utils/logger");
const itemQueries = require("../queries/itemQueries");
const { ulid } = require("ulid");
const { auctionauthvalidation } = require("../utils/auth");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const WebSocket = require("ws");
const { addnotification } = require("../utils/notification");
const websocket_url = process.env.SOCKET_URL;

const getAllItems = async (req, res) => {
  const client = await pool.connect();
  try {
    const auth = await auctionauthvalidation(req.headers, client);
    const user_id = auth.user_id;
    const { limit, offset } = req.query;
    let active = req.query.active ? req.query.active : null;
    let word = req.query.word ? req.query.word : null;
    console.log("defe",active);
    const page = (offset - 1) * limit;
    await client.query("BEGIN");

    let itemCount = `SELECT COALESCE(COUNT(*), 0) as item_count FROM items`;
    let getitems = `SELECT id,name,description,starting_price,current_price,image_url,
    end_time,created_at,user_id FROM items 
    `;

    if (active != null || word != null) {
      itemCount += ` WHERE `;
      getitems += ` WHERE `;
    }
    if (active != null && active != "") {
      if (active == 'true') {
        itemCount += `  end_time > NOW() `;
        getitems += `  end_time > NOW() `;
      } else {
        itemCount += `  end_time < NOW() `;
        getitems += `  end_time < NOW() `;
      }
      if (word != null && word != "") {
        itemCount += " AND ";
        getitems += " AND ";
      }
    }
    if (word != null && word != "") {
      itemCount += `  name ILIKE  '${word}%' `;
      getitems += `  name ILIKE  '${word}%' `;
    }
    getitems += ` ORDER BY created_at DESC LIMIT $1 OFFSET $2 `;
    const cout_items = await client.query(itemCount);
    const total_items = cout_items.rows[0].item_count;

    const total_pages = Math.ceil(total_items / limit);
    const itemList = await client.query(getitems, [limit, page]);

    // if (itemList.rowCount > 0) {
    //   logger.info("user added successfully");
    // } else {
    //   throw new Error("Error occured");
    // }
    await client.query("COMMIT");
    res.status(200).send({
      status: 200,
      msg: "items returned successfully",
      data: {
        total_items: total_pages,
        total_rows: total_items,
        items: itemList.rows,
      },
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
const itemDetails = async (req, res) => {
  const client = await pool.connect();
  try {
    const auth = await auctionauthvalidation(req.headers, client);
    let item_id = req.params.id;
    await client.query("BEGIN");
    const item_details = await client.query(itemQueries.getitembyid, [item_id]);
    if (item_details.rowCount == 0) {
      throw new Error("no item id present");
    }

    await client.query("COMMIT");
    res.status(200).send({
      status: 200,
      msg: "item details returned successfully",
      data: item_details.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error(error);
    res.status(400).send({
      status: 400,
      msg: error.message,
      Data: {},
    });
  } finally {
    client.release();
  }
};

const addItem = async (req, res) => {
  const client = await pool.connect();
  try {
    const auth = await auctionauthvalidation(req.headers, client);
    let user_id = auth.user_id;
    await client.query("BEGIN");
    const content = JSON.parse(req.body.data);
    console.log("edfeed", content);
    const image = req?.file;

    const id = ulid();
    const addItem = await client.query(itemQueries.addItem, [
      id,
      content.name,
      content.description,
      content.starting_price,
      image?.path,
      content.end_time,
      user_id,
    ]);

    await client.query("COMMIT");
    res.status(200).send({
      status: 200,
      msg: "item added successfully",
      data: content,
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
const editItem = async (req, res) => {
  const client = await pool.connect();
  try {
    const auth = await auctionauthvalidation(req.headers, client);
    let user_id = auth.user_id;
    let role = auth.role;
    let item_id = req.params.id;
    const content = req.body;
    await client.query("BEGIN");

    const item_owner_id = await client.query(itemQueries.getitembyid, [
      item_id,
    ]);
    if (item_owner_id.rowCount == 0) {
      throw new Error("Item id not found in the sytem");
    }
    if (!(item_owner_id.rows[0].user_id == user_id || role == "admin")) {
      throw new Error("no access to edit the item");
    }
    const updateDetails = await client.query(itemQueries.updateItem, [
      item_id,
      content.name,
      content.description,
      content.starting_price,
      content.end_time,
    ]);

    if (updateDetails.rowCount > 0) {
      logger.info("item updated Successfully");
    }
    await client.query("COMMIT");
    res.status(200).send({
      status: 200,
      msg: "item edited",
      data: { ...req.body, id: item_id },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error(error);
    res.status(400).send({
      status: 400,
      msg: error.message,
      data: req.body,
    });
  } finally {
    client.release();
  }
};
const deleteItem = async (req, res) => {
  const client = await pool.connect();
  try {
    const auth = await auctionauthvalidation(req.headers, client);
    let user_id = auth.user_id;
    let role = auth.role;
    let item_id = req.params.id;
    await client.query("BEGIN");

    const item_owner_id = await client.query(itemQueries.getitembyid, [
      item_id,
    ]);
    if (item_owner_id.rowCount == 0) {
      throw new Error("Item id not found in the sytem");
    }
    if (!(item_owner_id.rows[0].user_id == user_id || role == "admin")) {
      throw new Error("no access to edit the item");
    }
    const updateDetails = await client.query(itemQueries.deleteItem, [item_id]);

    await client.query("COMMIT");
    res.status(200).send({
      status: 200,
      msg: "item Deleted",
      data: req.body,
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
const getbids = async (req, res) => {
  const client = await pool.connect();
  try {
    const auth = await auctionauthvalidation(req.headers, client);
    const user_id = auth.user_id;
    const item_id = req.params.itemId;
    await client.query("BEGIN");

    const itemBids = await client.query(itemQueries.getitembids, [item_id]);

    await client.query("COMMIT");
    res.status(200).send({
      status: 200,
      msg: "Bids Returned Successfully",
      data: itemBids.rows,
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
const addbid = async (req, res) => {
  const client = await pool.connect();
  try {
    const auth = await auctionauthvalidation(req.headers, client);
    const user_id = auth.user_id;
    const item_id = req.params.itemId;
    const content = req.body;
    const bidding_price = content.bidding_price;

    await client.query("BEGIN");

    const item_details = await client.query(itemQueries.getitembyid, [item_id]);
    const id = ulid();
    const itemBids = await client.query(itemQueries.addbid, [
      id,
      item_id,
      user_id,
      bidding_price,
    ]);

    const message = `New bidding in item '${item_details.rows[0].name} of ₹'${bidding_price}'`;
    await addnotification(message, item_id);

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

    await client.query("COMMIT");
    res.status(200).send({
      status: 200,
      msg: "Bids Returned Successfully",
      data: itemBids.rows,
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
  getAllItems,
  itemDetails,
  addItem,
  editItem,
  deleteItem,
  getbids,
  addbid,
};

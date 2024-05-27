const { pool } = require("../config/dbconfig");
const logger = require("../utils/logger");
const userController = require("../queries/userQueries");
const { ulid } = require("ulid");
const { auctionauthvalidation } = require("../utils/auth");
const jwt = require("jsonwebtoken");
const { get } = require("../routes/userRoute");
require("dotenv/config");

const register = async (req, res) => {
  const client = await pool.connect();
  const id = ulid();
  try {
    const content = req.body;
    logger.info("enter into signup");
    logger.info(content);
    await client.query("BEGIN");
    const adduser = await client.query(userController.addUser, [
      id,
      content.username,
      content.password,
      content.email,
      content.role,
    ]);

    if (adduser.rowCount > 0) {
      logger.info("user added successfully");
    } else {
      throw new Error("Error occured");
    }
    await client.query("COMMIT");
    res.status(200).send({
      status: 200,
      msg: "User ragister Successfully",
      Data: req.body,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error(error);
    res.status(400).send({
      status: 400,
      msg: error.message,
      Data: { user_id: id },
    });
  } finally {
    client.release();
  }
};

const login = async (req, res) => {
  const client = await pool.connect();
  try {
    const content = req.body;
    const username = content.username;
    let data = await client.query(userController.getUserFromUsername, [
      username,
    ]);

    if (data.rowCount == 0) {
      throw new Error("No user found");
    }
    data = data.rows[0];
    if (content.password != data.password) {
      throw new Error("Incorrect password");
    }

    const currentTimeUTC = Date.now();
    const expirationTimeUTC = currentTimeUTC + 120 * 60 * 1000; // 20 minutes in milliseconds

    const expirationTimeEpoch = expirationTimeUTC;

    // Sign the token with exp field
    const token = jwt.sign(
      {
        user_id: `${data.id}`,
        username: data.username,
        role: data.role,
      },
      process.env.JWT_SECRET
    );

    let result = {
      loggedIn: "true",
      user_id: data.id,
      token: `Bearer ${token}`,
      exp: expirationTimeEpoch,
    };

    res.status(200).send({
      status: 200,
      msg: "Login Successfully",
      Data: result,
    });
  } catch (error) {
    logger.error(error);
    res.status(400).send({ status: 400, msg: error.message, Data: req.body });
  } finally {
    client.release();
  }
};

const getprofile = async (req, res) => {
  const client = await pool.connect();
  try {
    const auth = await auctionauthvalidation(req.headers, client);
    const user_id = auth.user_id;

    const user_details = await client.query(userController.profile, [user_id]);
    const result = user_details.rows;
    res.status(200).send({
      status: 200,
      msg: "Data Returned Successfully",
      data: result,
    });
  } catch (error) {
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

const editpassword = async (req, res) => {
  const client = await pool.connect();
  try {
    const auth = await auctionauthvalidation(req.headers, client);
    const user_id = auth.user_id;
    await client.query("BEGIN");
    const new_password = req.body.new_password;
    const old_password = req.body.old_password;

    const get_old_pass = await client.query(userController.getUserFromUserid, [
      user_id,
    ]);
    console.log(get_old_pass);
    if (get_old_pass.rows[0]?.password == old_password) {
      const update_password = await client.query(
        userController.update_password,
        [user_id, new_password]
      );
    } else {
      throw new Error("old password entered is incorrect");
    }
    await client.query("COMMIT");
    res.status(200).send({
      status: 200,
      msg: "Password reset Successfully",
      Data: req.body,
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
  login,
  register,
  getprofile,
  editpassword,
};

const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const queriesuserauth = require("../queries/userQueries");

async function decryptheader(header) {
  try {
    const token = header.authorization;
    const tokenValue = token ? token.split(" ")[1] : null;

    if (!tokenValue) {
      throw new Error("No token provided");
    }

    const jwtSecretKey = process.env.JWT_SECRET;

    const verified = jwt.verify(tokenValue, jwtSecretKey);

    if (verified) {
      console.log("Token passed Successfully");
      return verified;
    } else {
      throw new Error("Unsuccessful Verification");
    }
  } catch (error) {
    logger.error(error, "error in token");
    // const res = "Invalid Token";
    throw new Error("Invalid Token");
  }
}

async function auctionauthvalidation(header, client) {
  try {
    const auth = await decryptheader(header);
    const user_id = auth.user_id;
    // console.log("user_id in auctionauthvalidation ", user_id);
    const isexist = await client.query(queriesuserauth.getUserFromUserid, [
      user_id,
    ]);

    if (isexist.rowCount == 0) {
      logger.info("No user exits");
      throw new Error("No user exits");
    } else {
      return auth;
    }
  } catch (error) {
    logger.error(error);
    throw new Error(error);
  }
}

module.exports = { decryptheader, auctionauthvalidation };

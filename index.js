const express = require("express");
require("dotenv").config();

const app = express();
const { json } = require("body-parser");
const rateLimit = require("express-rate-limit");

const SERVER_PORT = process.env.PORT;
const limiter = rateLimit({
  windowMs: 10*60 * 1000, // 1 minute
  max: 200, // limit each IP to 50 requests per windowMs
  message: "Too many requests from this IP, please try again later",
  statusCode:429
});

const userRoute = require("./routes/userRoute");
const itemRoute = require("./routes/itemRoute");

app.use(json());
app.use(limiter);

app.use("/users", userRoute);
app.use("/items", itemRoute);

app.use("*", async (req, res) => {
  logger.error("Unknow URL coming endpoint");
  res.status(404).send(" ERROR 404 Page not found");
  // res.send(console.error(" ERROR 404 Page not found"));
});
// app.use("/notifications");

app.listen(SERVER_PORT, () => {
  console.log(`Server is running on port ${SERVER_PORT}`);
});

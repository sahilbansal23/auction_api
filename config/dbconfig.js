require("dotenv").config({
  path: "../.env",
});const Pool = require("pg-pool");

PORT = 5000
const pool = new Pool({
  user: process.env.DBUSER,
  host: process.env.DBHOST,
  database: process.env.DB,
  password: process.env.DBPASSWORD,
  port: process.env.DBPORT,
  max: 15,
});
// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "auction",
//   password: "sahil2210#",
//   port: 5432,
//   max: 15,
// });

module.exports = {
  pool,
};

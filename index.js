/** @format */

const express = require("express");
const app = express();

// const moment = require('moment-timezone');
// let dateIndia = moment.tz(Date.now(), "Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

var cors = require("cors");
const fs = require("fs");
app.use(cors());

app.use(express.json());

app.use(express.static("uploads"));
app.use(express.static("front"));

const port = process.env.PORT || 10000;

require("./db/connection");
const routes = require("./routing");

app.use("/api", routes);

app.get("/", async (req, res) => {
  res.send("GTS API v1 is running...");
});

app.listen(port, () => {
  console.log(`Your app listening at port ${port}`);
});

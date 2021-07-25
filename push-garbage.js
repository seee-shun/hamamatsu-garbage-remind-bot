"use strict";

const express = require("express");
const mysql = require("mysql");
const line = require("@line/bot-sdk");
const PORT = process.env.PORT || 5000;

const config = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const app = express();

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

connection.connect((err) => {
  if (err) {
    console.log(`error connecting:${err.stack}`);
    return;
  }
  console.log("success");
});

const client = new line.Client(config);

const toMessage = () => {
  connection.query("SELECT * FROM users", (err, results) => {
    for (let i = 0; i < results.length; i++) {
      client.pushMessage(results[i].userId, {
        type: "text",
        text: `あしたのごみはかん、ペットボトルです！`,
      });
    }
  });
};

// setTimeout(() => {
toMessage();
// }, new Date().setHours(2, 50, 0, 0) - new Date());

app.listen(PORT, () =>
  console.log(`Hamamatsu Garbage remind bot listening on port ${PORT}!`)
);
// app.listen(PORT);
// console.log(`Sever running at ${PORT}`);
// process.env.NOW_REGION ? (module.exports = app) : app.listen(PORT);
// console.log(`Server running at ${PORT}`);

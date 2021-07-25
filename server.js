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

app.post("/webhook", line.middleware(config), (req, res) => {
  console.log(req.body.events);
  Promise.all(req.body.events.map(handleEvent)).then((result) => {
    console.log(result);
    res.json(result);
  });
});

const client = new line.Client(config);

const handleEvent = (e) => {
  let mes = "桃尻かなえ";
  if (e.type !== "message" || e.message.type !== "text") {
    return Promise.resolve(null);
  }
  if (e.message.text === "432-8012") {
  }

  if (e.message.text === "明日のごみは？") {
    connection.query("SELECT * FROM test", (err, results) => {
      console.log(results);
      return client.pushMessage(e.source.userId, {
        type: "text",
        text: results[0].name,
      });
    });
  } else if (e.message.text === "地域を変更") {
    mes = "城北でいいですか？";
  }

  return client.replyMessage(e.replyToken, {
    type: "text",
    text: mes,
  });
};

app.listen(PORT, () =>
  console.log(`Hamamatsu Garbage remind bot listening on port ${PORT}!`)
);
// app.listen(PORT);
// console.log(`Sever running at ${PORT}`);
// process.env.NOW_REGION ? (module.exports = app) : app.listen(PORT);
// console.log(`Server running at ${PORT}`);

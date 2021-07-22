"use strict";

require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const line = require("@line/bot-sdk");
const PORT = process.env.PORT || 3000;

const config = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const app = express();

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "shse4631",
  database: "garbage_bot",
});

connection.connect((err) => {
  if (err) {
    console.log(`error connecting:${err.stack}`);
    return;
  }
  console.log("success");
});

let replyText = "";
app.get("/", (req, res) => {
  connection.query("SELECT * FROM users", (err, results) => {
    console.log(results[0].createdAt);
    replyText = results[0].createdAt;
  });
});

app.get("/", (req, res) => res.send("Hello LINE BOT!(GET)")); //ブラウザ確認用(無くても問題ない)
app.post("/webhook", line.middleware(config), (req, res) => {
  console.log(req.body.events);
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

const client = new line.Client(config);

const handleEvent = async (e) => {
  if (e.type !== "message" || e.message.type !== "text") {
    return Promise.resolve(null);
  }

  if (e.message.text === "明日のごみは？") {
    // replyText = "明日はかん、ペットボトルがゴミ出しの日です";
  } else if (e.message.text === "地域を変更") {
    // replyText = "特になし";
  } else if (e.message.text === "通知時間を変更") {
    // replyText = "通知時間を変更してください";
  }

  return client.replyMessage(e.replyToken, {
    type: "text",
    text: replyText,
  });
};

// const toMessage = () => {
//   client.pushMessage("U1221c5a7f6d56970a7dce56d99a5a9ae", {
//     type: "text",
//     text: `今の最新だよ！`,
//   });
// };

// setTimeout(() => {
//   toMessage();
// }, new Date().setHours(2, 50, 0, 0) - new Date());

// app.listen(PORT);
// console.log(`Sever running at ${PORT}`);
process.env.NOW_REGION ? (module.exports = app) : app.listen(PORT);
console.log(`Server running at ${PORT}`);

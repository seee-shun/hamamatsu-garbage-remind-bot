"use strict";

require("dotenv").config();
const express = require("express");
const line = require("@line/bot-sdk");
const PORT = process.env.PORT || 3000;

const config = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const app = express();

app.get("/", (req, res) => res.send("Hello Line bot"));
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

  let replyText = "";
  if (e.message.text === "ごみ") {
    replyText = "明日はかん、ペットボトルがゴミ出しの日です";
  } else {
    replyText = "特になし";
  }

  return client.replyMessage(e.replyToken, {
    type: "text",
    text: replyText,
  });
};

const toMessage = () => {
  client.pushMessage("U1221c5a7f6d56970a7dce56d99a5a9ae", {
    type: "text",
    text: `今の最新だよ！`,
  });
};

setTimeout(() => {
  toMessage();
}, new Date().setHours(2, 50, 0, 0) - new Date());

// app.listen(PORT);
// console.log(`Sever running at ${PORT}`);
process.env.NOW_REGION ? (module.exports = app) : app.listen(PORT);
console.log(`Server running at ${PORT}`);

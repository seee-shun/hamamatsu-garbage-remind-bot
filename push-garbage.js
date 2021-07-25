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
  host: "us-cdbr-east-04.cleardb.com",
  user: "b215f8f6b04092",
  password: "0afba604",
  database: "heroku_bb69fae61fac0c1",
});

connection.connect((err) => {
  if (err) {
    console.log(`error connecting:${err.stack}`);
    return;
  }
  console.log("success");
});

app.get("/", (req, res) => res.send("Hello LINE BOT!(GET)")); //ブラウザ確認用(無くても問題ない)
// app.post("/webhook", line.middleware(config), (req, res) => {
//   console.log(req.body.events);
//   Promise.all(req.body.events.map(handleEvent)).then((result) => {
//     console.log(result);
//     res.json(result);
//   });
// });

const client = new line.Client(config);

// const handleEvent = (e) => {
//   let mes = "";
//   if (e.type !== "message" || e.message.type !== "text") {
//     return Promise.resolve(null);
//   }

//   if (e.message.text === "明日のごみは？") {
//     // return getName(e.source.userId);
//     connection.query("SELECT * FROM test", (err, results) => {
//       console.log(results);
//       return client.pushMessage(e.source.userId, {
//         type: "text",
//         text: results[0].name,
//       });
//     });
//     // console.log(JSON.stringify(replyText));
//     // const replyMes = JSON.stringify(replyText);
//     // console.log(`replyMesは${replyMes}`);
//   } else if (e.message.text === "地域を変更") {
//     mes = "特になし";
//   } else if (e.message.text === "通知時間を変更") {
//     mes = "通知時間を変更してください";
//   }

//   // return client.replyMessage(e.replyToken, {
//   //   type: "text",
//   //   text: mes,
//   // });
// };

// const getName = async (userId) => {};
const toMessage = () => {
  client.pushMessage("U1221c5a7f6d56970a7dce56d99a5a9ae", {
    type: "text",
    text: `あしたのごみはかん、ペットボトルです！`,
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

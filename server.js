"use strict";

const express = require("express");
// const mysql = require("mysql");
// const line = require("@line/bot-sdk");
const PORT = process.env.PORT || 5000;

// const config = {
//   channelSecret: "356084186cc5e93d0d8f4b1c896b384a",
//   channelAccessToken:
//     "LBuTK2807CaJXrJ4Bkl6YnJ9/uOn/EPseaViFzNjt1ap5CgGy6pJSMwji9aUqQ6a/uDjrk372f8s8DjuvBHg2qAxVHu3vuX54x3oj8ZJEuPEUQVEpqkTmhW3y+G++z5uvymYMRt4tsK+eBKWVq0I4AdB04t89/1O/w1cDnyilFU=",
// };

const app = express();

// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "shse4631",
//   database: "garbage_bot",
// });

// connection.connect((err) => {
//   if (err) {
//     console.log(`error connecting:${err.stack}`);
//     return;
//   }
//   console.log("success");
// });

// let replyText = "";
// app.get("/", (req, res) => {
//   connection.query("SELECT * FROM users", (err, results) => {
//     console.log(results[0].createdAt);
//     replyText = results[0].createdAt;
//   });
// });

app.get("/", (req, res) => res.send("Hello LINE BOT!(GET)")); //ブラウザ確認用(無くても問題ない)
// app.post("/webhook", line.middleware(config), (req, res) => {
//   console.log(req.body.events);
//   Promise.all(req.body.events.map(handleEvent)).then((result) =>
//     res.json(result)
//   );
// });

// const client = new line.Client(config);

// const handleEvent = async (e) => {
//   if (e.type !== "message" || e.message.type !== "text") {
//     return Promise.resolve(null);
//   }

//   if (e.message.text === "明日のごみは？") {
//     // replyText = "明日はかん、ペットボトルがゴミ出しの日です";
//   } else if (e.message.text === "地域を変更") {
//     // replyText = "特になし";
//   } else if (e.message.text === "通知時間を変更") {
//     // replyText = "通知時間を変更してください";
//   }

//   return client.replyMessage(e.replyToken, {
//     type: "text",
//     text: replyText,
//   });
// };

// const toMessage = () => {
//   client.pushMessage("U1221c5a7f6d56970a7dce56d99a5a9ae", {
//     type: "text",
//     text: `今の最新だよ！`,
//   });
// };

// setTimeout(() => {
//   toMessage();
// }, new Date().setHours(2, 50, 0, 0) - new Date());

app.listen(PORT, () =>
  console.log(`Hamamatsu Garbage remind bot listening on port ${PORT}!`)
);
// app.listen(PORT);
// console.log(`Sever running at ${PORT}`);
// process.env.NOW_REGION ? (module.exports = app) : app.listen(PORT);
// console.log(`Server running at ${PORT}`);

"use strict";

const express = require("express");
const mysql = require("mysql");
const line = require("@line/bot-sdk");
const PORT = process.env.PORT || 5000;

const config = {
  channelSecret: "356084186cc5e93d0d8f4b1c896",
  channelAccessToken:
    "LBuTK2807CaJXrJ4Bkl6YnJ9/uOn/EPseaViFzNjt1ap5CgGy6pJSMwji9aUqQ6a/uDjrk372f8s8DjuvBHg2qAxVHu3vuX54x3oj8ZJEuPEUQVEpqkTmhW3y+G++z5uvymYMRt4tsK+eBKWVq0I4AdB04t89/1O/w1cDnyilFU=",
  // channelSecret: process.env.CHANNEL_SECRET,
  // channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const app = express();

const connection = mysql.createConnection({
  host: "us-cdbr-east-04.cleardb.com",
  user: "b215f8f6b04092",
  password: "0afba604",
  database: "heroku_bb69fae61fac0c1",

  // host: process.env.MYSQL_HOST,
  // user: process.env.MYSQL_USER,
  // password: process.env.MYSQL_PASSWORD,
  // database: process.env.MYSQL_DATABASE,
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
  // 日付を取
  let time = new Date();
  let month = time.getMonth() + 1;
  let day = time.getDate() + 1;
  let when = "今日";

  // 日付整形
  const month_zero = ("00" + month).slice(-2);
  const day_zero = ("00" + day).slice(-2);
  const today = "2021-" + month_zero + "-" + day_zero;

  // クエリ文
  var sql = "SELECT * FROM users,garbage_days WHERE day = ?";

  connection.query(sql, today, (err, results) => {
    // ユーザの居住区番号によって処理;
    for (let i = 0; i < results.length; i++) {
      // 居住地番号
      const livedArea = results[i].livedArea;
      let garbage = results[i][livedArea];
      if (garbage === "") {
        garbage = "なし";
      }

      client.pushMessage(results[i].userId, {
        type: "text",
        text: `${when}のごみは${garbage}です！`,
      });
    }
  });
};

toMessage();

app.listen(PORT, () =>
  console.log(`Hamamatsu Garbage remind bot listening on port ${PORT}!`)
);

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
  //日付取得
  const today = new Date();
  today.setHours(today.getHours() + 9);

  // 日付整形
  const zeroPadding = (date) => date.toString().padStart(2, "0");
  const todayYear = today.getFullYear();
  const todayMonth = zeroPadding(today.getMonth() + 1);
  const todayDay = zeroPadding(today.getDate());
  const todayString = `${todayYear}-${todayMonth}-${todayDay}`;

  // クエリ文
  var sql = "SELECT * FROM users,garbage_days WHERE day = ?";

  connection.query(sql, todayString, (err, results) => {
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
        text: `今日のごみは${garbage}です！`,
      });
    }
  });
};

toMessage();

app.listen(PORT, () =>
  console.log(`Hamamatsu Garbage remind bot listening on port ${PORT}!`)
);

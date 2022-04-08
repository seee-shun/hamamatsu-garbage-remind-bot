"use strict";

const express = require("express");
const mysql = require("mysql");
const line = require("@line/bot-sdk");
const axios = require("axios");
const PORT = process.env.PORT || 5000;

const config = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const app = express();
let connection;

const handleDisconnect = () => {
  connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  connection.connect((err) => {
    if (err) {
      console.log(`error connecting:${err.stack}`);
      setTimeout(handleDisconnect, 1000); // 再接続を少し遅らせる処理
    }
    console.log("success");
  });

  connection.on("error", (err) => {
    console.log(`db error${err}`);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("ERROR.CONNECTION_LOST: ", err);
      handleDisconnect();
    } else {
      throw err;
    }
  });
};

handleDisconnect();

app.get("/", (req, res) =>
  res.send("Hello Hamamatsu Garbage Remind LINE BOT!(GET)")
);
app.post("/webhook", line.middleware(config), (req, res) => {
  console.log(req.body.events);
  Promise.all(req.body.events.map(handleEvent)).then((result) => {
    res.json(result);
  });
});

const client = new line.Client(config);

const handleEvent = async (e) => {
  let mes = "「今日のごみは？」と聞いてみてね！";
  const postalCodeCheck = /^[0-9]{3}-?[0-9]{4}$/;

  if (e.type !== "message" || e.message.type !== "text") {
    return Promise.resolve(null);
  } else {
    connection.query(
      `INSERT INTO users(userId) VALUES('${e.source.userId}') ON DUPLICATE KEY UPDATE userId = '${e.source.userId}'`,
      (err, results) => {
        if (err) throw err;
      }
    );
  }

  if (postalCodeCheck.test(e.message.text) === true) {
    try {
      const postalCodeURL = `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${e.message.text}`;
      const res = await axios.get(postalCodeURL);
      const address = res.data.results[0].address3;
      connection.query(
        `SELECT garbage_number FROM cities WHERE name like '${address}%'`,
        (err, results) => {
          if (err) throw err;
          connection.query(
            `UPDATE users SET livedArea = '${results[0].garbage_number}' WHERE userId = '${e.source.userId}'`,
            (error, vals) => {
              if (error) throw error;
            }
          );
        }
      );
      return client.pushMessage(e.source.userId, {
        type: "text",
        text: `あなたの住む地域を${address}に設定しました！`,
      });
    } catch (error) {
      console.log(`error:${error}`);
      return client.pushMessage(e.source.userId, {
        type: "text",
        text: "存在しない住所です。正しい郵便番号を入力してください",
      });
    }
  }

  if (
    e.message.text === "明日のごみは？" ||
    e.message.text === "今日のごみは？"
  ) {
    let when = "今日";
    let year, month, day;
    const today = new Date();
    today.setHours(today.getHours() + 9);
    year = today.getFullYear();
    month = today.getMonth() + 1;
    day = today.getDate();

    if (e.message.text === "明日のごみは？") {
      when = "明日";
      const tomorrow = new Date(today.setDate(today.getDate() + 1));
      year = tomorrow.getFullYear();
      month = tomorrow.getMonth() + 1;
      day = tomorrow.getDate();
    }
    const zeroPadding = (date) => date.toString().padStart(2, "0");
    const dateQuery = `${year}-${zeroPadding(month)}-${zeroPadding(day)}`;

    connection.query(
      `SELECT livedArea from users WHERE userId = '${e.source.userId}'`,
      (err, results) => {
        if (err) throw err;

        connection.query(
          "SELECT * FROM garbage_days WHERE day = ?",
          dateQuery,
          (error, vals) => {
            if (error) throw error;
            let garbage = vals[0][results[0].livedArea];
            if (garbage === "") {
              garbage = "なし";
            }
            return client.pushMessage(e.source.userId, {
              type: "text",
              text: `${when}のごみは${garbage}です！`,
            });
          }
        );
      }
    );
    return;
  }

  if (e.message.text === "地域を変更") {
    mes =
      "地域変更のために郵便番号（例：432-8011...ハイフン無しでも可）を入力してください！";
  }

  return client.replyMessage(e.replyToken, {
    type: "text",
    text: mes,
  });
};

app.listen(PORT, () =>
  console.log(`Hamamatsu Garbage remind bot listening on port ${PORT}!`)
);

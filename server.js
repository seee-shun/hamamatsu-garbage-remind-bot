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

app.post("/webhook", line.middleware(config), (req, res) => {
  console.log(req.body.events);
  Promise.all(req.body.events.map(handleEvent)).then((result) => {
    console.log(result);
    res.json(result);
  });
});

const client = new line.Client(config);

const handleEvent = async (e) => {
  let mes = "桃尻かなえ";
  const postalCodeCheck = /^[0-9]{3}-?[0-9]{4}$/;

  if (e.type !== "message" || e.message.type !== "text") {
    return Promise.resolve(null);
  }
  // if userId があるかチェック　もしないなら　users

  if (postalCodeCheck.test(e.message.text) === true) {
    // connection.query(
    //   `INSERT INTO users(userId) VALUES('${e.source.userId}')`,
    //   (err, results) => {
    //     if (err) throw err;
    //     console.log(results);
    //   }
    // );
    try {
      const URL = `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${e.message.text}`;
      const res = await axios.get(URL);
      const address = res.data.results[0].address3;
      connection.query(
        `SELECT garbage_number FROM cities WHERE name like '${address}%'`,
        (err, results) => {
          if (err) throw err;
          console.log(results);
          connection.query(
            `UPDATE users SET livedArea = '${results[0].garbage_number}' WHERE userId = '${e.source.userId}'`,
            (error, vals) => {
              if (error) throw error;
              console.log(vals);
            }
          );
        }
      );
      return client.pushMessage(e.source.userId, {
        type: "text",
        text: `あなたの住む地域を${address}に設定しました！`,
        // type: "template",
        // altText: "this is a confirm template",
        // template: {
        //   type: "confirm",
        //   text: `あなたの住む地域は${address}ですか？`,
        //   actions: [
        //     {
        //       type: "message",
        //       label: "はい",
        //       text: "はい",
        //     },
        //     {
        //       type: "message",
        //       label: "いいえ",
        //       text: "いいえ",
        //     },
        //   ],
        // },
      });
    } catch (error) {
      console.log(`error:${error}`);
      return client.pushMessage(e.source.userId, {
        type: "text",
        text: "存在しない住所です。正しい郵便番号を入力してください",
      });
    }
  }

  if (e.message.text === "明日のごみは？") {
    const time = new Date();
    let month = time.getMonth() + 1;
    let day = time.getDate();
    let hour = time.getHours();
    time.setDate(time.getDate() + 1);
    month = time.getMonth() + 1;
    day = time.getDate();

    // 日付整形
    const month_zero = ("00" + month).slice(-2);
    const day_zero = ("00" + day).slice(-2);
    const tomorrow = "2021-" + month_zero + "-" + day_zero;

    connection.query(
      `SELECT livedArea from users WHERE userId = '${e.source.userId}'`,
      (err, results) => {
        if (err) throw err;
        console.log(results[0]);
        const garbage = results[0].livedArea;
        // クエリ文
        const sql = "SELECT * FROM garbage_days WHERE day = ?";
        connection.query(sql, tomorrow, (error, vals) => {
          let mes = vals.garbage;
          if (mes == "undefined") {
            mes = "なし";
          }
          client.pushMessage(e.source.userId, {
            type: "text",
            text: "明日のごみは" + mes + "です！",
          });
          console.log(vals);
        });
      }
    );

    connection.query(sql, tomorrow, (err, results) => {
      console.log(results);
      return client.pushMessage(e.source.userId, {
        type: "text",
        text: date,
      });
    });
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

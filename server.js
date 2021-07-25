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
  let postalCodeCheck = /^[0-9]{3}-[0-9]{4}$/;
  console.log(postalCodeCheck.test(e.message.text));
  if (e.type !== "message" || e.message.type !== "text") {
    return Promise.resolve(null);
  }
  if (e.message.text === "432-8012") {
    const URL = `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${e.message.text}`;
    console.log(URL);
    const res = await axios.get(URL);
    console.log(res);
    console.log(res.results);
    console.log(res.results[0]);
    console.log(res.results[0].address3);
    return client.pushMessage(e.source.userId, {
      type: "text",
      text: URL,
    });
  }

  // if (postalCode.test(e.message.text) === true) {
  //   return client.pushMessage(e.source.userId, {
  //     type: "text",
  //     text: `あなたの住む地域は${address}ですか？`,
  //   });
  // }

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

// const getArea = async (postalCode) => {

//   // const address = res.results[0].address3;
// };

app.listen(PORT, () =>
  console.log(`Hamamatsu Garbage remind bot listening on port ${PORT}!`)
);

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

const usersRouters = require("./routers/users");
app.use(usersRouters);

const offersRouters = require("./routers/offers");
app.use(offersRouters);

app.listen(process.env.PORT, () => {
  try {
    console.log("LIVE!!!!!!!!!");
  } catch (error) {
    console.log({ error: error.message });
  }
});

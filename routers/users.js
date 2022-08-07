const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const EncBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    if (!req.body.username) {
      res.status(400).json({ error: { message: "Missing Parameter" } });
    }
    if ((await User.findOne({ email: req.body.email })) === null) {
      const salt = uid2(16);
      const newUser = new User({
        email: req.body.email,
        account: {
          username: req.body.username,
        },
        newsletter: req.body.newsletter,
        token: uid2(16),
        hash: SHA256(req.body.password + salt).toString(EncBase64),
        salt: salt,
      });
      await newUser.save();
      const user = await User.findOne({ email: req.body.email });
      res.json({
        id: user.id,
        token: newUser.token,
        account: { username: newUser.account.username },
      });
    } else {
      res.status(400).json({ error: { message: "Email already exist" } });
    }
  } catch (error) {
    console.log({ error: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    if (req.body.email && req.body.password) {
      const user = await User.findOne({ email: req.body.email });
      const hash = SHA256(req.body.password + user.salt).toString(EncBase64);
      if (hash === user.hash) {
        res.json({
          id: user.id,
          token: user.token,
          account: {
            username: user.account.username,
          },
        });
      } else {
        res.status(400).json({ error: { message: "Access not authorized" } });
      }
    } else {
      res.status(400).json({ error: { message: "Missing Parameter" } });
    }
  } catch (error) {
    console.log({ error: error.message });
  }
});
module.exports = router;

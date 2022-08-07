const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  if (req.headers) {
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });
    req.user = user;
    next();
  } else {
    res.status(400).json({ error: { message: "token Missing" } });
  }
};

module.exports = isAuthenticated;

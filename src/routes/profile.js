const express = require("express");
const router = express.Router();

const User = require("../models/user");
const userAuth = require("../middlewares/auth");

//update user profile

router.get("/profile/view", userAuth, async (req, res, next) => {
  const user = req.user;
  try {
    res.status(200).json({
      message: user.firstName + "your data is here",
      user,
    });
  } catch (err) {
    res.status(400).json({ ERROR: err.message });
  }
});

module.exports = router;

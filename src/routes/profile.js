const express = require("express");
const router = express.Router();

const User = require("../models/user");
const userAuth = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const validator = require("validator");
const bcrypt = require("bcrypt");

//get the user profile
router.get("/profile/view", userAuth, async (req, res, next) => {
  try {
    const user = req.user;
    const userId = req.user._id;

    const userData = await User.findById(userId);

    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: user.firstName + " your data is here",
      data: userData,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

//update user profile
router.patch("/profile/edit", userAuth, async (req, res, next) => {
  console.log("In update page ");
  // 1. get the user data from req.body
  //  ** when updating user data don't allow to update or modify user emailId and password
  // 3. varify and  validate the user entered data
  // 4. then update the field user was specified
  // 5. save the updated data
  //  send the response
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid edit request.");
    }

    const loggedInUser = req.user;
    // console.log("afterLoggediN", req.body);

    Object.keys(req.body).forEach((key) => {
      if (key === "address") {
        Object.keys(req.body.address).forEach((innerKey) => {
          loggedInUser.address[innerKey] = req.body.address[innerKey];
        });
      }
      // console.log(key, loggedInUser[key], typeof key);

      loggedInUser[key] = req.body[key];
    });

    await loggedInUser.save();
    // console.log(">>", loggedInUser);

    res.status(200).json({
      success: true,
      message: `${loggedInUser.firstName} your profile was updated successfully.`,
      data: loggedInUser.toObject(),
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error: " + err.message,
    });
  }
});

//update or reset password
router.patch("/profile/password", userAuth, async (req, res, next) => {
  console.log("In the update password api");
  // 1. get the user entered emailId, old password and and new Password
  // 2. verify that they are in the db or not
  // 3. validate the new password for stongness
  // 4. hash this password
  // 5. update the document with new password.
  // 5. save the user document

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new Error("User not found.");
    }
    const { emailId, oldPassword, newPassword } = req.body;

    if (req.user.emailId !== emailId) {
      throw new Error("Invalid emailId");
    }

    //compare oldPassword with already stored password
    const isOldPwMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPwMatch) {
      throw new Error("Incorrect old password.");
    }

    if (!validator.isStrongPassword(newPassword)) {
      throw new Error(
        "Password must contain atleast special charector and number",
      );
    }

    const hashPW = await bcrypt.hash(newPassword, 10);

    user.password = hashPW;

    await user.save();

    res.status(200).json({
      success: false,
      message: "Password updated successfully.",
    });
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});
module.exports = router;

const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  validateSignupData,
  validateLoginData,
} = require("../utils/validation");

const User = require("../models/user");

router.get("/test", (req, res, next) => {
  console.log("get post");
  res.send("hii");
});

router.post("/signup", async (req, res, next) => {
  // 1. extract user details from req.body
  //  i. validate the user details
  // 2. take user model
  // 3. hash the password using bcrypt.js
  // 4. save the user
  // Now if want we can directly log into the application
  // 1. generate token using jwt
  // 2. store token in cookie for automatic loggin from the webpage
  // 3. send the json responce
  // console.log(req.body);

  try {
    const { firstName, lastName, emailId, password } = req.body;
    if (!validateSignupData(req)) {
      throw new Error("Enter correct credientials");
    }
    // validateSignupData(req);

    const hashPW = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashPW,
    });

    const savedUser = await user.save();

    //directly loggin into application after signup
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      // secure:true  //works only on https
      sameSite: "lax",
      expires: new Date(Date.now() + 8 * 3600000),
    });
    res.status(201).json({
      message: "user created successfuly.",
      data: savedUser,
      userId: savedUser._id,
    });
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
});

//Login api
router.post("/login", async (req, res, next) => {
  // 1.get the login email and password from req.body that user entered
  //  validate the login credientials
  // 2. verify the password with stored password
  // 3. if password is verified generate the token isJWT
  // 4. store token in cookie
  //   to read cookie use cookie parser
  // 5. send the cookie to the browser

  const { emailId, password } = req.body;

  try {
    // if (!validateLoginData(req)) {
    //   throw new Error("Invalid Credientials.");
    // }
    validateLoginData(req);

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credientials.");
    }
    //Decrypt the stored password and verify
    // const isPasswrodValid = await bcrypt.compare(password, user.password);

    const isPasswrodValid = await user.getVerifiedPassword(password);
    if (!isPasswrodValid) {
      throw new Error("Invalid credientials.");
    }

    // const token = jwt.sign(
    //   {
    //     _id: user._id,
    //   },
    //   "Ramesh@$Raithu",
    //   { expiresIn: "7d" },
    // );
    const token = await user.getJWT();
    // console.log("token: ", token);

    //Store the jwt token  in cookie(for better safety)
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true, //works only on https
      sameSite: "lax",
      expires: new Date(Date.now() + 8 * 3600000),
    });
    //send the  cookie to store in the browser.
    res.status(200).json({
      message: `${user.firstName} you loggedIn`,
      user,
    });
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
});

// router.post("/logout", async (req, res, next) => {
//   //set cookie to null then you will be loggedout
//   res.cookie("token", null, {
//     expires: new Date(Date.now()),
//   });
//   res.send("User Logout!!");
// });

// industry standard logout
router.post("/logout", (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    secure: true,
    sameSite: "lax",
  });

  res.status(200).json({
    message: "Logged out successfully.",
  });
});
module.exports = router;

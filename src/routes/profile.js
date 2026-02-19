const express = require("express");
const router = express.Router();

const User = require("../models/user");
const userAuth = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const validator = require("validator");
const bcrypt = require("bcrypt");

//get the user profile
router.get("/profile/view", userAuth, async (req, res, next) => {
  const user = req.user;
  try {
    res.status(200).json({
      message: user.firstName + " your data is here",
      user,
    });
  } catch (err) {
    res.status(400).json({ ERROR: err.message });
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

    Object.keys(req.body).forEach((key) => {
      if (key === "address") {
        Object.keys(req.body.address).forEach((innerKey) => {
          loggedInUser.address[innerKey] = req.body.address[innerKey];
        });
      }
      loggedInUser[key] = req.body[key];
    });

    await loggedInUser.save();

    res.status(200).json({
      message: `${loggedInUser.firstName} your profile was updated successfully.`,
      loggedInUser,
    });
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

//update or reset password
router.patch("/profile/password", userAuth, async (req, res, next) => {
  console.log("In the update password api");
  // 1. get the user entered emailId, old password and and new Password
  // 2. verify that they are in the db or not
  // 3. validate the new password of stongness
  // 4. hash this password
  // 5. update the document with new password.
  // 5. save the user document

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new Error("User not found.");
    }
    const { email, oldPassword, newPassword } = req.body;

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

    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});
module.exports = router;

/*
read my backend code , and for that in the frontend directory  create a front end code according to  backend.  the url of the backend apis is http://localhost:7777/apis . this is like an ecommerse mobile app naming Raithu.  If I open the app  1. I 1.want to see app logo and its related images on the head of the page 2. i want to scrolling type ui to see the grain products stored in db using backend/src/models/grain.js schema and backend/src/countrollers/grain.js  3. in the webpage i just wants to see loggin user image in the round circle  at the top right corner of the mobile page at the home page right corner side, 3. in the body page i want to see all the images of the products for each product i want to see action buttons for buy and details when user click on these buttons the backend apis triggers accoridng to that you insert the apiendpoint addresses according to that everything i wrote. upto this write required code in the raithu/frontend directory follow the backend structure for creating and files and modules Dont distrub backend code code now write code using react framework and its libraries you can use html css javascript if there is any need, I wil just use command npm install and npm start then it should work? dont distrub or overwrite anything in backend folder?
*/
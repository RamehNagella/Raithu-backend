const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  // get the token stored in cookie (req.cookies)
  // ** TO GET THE COOKIE WE NEED A COOKIE-PARSER PACKAGE, USE THIS BEFORE ROUTES DEFINED IN app.js
  // then verify the jwtoken with standard token

  try {
    const { token } = req.cookies;
    // console.log(token);

    if (!token) {
      return res.status(401).json("Please Login");
    }

    const decodedToken = jwt.verify(token, "Ramesh@$Raithu");
    if (!decodedToken) {
      throw new Error("Invalid token!");
    }

    const { _id } = decodedToken;

    const user = await User.findById(_id);

    // attach this user document to the req so that for every api we can get access
    req.user = user;
    next();
  } catch (err) {
    res.status(400).json("ERROR: " + err.message);
  }
};

module.exports = userAuth;

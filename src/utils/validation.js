const validator = require("validator");

const validateSignupData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    console.log("1");
    // throw new Error("First name and last name are required.");
    return false;
  } else if (!validator.isEmail(emailId)) {
    // throw new Error("Email is not valid.");
    console.log("3");
    return false;
  } else if (!validator.isStrongPassword(password)) {
    // throw new Error("please enter the strong password.");
    // console.log("4");
    return false;
  } else {
    console.log("t");

    return true;
  }
};

const validateLoginData = (req) => {
  const { emailId, password } = req.body;

  if (!validator.isEmail(emailId)) {
    return false;
  } else if (!emailId || !password) {
    return false;
  } else {
    return true;
  }
};

module.exports = {
  validateSignupData,
  validateLoginData,
};

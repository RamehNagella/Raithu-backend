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

const validateEditProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "age",
    "photoUrl",
    "mobile",
    "address",
    "houseNumber",
    "colony",
    "village",
    "mandal",
    "district",
    "pincode",
  ];
  const isUpdateAllowed = Object.keys(req.body).every((key) =>
    allowedEditFields.includes(key),
  );
  console.log(isUpdateAllowed);

  if (!isUpdateAllowed) {
    throw new Error("You are not allowed to this fields or Enter correct data");
  }
  return isUpdateAllowed;
};

module.exports = {
  validateSignupData,
  validateLoginData,
  validateEditProfileData,
};

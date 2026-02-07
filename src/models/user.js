const mongoose = require("mongoose");
const { Schema } = mongoose;
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    minLength: 4,
    maxLength: 50,
  },
  lastName: {
    type: String,
    required: true,
    minLength: 4,
    maxLength: 50,
  },
  emailId: {
    type: String,
    lowercase: true,
    required: true,
    unique: true,
    trim: true,

    validate: {
      validator: function (value) {
        console.log("Validating email: ", value);
        return validator.isEmail(value);
      },
      message: (props) => `Invalid email: ${props.value}`,
    },
  },
  password: {
    type: String,
    required: true,
    minLength: 5,
    validate(value) {
      if (!validator.isStrongPassword(value)) {
        throw new Error("Password is not strong enough: " + value);
      }
    },
  },
  age: {
    type: Number,
    min: 15,
  },
  photoUrl: {
    type: String,
    default:
      "https://i.pinimg.com/736x/36/69/ed/3669ed1bdbc3b511ecbb24ab1232dd2d.jpg",
    validate(value) {
      if (!validator.isURL(value)) {
        throw new Error("Invalid photo URL: " + value);
      }
    },
  },
  mobile: {
    type: String,
    // unique: true,
    // sparse: true, // allow multiple nulls
    trim: true,
    validate(value) {
      // Indian mobile numbers: 10 digits, starts with 6-9
      if (!/^[6-9]\d{9}$/.test(value)) {
        throw new Error("Invalid mobile number: " + value);
      }
    },
  },
  address: {
    houseNumber: {
      type: String,
      trim: true,
    },
    colony: {
      type: String,
      trim: true,
    },
    village: {
      type: String,
      trim: true,
    },
    mandal: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      validate(value) {
        //Indian PIN CODE: 6 digits
        if (!/^\d{6}$/.test(value)) {
          throw new Error("Invalid pincode: " + value);
        }
      },
    },
  },
});

// userSchema.index(
//   { mobile: 1 },
//   {
//     unique: true,
//     partialFilterExpression: {
//       mobile: { $exists: true, $ne: null },
//     },
//   },
// );

userSchema.methods.getVerifiedPassword = async function (passwordInputByUser) {
  const user = this;
  const HashedPassword = user.password;

  const validPassword = await bcrypt.compare(
    passwordInputByUser,
    HashedPassword,
  );

  return validPassword;
};

userSchema.methods.getJWT = async function () {
  const user = this;
  // console.log("method: ", user);

  const token = jwt.sign(
    {
      _id: user._id,
    },
    "Ramesh@$Raithu",
    { expiresIn: "7d" },
  );
  return token;
};

/*
Alternative (simpler & very common)
Handle mobile uniqueness manually

if (mobile) {
  const exists = await User.findOne({ mobile });
  if (exists) {
    throw new Error("Mobile already in use");
  }
}
*/
module.exports = mongoose.model("User", userSchema);

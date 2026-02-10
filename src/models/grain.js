const mongoose = require("mongoose");
const { Schema } = mongoose.Schema;
const validator = require("validator");
//the products which we will display on the page not users
const grainSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    grainType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    variety: {
      type: String, //Basmati, sona Masuri, etc
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // // images: {
    // //   type: [String],
    // //   default: [],
    // // },
    // images: [
    //   {
    //     url: String,
    //     uploadedBy: {
    //       type: String,
    //       enum: ["mobile", "web"],
    //     },
    //   },
    // ],
    photo: [
      {
        url: {
          type: String,
          required: true,
          validate: {
            validator: validator.isURL,
            message: "Invalid image URL",
          },
        },
        source: {
          type: String,
          enum: ["mobile", "web"],
          required: true,
        },
        _id: false,
      },
    ],
    price: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0,
      get: (v) => Number(v.toString()),
    },
    unit: {
      type: String,
      enum: ["kg", "quintal", "ton"],
      default: "kg",
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerName: {
      type: String,
      ref: "User",
      required: true,
    },
    location: {
      houseNumber: String,
      colony: String,
      village: String,
      mandal: String,
      district: String,
      pincode: String,
    },
    qualityGrade: {
      type: Number,
      enum: [1, 2, 3],
    },
    harvestDate: Date,
    isOrganic: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priceHistory: [
      {
        price: Number,
        date: Date,
        _id: false,
      },
    ],
  },
  { timestamps: true },
);

grainSchema.set("toJSON", { getter: true });

module.exports = mongoose.model("Grain", grainSchema);

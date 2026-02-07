const mongoose = require("mongoose");
const { Schema } = mongoose.Schema;
const validator = require("validator");
//the products which we will display on the page not users
const productSchema = new mongoose.Schema(
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
    images: [
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
        },
      },
    ],
    price: {
      type: Number,
      required: true,
      min: 0,
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
    location: {
      village: String,
      mandal: String,
      district: String,
      state: String,
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
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);

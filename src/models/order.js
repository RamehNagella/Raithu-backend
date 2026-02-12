const mongoose = require("mongoose");
const validator = require("validator");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productImageUrl: String,
        productName: String,
        quantity: Number,
        unit: String, //Kg /quintal
        pricePerUnit: Number,
        status: {
          type: String,
          enum: ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
          default: "PLACED",
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Order", orderSchema);

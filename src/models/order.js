const mongoose = require("mongoose");

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
        productName: String,
        quantity: Number,
        unit: String, //Kg /quintal
        pricePerUnit: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PLACED", "DELIVERED", "CANCELLED"],
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Order", orderSchema);

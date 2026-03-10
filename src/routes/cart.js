const express = require("express");
const userAuth = require("../middlewares/auth");
const Cart = require("../models/cart");
const router = express.Router();

router.post("/cart/add", userAuth, async (req, res, next) => {
  const { productId } = req.body;
  const user = req.user;
  const userId = req.user._id;
  console.log("1", productId);
  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "ProductId is required",
    });
  }
  const mongoose = require("mongoose");

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid productId",
    });
  }
  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ productId, quantity: 1 }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) =>
          item.productId &&
          productId &&
          item.productId.toString() === productId,
      );
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += 1;
      } else {
        cart.items.push({ productId, quantity: 1 });
      }
    }
    console.log("2", cart);

    const cartData = await cart.save();

    res.status(200).json({
      success: true,
      message: `${user.firstName}, item added to cart`,
      data: cartData,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/cart", userAuth, async (req, res, next) => {
  try {
    const user = req.user;
    const cart = await Cart.findOne({ userId: req.user._id }).populate(
      "items.productId",
    );
    console.log("get", cart);

    res.status(200).json({
      success: true,
      message: `${user.firstName} here is your cart`,
      data: cart,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;

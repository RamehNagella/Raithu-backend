const express = require("express");
const userAuth = require("../middlewares/auth");
const Cart = require("../models/cart");
const Grain = require("../models/grain");
const router = express.Router();
const mongoose = require("mongoose");

router.post("/cart/add", userAuth, async (req, res, next) => {
  const { productId } = req.body;
  // console.log("//", req.body);
  const user = req.user;
  const userId = req.user._id;
  // console.log("1", productId);
  // console.log("1", userId);
  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "ProductId is required",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid productId",
    });
  }
  try {
    const grain = await Grain.findById(productId);

    if (grain.sellerId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Its your grain, You don't need to add to cart.",
      });
    }
    let cart = await Cart.findOne({ userId });
    // console.log("ccc", cart);

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
    // console.log("2", cart);

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
    // console.log("get", cart);

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

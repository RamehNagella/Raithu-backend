const express = require("express");
const userAuth = require("../middlewares/auth");
const authorizeRoles = require("../middlewares/authorizeRoles");
const router = express.Router();

const mongoose = require("mongoose");

const Grain = require("../models/grain");
const Order = require("../models/order");
const user = require("../models/user");

//create order
router.post("/orders/place-order", userAuth, async (req, res, next) => {
  // get product id from req.body
  // verify that is valid or not
  // verify the product is present in db or not
  // check for availability of the product
  // if available place an order
  // when user placed number of items then avialable quantity has to be decreased in the databased of that particular item
  //  when user clicks on buy/order then we will get the info about product like
  // {productId,quantity, unit} this will be stored in the req.body as items as we defined in teh orders schema

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items required." });
    }
    let totalAmount = 0;
    const orderItems = [];
    /* for (const item of items) {
      //get the product from the db using productId send from the user
      const grainProduct = await Grain.findById(item.productId);

      if (!grainProduct) {
        return res.status(400).json({ message: "Product not found." });
      }
      if (
        !grainProduct.availableQuantity ||
        grainProduct.availableQuantity <= 0
      ) {
        return res.status(403).json({ message: "Stock over" });
      }
      if (grainProduct.availableQuantity < item.quantity) {
        return res.status(400).json({
          message: `Sorry, only ${grainProduct.availableQuantity} units of ${grainProduct.name} available`,
        });
      }

      const pricePerUnit = grainProduct.price;
      const itemTotal = pricePerUnit * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: grainProduct._id,
        productName: grainProduct.name,
        quantity: item.quantity,
        unit: item.unit,
        pricePerUnit,
      });
      //update the db document quantity in the database
      console.log(
        grainProduct.availableQuantity,
        typeof grainProduct.availableQuantity,
      );
      grainProduct.availableQuantity -= Number(item.quantity);
      console.log(
        grainProduct.availableQuantity,
        typeof grainProduct.availableQuantity,
      );
      //save the updated document
      await grainProduct.save();
      console.log(
        grainProduct.availableQuantity,
        typeof grainProduct.availableQuantity,
      );
    }
    */

    //replace above code with db level operation

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Enter correct data for ordering.",
        });
      }
      const updatedProduct = await Grain.findOneAndUpdate(
        {
          _id: item.productId,
          availableQuantity: { $gte: item.quantity },
        },
        {
          $inc: { availableQuantity: -item.quantity },
        },
        { new: true, session },
      );

      // If update failed either product doesn't exit or stock is over
      if (!updatedProduct) {
        return res.status(400).json({
          message: "Insufficient stock",
        });
      }

      // const pricePerUnit = updatedProduct.price;
      // const itemTotal = pricePerUnit * item.quantity;
      // totalAmount += itemTotal;
      totalAmount += updatedProduct.price * item.quantity;

      orderItems.push({
        productId: updatedProduct._id,
        productName: updatedProduct.name,
        productImage: updatedProduct.photo[0].url,
        quantity: item.quantity,
        pricePerUnit: updatedProduct.price,
      });
    }

    const order = await Order.create(
      [
        {
          userId,
          items: orderItems,
          totalAmount,
          status: "PLACED",
        },
      ],
      { session },
    );
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({ message: err.message });
  }
});

//get my orders
router.get("/orders/my-orders", userAuth, async (req, res, next) => {
  // get the userId from req.user
  // get the orders from Orders collection using id
  // verify orders
  // do the pagination

  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login again",
      });
    }

    const page = parseInt(req.query.page) || 1; // page number NOT TOTAL PAGES
    const limit = parseInt(req.query.limit) || 3; // PER PAGE these(limit) orders will be shown
    const skip = (page - 1) * limit; // these many orders will skip in each page

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // console.log("orders: ", orders);
    // console.log(JSON.stringify(orders, null, 2));
    const totalOrders = await Order.countDocuments({ userId });
    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      success: true,
      message: "You orders fetched successfully.",
      currentPage: page,
      totalPages,
      totalOrders,
      hasMore: page < totalPages, // for infinite scroll
      data: orders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//get single order
router.get("/orders/:orderId", userAuth, async (req, res, next) => {
  // get userId from req.user and orderId from req.params
  // verify
  // then findOne the order document with orderId
  // verify req.user._id === order.userId
  // if true show signle order
  try {
    const loggedInUser = req.user;
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID or Please click on  ordered product",
      });
    }

    //get the order from db
    const singleOrder = await Order.findById(orderId)
      .select(
        "userId items.productId items.productImage items.productName items.quantity items.pricePerUnit totalAmount status",
      )
      .lean();

    if (!singleOrder) {
      return res.status(404).json({
        success: false,
        message: "Your ordered Product was not found.",
      });
    }

    //check ownership of order
    // if (!singleOrder.userId.equals(loggedInUser._id)) {
    if (singleOrder.userId.toString() !== loggedInUser._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own orders",
      });
    }
    res.status(200).json({
      success: true,
      message: `${loggedInUser.firstName}, your order fetched successfully`,
      data: singleOrder,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//cancel Order (entire order not single item in the order)
router.patch("/orders/:orderId/cancel", userAuth, async (req, res, next) => {
  // get the orderId and userId  and verify
  // get the ordered Products using orderedId
  // verify orderId with ordered Product Id
  // verify ordered created userId with loggedIn userId
  // then update the order status with "cancelled"
  // restore the products in grain collection
  // send response
  try {
    const { orderId } = req.params;
    const loggedInUser = req.user;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(404).json({
        success: false,
        message: "You ordered product was not found",
      });
    }
    // get the ordered product
    const orderedProduct = await Order.findById(orderId);

    if (!orderedProduct) {
      return res.status(404).json({
        success: false,
        message: "You requested product was not ordered.",
      });
    }
    if (orderedProduct.userId.toString() !== loggedInUser._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only modify your own orders",
      });
    }
    if (orderedProduct.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Order already cancelled",
      });
    }
    if (orderedProduct.status === "DELIVERED") {
      return res.status(400).json({
        success: false,
        message: "You ordered product was deliverd. You cannot cancel",
      });
    }

    // 🔹 Restore stock
    //update the Grain Product resource to previous value before it is ordering
    // find then update
    for (let item of orderedProduct.items) {
      await Grain.findByIdAndUpdate(item.productId, {
        $inc: { availableQuantity: item.quantity },
      });
      item.status = "CANCELLED";
    }
    //cancel the order (order has multiple different product )
    // here we can cancel entire order or we can cancel one item at a time
    // here we dont delete resourse but we change status of the order to cancel
    orderedProduct.status = "CANCELLED";

    await orderedProduct.save();

    return res.status(200).json({
      message: "Order cancelled successfully.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

//cancel one item from order
router.patch(
  "/orders/:orderId/items/:itemId/cancel",
  userAuth,
  async (req, res, next) => {
    // get the loggedIn userId  from req.user and orderId and itemId
    // verify the ids
    // get the ordered product
    // check order exists
    // check ownership of the order
    // Restore the item stock
    // remove item OR mark item status = "CANCELLED"
    // RECALCULATE THE TOTAL AMOUNT
    // If no items left  mark entire order cancelled
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const loggedInUser = req.user;
      const { orderId, itemId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(orderId) ||
        !mongoose.Types.ObjectId.isValid(orderId)
      ) {
        throw new Error("Invalid orderId or item Id");
      }

      const order = await Order.findById(orderId).session(session);
      if (!order) {
        throw new Error("Order not found");
      }
      //check ownership of the order
      if (order.userId.toString() !== loggedInUser._id.toString()) {
        throw new Error("You can modify your own orders only ");
      }
      if (order.status === "CANCELLED") {
        throw new Error("Order already cancelled");
      }

      if (order.status === "DELIVERED") {
        throw new Error("Delivered orders cannot be cancelled");
      }
      //   {
      //   /*
      //         let amountToSubtract = 0;
      //         order.items.forEach(item => {
      //           if (item.status === "CANCELLED") {
      //             throw new Error("item already cancelled")
      //           }
      //           if (item.status === "DELIVERED") {
      //             throw new Error("item was delevered")
      //           }
      //           if (item._id.toString() = itemId.toString()) {
      //             amountToSubtract = quantity * pricePerUnit

      //             item.status = "CANCELLED";
      //           }

      //         })
      //         */
      // }
      //find requrested item
      const item = order.items.id(itemId);
      //OR order.items.find(i => i._id.toString() === itemId)

      if (!item) {
        throw new Error("item not found.");
      }
      if (item.status === "CANCELLED") {
        throw new Error("Item already cancelled");
      }
      if (item.status === "DELIVERED") {
        throw new Error(" item already deliverd");
      }

      //Restore stock only for this item
      await Grain.findByIdAndUpdate(
        item.productId,
        { $inc: { availableQuantity: item.quantity } },
        { session },
      );

      // mark item cancelled
      item.status = "CANCELLED";

      //update order amount
      // order.totalAmount -= Number(item.quantity) * Number(item.pricePerUnit);
      // or
      order.totalAmount = order.items
        .filter((item) => item.status !== "CANCELLED")
        .reduce(
          (acc, cur) => acc + Number(cur.quantity) * Number(cur.pricePerUnit),
          0,
        );

      //if all the items were cancelled then order should be cancelled
      if (Number(order.totalAmount) <= 0 && order.status !== "CANCELLED") {
        order.status = "CANCELLED";
      }
      await order.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: "item cancelled successfully",
        data: order,
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
);

const statusFlow = {
  PLACED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
//check the status of the order and move status forward or backward
router.patch(
  "/orders/:orderId/status",
  userAuth,
  authorizeRoles("admin"), //only admin allowed to change status but user can see status
  async (req, res, next) => {
    // get the orderId and status
    // get the order from db using orderId and verify
    // check status
    // then add the current status
    // follow status flow constrains
    const orderStatus = [
      "PLACED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { orderId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }
      const newStatus = status.trim().toUpperCase();
      if (!orderStatus.includes(newStatus)) {
        return res.status(400).json({
          success: false,
          message: `Allowed status are ${orderStatus.join(" ")}`,
        });
      }

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new Error("OrderId is not valid.");
      }

      const order = await Order.findById(orderId).session(session);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      const currentStatus = order.status;

      if (newStatus === "CANCELLED") {
        if (currentStatus === "SHIPPED") {
          return res.status(400).json({
            success: false,
            message: "You cannot cancel order after shipped.",
          });
        }
      }

      if (!statusFlow[currentStatus].includes(newStatus)) {
        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
          success: false,
          message: `Cannot change status from ${currentStatus} to ${newStatus}`,
        });
      }

      if (newStatus === "CANCELLED") {
        //restore product resource
        for (const item of order.items) {
          await Grain.findByIdAndUpdate(
            item.productId,
            {
              $inc: { availableQuantity: item.quantity },
            },
            { session },
          );
          item.status = newStatus;
        }

        order.totalAmount = 0;
      }
      // if 'status' from user includes status flow then update order to that status
      order.status = newStatus;
      order.items.forEach((item) => {
        item.status = newStatus;
      });

      await order.save();

      await commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: order,
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
);
module.exports = router;

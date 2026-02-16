//in this api we will add products we have
// display the products
// add products api
// get products api
//feed api
//get single product

const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const Grain = require("../models/grain");
const userAuth = require("../middlewares/auth");
const {
  validateGrainData,
  validateUpdateFields,
  validateGrainUpdateValues,
} = require("../utils/validation");
const {
  mapUserLocation,
  mapGrainToPublicResponse,
} = require("../utils/helper");

//add grains to database
router.post("/grain/add", userAuth, async (req, res, next) => {
  // console.log(req.body);
  // 1. get the product fields from request body
  // 2. validate input (required fields, datatypes, pric>0,validgraintype)
  // 3 sanitize input (trim strings, prevent unexpected fields)
  // 4. create and save document
  // 5. send resonse (success 201, )
  try {
    validateGrainData(req);

    //convert price into number before storing in db
    req.body.price = Number(req.body.price);
    if (isNaN(req.body.price)) {
      throw new Error("Price must be a number");
    }

    req.body.sellerId = req.user._id;
    req.body.sellerName = req.user.firstName;

    //fill the seller locatioin object (address details taken from req.user )
    // req.body.location = {};
    // Object.keys(req.user.address).forEach((key) => {
    //   req.body.location[key] = req.user.address[key];
    // });

    req.body.location = mapUserLocation(req.user.address);

    const createGrain = new Grain(req.body);

    /*
    const createGrain = new Grain({
      ...grainData,
      sellerId: req.user._id,
      sellerName: req.user.firstName,
      location: mapUserLocation(req.user.address),
    });
*/
    await createGrain.save();

    res.status(201).send({
      success: true,
      message: "your Grain is added successfully",
      data: createGrain,
    });
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

// get the products
router.get("/grain/grains", async (req, res, next) => {
  console.log("get grains products");
  // the prducts should be displayed for the UI weather user is logged in or not
  // get the products from the grains collection
  // then exclude selledId, sellerName, location
  // write the pagination
  //  for pagination : define limit get the cursor from req.query.curson

  try {
    // const grainTypes = await Grain.find({}, { _id: 0, grainType: 1 });
    // console.log(grainTypes);

    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const { cursor } = req.query;

    const query = {};
    //pagination logic
    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      query._id = { $lt: cursor };
    }

    const grains = await Grain.find(query)
      .sort({ _id: -1 }) //newest first
      .limit(limit)
      .select(
        "name price unit grainType variety harvestDate isOrganic availableQuantity createdAt",
      )
      .lean();

    // console.log(">>", grains);

    res.status(200).json({
      success: true,
      data: grains,
      nextCursor: grains.length ? grains[grains.length - 1]._id : null,
      hasMore: grains.length === limit,
    });
  } catch (err) {
    res.status(500).json("Error: " + err.message);
  }
});
// [
//   { grainType: "wheat" },
//   { grainType: "rice" },
//   { grainType: "rice" },
//   { grainType: "sorghum" },
// ];

//get the single grain
router.get("/grain/:grainId", async (req, res, next) => {
  // get the product id from req.params
  // get the requested product using id
  // then send the response
  try {
    const { grainId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(grainId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid grain ID",
      });
    }

    const grainData = await Grain.findById(grainId);

    if (!grainData) {
      return re.status(404).json({
        success: false,
        message: "Grain product not found",
      });
    }

    res
      .status(200)
      .json({ success: true, data: mapGrainToPublicResponse(grainData) });
  } catch (err) {
    // res.status(400).json("Error: " + err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

//update the grain
router.patch("/grain/:grainId", userAuth, async (req, res, next) => {
  // only loggedIn user can update the product
  // get the grainId from req.params and update values from req.body
  // verify the id is valid or not
  // 1. validate field names(allowed/not allowed)
  // 2. validate field values(types, ranges, enums, formats)
  // ********* ONLY THEN HIT THE DB *******
  // get the product from db using id
  // CHECK OWNERSHIP
  // update the document
  // send response
  try {
    const { grainId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(grainId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid grainId",
      });
    }

    const updateData = req.body;

    //check for update-document
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update data provided",
      });
    }

    const updateAllowedFields = [
      "name",
      "grainType",
      "variety",
      "description",
      "photo",
      "price",
      "unit",
      "availableQuantity",
      "qualityGrade",
      "isOrganic",
      "isActive",
    ];
    // Check if user-given fields are allowed to update

    const { isValid, notAllowedFields } = validateUpdateFields(
      updateData,
      updateAllowedFields,
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: `The following field(s) are not allowed to update: ${notAllowedFields.join(", ")}`,
      });
    }

    //check user- entered field value are valid or not

    validateGrainUpdateValues(updateData);

    const grainData = await Grain.findById(grainId);
    if (!grainData) {
      return res.status(404).json({
        success: false,
        message: "Grain product was not found",
      });
    }
    if (grainData.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only seller can authorized to update this grain",
      });
    }
    //update document
    Object.keys(updateData).forEach((key) => {
      grainData[key] = updateData[key];
    });
    await grainData.save();

    res.status(200).json({
      success: true,
      message: "Grain product updated successfully",
      data: grainData,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

//get price history of the grain
router.get("/grain/:grainId/price_history", async (req, res, next) => {
  // get the grainId and price history from req.params
  // verify the grainId is valid or not
  // get the grain document from the db
  // verify it
  // then extract only the priceHistory field from the document
  // then send response
  const { grainId, price_history: priceHistory } = req.params;
  if (!mongoose.Types.ObjectId.isValid(grainId)) {
    return res.status(400).json({
      success: false,
      message: " Invalid grainId",
    });
  }

  try {
    const grainPriceHistory =
      await Grain.findById(grainId).select("name priceHistory");
    console.log(grainPriceHistory);

    if (!grainPriceHistory || grainPriceHistory.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Grain product not found or has no price history",
      });
    }
    res
      .status(200)
      .json({ message: "priceHistoryPage", data: grainPriceHistory });
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

// delete the grain
router.delete("/grain/:grainId", userAuth, async (req, res, next) => {
  // console.log("In delete page");
  // get the grainId from req.param and verify is it valid or not
  // get the grain from db using grainId
  // here seller only allowed to delete the grain  and he also loggedIn the application
  // verify seller id and loggedIn user Id
  // if verified then delete the product from db using prodId
  try {
    const { grainId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(grainId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid grainId",
      });
    }
    const loggedInUser = req.user;

    //get the grain from db
    const grain = await Grain.findById(grainId);
    if (!grain) {
      return res.status(404).json({
        success: false,
        message: "Grain product was not found",
      });
    }
    // verify the grain is created by loggedIn user or not (Authorization)
    if (grain.sellerId.toString() !== loggedInUser._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only seller can authorized to delet the grain product.",
      });
    }
    //delete the product
    await Grain.findByIdAndDelete(grainId);

    res.status(200).json({
      message: true,
      message: "Your Grain was deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

//

module.exports = router;

/*
🔟 How Mobile App Will Display This
Grain Card Shows:

Grain name

Price

Quantity

Seller name

Buy button (buyer)

Edit/Delete (seller only)

👉 Backend decides what buttons user can see based on role.
*/

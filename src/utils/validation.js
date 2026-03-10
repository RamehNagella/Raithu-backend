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
    "photoUrl",
    "age",
    "mobile",
    "address",
    "houseNumber",
    "colony",
    "village",
    "mandal",
    "district",
    "state",
    "pincode",
  ];
  console.log("validation?>", req.body);
  const isUpdateAllowed = Object.keys(req.body).every((key) =>
    allowedEditFields.includes(key),
  );
  console.log("valid", isUpdateAllowed);

  if (!isUpdateAllowed) {
    throw new Error("You are not allowed to this fields or Enter correct data");
  }
  return isUpdateAllowed;
};
/*
const validateGrainData = (req, res) => {
  const requriedFields = [
    "name",
    "grainType",
    "variety",
    "description",
    "photo",
    "price",
    "unit",
    "availableQuantity",
  ];
  const allowedFields = [
    "name",
    "grainType",
    "variety",
    "photo",
    "price",
    "unit",
    "availableQuantity",
    "sellerId",
    "location",
    "isActive",
    "qualityGrade",
    "isOrganic",
    "isActive",
    "priceHistory",
    "description",
  ];

  //check only requried fields
  const missingFields = requriedFields.filter((field, i, arr) => {
    // console.log(`${i + 1}: ${!req.body.hasOwnProperty(field)}`);

    return !req.body.hasOwnProperty(field);
  });

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  //check for unexpected fields
  const extraFields = Object.keys(req.body).filter((key) => {
    return !allowedFields.includes(key);
  });

  if (extraFields.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Unexpected fields: ${extraFields.join(", ")}`,
    });
  }
  return true;
};
*/
const validateGrainData = (req) => {
  const requiredFields = [
    "name",
    "grainType",
    "variety",
    "description",
    "photo",
    "price",
    "unit",
    "availableQuantity",
  ];

  const allowedFields = [
    "name",
    "grainType",
    "variety",
    "photo",
    "price",
    "unit",
    "availableQuantity",
    "location",
    "isActive",
    "qualityGrade",
    "isOrganic",
    "priceHistory",
    "description",
    "sellerName",
    "harvestDate",
  ];

  // 1️⃣ required keys
  const missingFields = requiredFields.filter(
    (field) => !Object.prototype.hasOwnProperty.call(req.body, field),
  );

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  // 2️⃣ unexpected fields
  const extraFields = Object.keys(req.body).filter(
    (key) => !allowedFields.includes(key),
  );

  if (extraFields.length > 0) {
    throw new Error(`Unexpected fields: ${extraFields.join(", ")}`);
  }

  // 3️⃣ value validation

  if (typeof req.body.name !== "string" || !req.body.name.trim()) {
    throw new Error("Name must be a non-empty string");
  }
  if (typeof req.body.variety !== "string" || !req.body.variety.trim()) {
    throw new Error("type of grain variety must be specified.");
  }

  const price = Number(req.body.price);
  if (isNaN(price) || price <= 0) {
    throw new Error("Price must be a number greater than 0");
  }

  if (!["kg", "quintal", "ton"].includes(req.body.unit)) {
    throw new Error("Invalid unit");
  }
  req.body.availableQuantity = Number(req.body.availableQuantity);
  if (
    typeof req.body.availableQuantity !== "number" ||
    req.body.availableQuantity < 0
  ) {
    throw new Error("Invalid availableQuantity");
  }

  // // photo
  if (!Array.isArray(req.body.photo)) {
    req.body.photo = [req.body.photo];
    // console.log(req.body.photo);
  }

  if (!Array.isArray(req.body.photo) || req.body.photo.length === 0) {
    throw new Error("At least one photo is required");
  }

  req.body.photo.forEach((img, i) => {
    if (!img.url || !validator.isURL(img.url)) {
      throw new Error(`Invalid photo url at index ${i}`);
    }
    if (!["web", "mobile"].includes(img.source)) {
      throw new Error(`Invalid photo source at index ${i}`);
    }
  });

  // // normalize
  // req.body.name = req.body.name.trim();
  // req.body.price = price;
};
//validate update fields
const validateUpdateFields = (updateData, updateAllowedFields) => {
  // cleaner and simple version
  const updateKeys = Object.keys(updateData);
  console.log(">>", updateKeys);

  const notAllowedFields = updateKeys.filter(
    (key) => !updateAllowedFields.includes(key),
  );

  return {
    isValid: notAllowedFields.length === 0,
    notAllowedFields,
  };
  // or

  // if (notAllowedFields.length > 0) {
  //   return res.status(400).json({
  //     success: false,
  //     message: `The following field(s) are not allowed to upadte: ${notAllowedFields.join(" ")} `,
  //   });
  // }
  /*
    // speed but harder to debug
    const isUpdateAllowed = Object.keys(updateData).every((key) =>
      updateAllowedFields.includes(key),
    );
    if (!isUpdateAllowed) {
      const notAllowedFields = Object.keys(updateData).filter(
        (key) => !updateAllowedFields.includes(key),
      );
      return res.status(400).json({
        success: false,
        message: `The follwoing field(s)  are not allowed to update: ${notAllowedFields.join(", ")}`,
      });
    }
    */
};

//validate field values came for update
const validateGrainUpdateValues = (updateData) => {
  if ("name" in updateData) {
    if (typeof updateData.name !== "string" || !updateData.name.trim()) {
      throw new Error("Name must be a non-empty string.");
    }
  }
  if ("variety" in updateData) {
    if (typeof updateData.variety !== "string" || !updateData.variety.trim()) {
      throw new Error("Grain variety must be specified.");
    }
  }

  if ("price" in updateData) {
    const price = Number(updateData.price);
    if (isNaN(price) || price <= 0) {
      throw new Error("Price must be a number greater than 0");
    }
  }
  if ("unit" in updateData) {
    if (!["kg", "quintal", "ton"].includes(updateData.unit)) {
      throw new Error("Invalid unit");
    }
  }
  if ("availableQuantity" in updateData) {
    if (
      typeof updateData.availableQuantity !== "number" ||
      updateData.availableQuantity < 0
    ) {
      throw new Error("Invalid available quantity");
    }
  }
  if ("isOrganic" in updateData) {
    if (typeof updateData.isOrganic !== "boolean") {
      throw new Error("isOrganic must be boolean");
    }
  }

  if ("photo" in updateData) {
    if (!Array.isArray(updateData.photo)) {
      updateData.photo = [updateData.photo];
    }

    if (updateData.photo.length === 0) {
      throw new Error("At least one photo is required");
    }

    updateData.photo.forEach((img, i) => {
      if (!img.url || !validator.isURL(img.url)) {
        throw new Error(`Invalid photo url at index ${i}`);
      }
      if (!["web", "mobile"].includes(img.source)) {
        throw new Error(`Invalid photo source at index ${i}`);
      }
    });
  }
};

module.exports = {
  validateSignupData,
  validateLoginData,
  validateEditProfileData,
  validateGrainData,
  validateUpdateFields,
  validateGrainUpdateValues,
};

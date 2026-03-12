const mongoose = require("mongoose");
const Order = require("../models/order");
const Grain = require("../models/grain");
const User = require("../models/user");
const { dbName, ConnectDB } = require("../config/database");

// migration to add one field updates status for items of item
// async function migrate() {
//   try {
//     await ConnectDB();
//     console.log(`connected to ${dbName} db`);

//     const result = await Order.updateMany(
//       {},
//       {
//         $set: {
//           "items.$[].status": "PLACED",
//         },
//       },
//     );
//     console.log("Migration Success: ", result);
//     process.exit();
//   } catch (err) {
//     console.error("migration failed: ", err.message);
//     process.exit(1);
//   }
// }

// migration to add two fields update productimage url

// async function migrate() {
//   try {
//     await ConnectDB();
//     console.log(`connected to ${dbName} db`);
//     const orders = await Order.find();

//     for (let order of orders) {
//       let isModified = false;

//       for (let item of order.items) {
//         // Log the current status to debug
//         console.log(
//           `Item status before:`,
//           item.status,
//           `Type:`,
//           typeof item.status,
//         );

//         // if (!item.status) {
//         //   item.status = "PLACED";
//         //   isModified = true;
//         // }
//         if (
//           !item.status ||
//           item.status === undefined ||
//           item.status === null ||
//           item.status === ""
//         ) {
//           console.log(`setting status to PLACED for item`);
//           item.status = "PLACED";
//           isModified = true;
//         }

//         if (!item.productImageUrl) {
//           const product = await Grain.findById(item.productId);
//           if (product) {
//             item.productImageUrl = product.photo[0].url;
//             isModified = true;
//           }
//         }
//       }
//       if (isModified) {
//         await order.save();
//       }
//     }

//     console.log("migratioin completed.");
//     process.exit();
//   } catch (err) {
//     console.error(err);
//     process.exit(1);
//   }
// }

//add "role" field to the users collection
async function migrate() {
  try {
    await ConnectDB();
    // console.log(`connected to ${dbName} db`);
    const usersWithoutRole = await User.countDocuments({
      role: { $exists: false },
    });
    // console.log(`Found ${usersWithoutRole} users without role field`);

    if (usersWithoutRole === 0) {
      // console.log("No users need migration. Exiting.");
      process.exit(0);
    }
    const result = await User.updateMany(
      { role: { $exists: false } },
      {
        $set: { role: "user" },
      },
    );
    // console.log("Migration Success: ", result);
    process.exit();
  } catch (err) {
    // console.error("migraition failed: ", err.message);
    process.exit(1);
  }
}

migrate();

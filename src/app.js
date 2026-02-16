require("dotenv").config();

const express = require("express");
const app = express();

const { ConnectDB } = require("./config/database");
const cookieParser = require("cookie-parser");

app.use(express.json()); // to read req.body
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const grainRouter = require("./routes/grains");
const orderRouter = require("./routes/order");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", grainRouter);
app.use("/", orderRouter);

const startServer = async () => {
  try {
    await ConnectDB();
    console.log(` database connected!!`);

    const server = app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });

    // ✅ Attach error handler
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${process.env.PORT} is already in use!`);
      } else {
        console.error("❌ Server error:", err);
      }
    });
  } catch (err) {
    console.error("Startup failed: ", err.message);
    process.exit(1);
  }
};

startServer();

// ConnectDB()
//   .then(() => {
//     console.log(`${dbName} name database connected!!`);
//     app.listen(PORT, () => {
//       console.log(`Server listening to the port ${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.log("Database cannot connected: ", err.message);
//     process.exit(1);
//   });

/*
const express = require("express");
require("./config/database");
const app = express();

app.use("/path", function (req, res, next) {
  res.send("Hello world");
});

app.get("/", (req, res, next) => {
  res.send("Iam from / route");
});
app.use(
  "/user",
  function (req, res, next) {
    console.log("Handling /user router");
    // res.send("Response 1");
    next();
  },
  function (req, res, next) {
    console.log("Handling function 2");
    next();
    console.log("Handling function 21");

    res.send("Response 2");
  },
  function (req, res, next) {
    console.log("Handling function 3");
    res.send("Response 3");
  },
);
//error handling
app.get("/getUserData", (req, res, next) => {
  try {
    console.log("some error happend");

    throw new Error("some error");
  } catch (err) {
    console.error(err.message);

    res.status(500).send(err.message);
  }
});
app.get("/json", (req, res, next) => {
  data = "json data";
  try {
    if (!"error") {
      throw new Error("some error occured");
    }
    res.status(200).json({ data: data });
  } catch (Err) {
    console.error(Err.message);
    res.status(500).json({ message: Err.message });
  }
});
// password = wowS9uO5eUHxgPh6;

connectingString =
  "mongodb+srv://Admin_raithu_mobile:wowS9uO5eUHxgPh6@raithucluster.jgt8r7k.mongodb.net/?appName=raithuCluster";
// app.listen(3000)
app.listen(3000, () => {
  console.log("App listening on port 3000");
});
*/

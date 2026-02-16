const mongoose = require("mongoose");

const ConnectDB = async () => {
  // console.log(process.env.DB_NAME, process.env.DB_CONNECTION_SECRET);
  // mongoose.connect(
  //   `mongodb+srv://Admin_raithu_mobile:u3xWQgj7lpvjXJC3@raithucluster.jgt8r7k.mongodb.net/${process.env.DB_NAME}?appName=raithuCluster`,
  // );
  await mongoose.connect(process.env.DB_CONNECTION_SECRET);
};

module.exports = { ConnectDB };
/*
// mongoose.connect("mongodb+srv://Admin_raithu_mobile:wowS9uO5eUHxgPh6@raithucluster.jgt8r7k.mongodb.net/?appName=raithuCluster")
const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://Admin_raithu_mobile:u3xWQgj7lpvjXJC3@raithucluster.jgt8r7k.mongodb.net/?appName=raithuCluster",
  );
};

connectDB()
  .then(() => {
    console.log("database connected successfully!!");
  })
  .catch((err) => {
    console.log("cannot connect DB: ", err.message);
  });
// first connect db then connect to the server 
*/

const mongoose = require("mongoose");

const connectDB = (url) => {
  return mongoose
    .connect(url)
    .then(() => console.log("connected to db"))
    .catch((err) => console.log("Error connecting to the database:", err));
};

module.exports = connectDB;

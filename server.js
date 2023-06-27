require("dotenv").config();
require("express-async-errors");
// express

const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");

// database
const connectDB = require("./db/connect");

//  routers
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
// const projectRouter = require("./routes/productRoutes");

// middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
// app.use("/api/project", projectRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;
const start = async () => {
  try {
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
    await connectDB(process.env.MONGO_URL);
  } catch (error) {
    console.log(error);
  }
};

start();

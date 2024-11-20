import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRouter from "./routes/auth_route.js"; // Make sure this path is correct

const app = express();
app.use(cors());

// Middleware for parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware setup
app.use("/auth", authRouter);

mongoose
  .connect(
    "mongodb+srv://sreyass2000:best1syett0c0me@cluster0.wm0v7.mongodb.net/newtestname?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() =>
    app.listen(5000, () =>
      console.log("Connected to database and Server is Running on port 5000")
    )
  )
  .catch((e) => console.log(e));

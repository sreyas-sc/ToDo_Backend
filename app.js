import express from "express"; // Import express
import mongoose from "mongoose"; // Import mongoose
import cors from "cors"; // Import cors
import authRouter from "./routes/auth_route.js"; // Make sure this path is correct

const app = express(); // Initialize express
app.use(cors()); // Enable CORS

// Middleware for parsing
app.use(express.json()); // Enable parsing JSON data
app.use(express.urlencoded({ extended: true })); // Enable parsing URL-encoded data

// Middleware setup
app.use("/auth", authRouter);


// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://sreyass2000:best1syett0c0me@cluster0.wm0v7.mongodb.net/newtestname?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => // If connected to database, start the server
    app.listen(5000, () => // Start the server on port 5000
      console.log("Connected to database and Server is Running on port 5000")
    )
  )
  .catch((e) => console.log(e)); // Catch any errors

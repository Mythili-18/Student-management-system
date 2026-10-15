
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const studentRoutes = require("./routes/studentRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Read JSON data from API requests
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Connect student API routes
app.use("/api/students", studentRoutes);

// Start server after connecting to MongoDB
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in the .env file");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();

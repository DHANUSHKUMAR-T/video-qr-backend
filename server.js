const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import routes
const videoRoutes = require("./routes/videoRoutes");

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded videos publicly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/videos", videoRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Video QR Backend Running 🚀");
});

// Port
const PORT = process.env.PORT || 5000;

// DB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed ❌", err);
  });

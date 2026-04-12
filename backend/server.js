const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/products", require("./routes/productRoutes"));

// DB Connection
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("FreshMart API Running...");
});

// Start Server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
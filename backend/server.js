const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// DB Connection
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("FreshMart API Running...");
});

// Keep API errors JSON-shaped so frontend fetch parsing stays stable.
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message || "Internal server error" });
});

// Start Server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});

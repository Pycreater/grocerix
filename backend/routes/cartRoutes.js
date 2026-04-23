const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} = require("../controllers/cartController");

router.post("/add", addToCart);
router.get("/:userId", getCart);
router.post("/remove", removeFromCart);
router.post("/update", updateQuantity);
router.post("/clear", clearCart);

module.exports = router;

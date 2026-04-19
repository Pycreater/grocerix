const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/authMiddleware");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router.get("/", getProducts);
router.get("/:productId", getProductById);
router.post("/", requireAdmin, createProduct);
router.put("/:productId", requireAdmin, updateProduct);
router.delete("/:productId", requireAdmin, deleteProduct);

module.exports = router;

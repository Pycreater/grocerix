const express = require("express");
const router = express.Router();
const { requireAdmin, requireAuth } = require("../middleware/authMiddleware");

const {
  placeOrder,
  getUserOrders,
  getAllOrders,
  getAdminReport,
} = require("../controllers/orderController");

router.post("/place", requireAuth, placeOrder);
router.get("/admin/all", requireAdmin, getAllOrders);
router.get("/admin/report", requireAdmin, getAdminReport);
router.get("/:userId", requireAuth, getUserOrders);

module.exports = router;

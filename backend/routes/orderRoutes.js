const express = require("express");
const router = express.Router();


const {
  createOrder,
  getMyOrders,
  getOrders,
  payOrder,
  updateOrderStatus,
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Checkout
router.post("/", protect, createOrder);

// User orders
router.get("/my", protect, getMyOrders);

// Admin
router.get("/", protect, admin, getOrders);

// 💳 Payment
router.put("/:id/pay", protect, payOrder);


// 🚚 Admin updates status
router.put("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;
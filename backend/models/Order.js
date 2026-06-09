// backend/models/Order.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: String
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  notes: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
    // ✅ REMOVED duplicate index - unique already creates index
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ["COD", "Card", "UPI", "NetBanking"],
    default: "COD"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: Date,
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending"
  },
  statusHistory: [statusHistorySchema],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
    phone: { type: String, required: true }
  },
  trackingNumber: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  notes: String
}, {
  timestamps: true
});

// ✅ REMOVED duplicate orderNumber index
// Keep only compound indexes for performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

// Pre-save middleware
orderSchema.pre("save", async function(next) {
  if (!this.orderNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `ORD-${year}${month}-${(count + 1).toString().padStart(6, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
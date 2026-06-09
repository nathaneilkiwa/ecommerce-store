const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// 🟢 Create Order (Checkout)
exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let total = 0;

    // 🔥 Validate stock AGAIN (important for concurrency)
    for (let item of cart.items) {
      const product = await Product.findById(item.product._id);

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} is out of stock`,
        });
      }

      total += product.price * item.quantity;
    }

    // 🔥 Deduct stock
    for (let item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      totalPrice: total,
    });

    req.io.emit("newOrder", order); // 🔥 Emit real-time event

    // 🔥 Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json(order);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟢 Get My Orders
exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).populate("items.product");
  res.json(orders);
};

// 🟢 Admin: Get all orders
exports.getOrders = async (req, res) => {
  const orders = await Order.find().populate("user").populate("items.product");
  res.json(orders);
};

// 🟢 Mark Order as Paid
exports.payOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = "paid";

    await order.save();

    res.json({ message: "Payment successful", order });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟢 Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;

    await order.save();

    res.json(order);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
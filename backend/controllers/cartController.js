const Cart = require("../models/Cart");
const Product = require("../models/Product");

// 🟢 Get Cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟢 Add to Cart
exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (product.stock < quantity) {
    return res.status(400).json({ message: "Not enough stock" });
  }

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    const newQty = cart.items[itemIndex].quantity + quantity;

    if (newQty > product.stock) {
      return res.status(400).json({ message: "Exceeds stock" });
    }

    cart.items[itemIndex].quantity = newQty;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  res.json(cart);
};

// 🟢 Remove from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();
    res.json(cart);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
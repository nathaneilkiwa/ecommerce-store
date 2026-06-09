// backend/controllers/productController.js
const Product = require("../models/Product");

// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SINGLE PRODUCT
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      stock: req.body.stock,
      image: req.file?.path,
    });
    res.status(201).json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    product.name = req.body.name || product.name;
    product.price = req.body.price || product.price;
    product.description = req.body.description || product.description;
    product.category = req.body.category || product.category;
    product.stock = req.body.stock || product.stock;
    
    if (req.file) {
      product.image = req.file.path;
    }
    
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// If you have these functions, uncomment them
// exports.getProductsByCategory = async (req, res) => { ... };
// exports.getFeaturedProducts = async (req, res) => { ... };
// exports.getRelatedProducts = async (req, res) => { ... };
// exports.updateStock = async (req, res) => { ... };
// exports.toggleFeatured = async (req, res) => { ... };
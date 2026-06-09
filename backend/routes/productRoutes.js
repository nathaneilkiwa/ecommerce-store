const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  admin,
} = require("../middleware/adminMiddleware");

// GET ALL PRODUCTS
router.get("/", getProducts);

// GET SINGLE PRODUCT
router.get("/:id", getProductById);

// CREATE PRODUCT
router.post(
  "/",
  protect,
  admin,
  upload.single("image"),
  createProduct
);

// UPDATE PRODUCT
router.put(
  "/:id",
  protect,
  admin,
  upload.single("image"),
  updateProduct
);

// DELETE PRODUCT
router.delete(
  "/:id",
  protect,
  admin,
  deleteProduct
);

module.exports = router;
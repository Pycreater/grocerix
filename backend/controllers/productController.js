const mongoose = require("mongoose");
const Product = require("../models/Product");

const normalizeProductPayload = (body = {}) => {
  const normalized = {
    name: String(body.name || "").trim(),
    category: String(body.category || "").trim(),
    unitLabel: String(body.unitLabel || "1 unit").trim(),
    image: body.image ? String(body.image).trim() : "",
    description: body.description ? String(body.description).trim() : "",
    price: Number(body.price),
    stock: Number(body.stock),
  };

  return normalized;
};

// GET all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET product by id
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ADD product
exports.createProduct = async (req, res) => {
  try {
    const payload = normalizeProductPayload(req.body);

    if (!payload.name || !payload.category || !payload.unitLabel) {
      return res.status(400).json({ message: "name, category and unitLabel are required" });
    }

    if (!Number.isFinite(payload.price) || payload.price < 0) {
      return res.status(400).json({ message: "price must be a number >= 0" });
    }

    if (!Number.isInteger(payload.stock) || payload.stock < 0) {
      return res.status(400).json({ message: "stock must be an integer >= 0" });
    }

    const product = new Product({
      name: payload.name,
      price: payload.price,
      category: payload.category,
      unitLabel: payload.unitLabel,
      image: payload.image,
      description: payload.description,
      stock: payload.stock,
    });

    const savedProduct = await product.save();
    res.status(201).json({
      message: "Product created successfully",
      product: savedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE product
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const payload = normalizeProductPayload(req.body);

    if (!payload.name || !payload.category || !payload.unitLabel) {
      return res.status(400).json({ message: "name, category and unitLabel are required" });
    }

    if (!Number.isFinite(payload.price) || payload.price < 0) {
      return res.status(400).json({ message: "price must be a number >= 0" });
    }

    if (!Number.isInteger(payload.stock) || payload.stock < 0) {
      return res.status(400).json({ message: "stock must be an integer >= 0" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name: payload.name,
        price: payload.price,
        category: payload.category,
        unitLabel: payload.unitLabel,
        image: payload.image,
        description: payload.description,
        stock: payload.stock,
      },
      { new: true },
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE product
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const deleted = await Product.findByIdAndDelete(productId);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

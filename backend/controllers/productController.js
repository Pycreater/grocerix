const Product = require("../models/Product");

// GET all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD product
exports.createProduct = async (req, res) => {
  try {
    const { name, price, category, image, description, stock } = req.body;

    const product = new Product({
      name,
      price,
      category,
      image,
      description,
      stock,
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
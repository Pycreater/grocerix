const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const { calculatePricingBreakdown } = require("../utils/pricing");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getCartWithProducts = async (userId) =>
  Cart.findOne({ user: userId }).populate("items.product");

const normalizeCartItems = (items = []) =>
  items
    .map((item) => {
      const product = item?.product;
      if (!product || !product._id) return null;

      const quantity = Math.max(1, Number(item.quantity) || 1);
      const unitPrice = Math.max(0, Number(product.price) || 0);

      return {
        product,
        quantity,
        unitPrice,
        lineTotal: unitPrice * quantity,
      };
    })
    .filter(Boolean);

const buildCartResponse = (cart, userId) => {
  const normalizedItems = normalizeCartItems(cart?.items || []);
  const summary = calculatePricingBreakdown(
    normalizedItems.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  );

  return {
    _id: cart?._id,
    user: cart?.user || userId,
    items: normalizedItems.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    summary,
    createdAt: cart?.createdAt,
    updatedAt: cart?.updatedAt,
  };
};

const getSafeCartResponse = async (userId) => {
  const cart = await getCartWithProducts(userId);
  if (!cart) {
    return buildCartResponse(null, userId);
  }

  const validItems = (cart.items || []).filter((item) => !!item.product);
  if (validItems.length !== cart.items.length) {
    cart.items = validItems;
    await cart.save();
    await cart.populate("items.product");
  }

  return buildCartResponse(cart, userId);
};

// ADD TO CART
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res
        .status(400)
        .json({ message: "userId and productId are required" });
    }

    if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid userId or productId" });
    }

    const [user, product] = await Promise.all([
      User.findById(userId),
      Product.findById(productId),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (Number(product.stock) <= 0) {
      return res.status(400).json({ message: "Product is out of stock" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (itemIndex > -1) {
      const nextQuantity = cart.items[itemIndex].quantity + 1;
      if (nextQuantity > Number(product.stock)) {
        return res.status(400).json({
          message: `Only ${product.stock} unit(s) available for ${product.name}`,
        });
      }
      cart.items[itemIndex].quantity = nextQuantity;
    } else {
      cart.items.push({ product: productId, quantity: 1 });
    }

    await cart.save();

    const cartResponse = await getSafeCartResponse(userId);
    return res.json(cartResponse);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET CART
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const cartResponse = await getSafeCartResponse(userId);
    return res.json(cartResponse);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// REMOVE ITEM
exports.removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res
        .status(400)
        .json({ message: "userId and productId are required" });
    }

    if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid userId or productId" });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);

    await cart.save();

    const cartResponse = await getSafeCartResponse(userId);
    return res.json(cartResponse);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// UPDATE QUANTITY
exports.updateQuantity = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity === undefined) {
      return res
        .status(400)
        .json({ message: "userId, productId and quantity are required" });
    }

    if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid userId or productId" });
    }

    const nextQuantity = Number(quantity);
    if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
      return res.status(400).json({ message: "quantity must be an integer >= 1" });
    }

    const [cart, product] = await Promise.all([
      Cart.findOne({ user: userId }),
      Product.findById(productId),
    ]);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (nextQuantity > Number(product.stock)) {
      return res.status(400).json({
        message: `Only ${product.stock} unit(s) available for ${product.name}`,
      });
    }

    const item = cart.items.find((entry) => entry.product.toString() === productId);

    if (!item) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    item.quantity = nextQuantity;
    await cart.save();

    const cartResponse = await getSafeCartResponse(userId);
    return res.json(cartResponse);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// CLEAR CART
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    } else {
      cart.items = [];
    }

    await cart.save();

    const cartResponse = await getSafeCartResponse(userId);
    return res.json(cartResponse);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

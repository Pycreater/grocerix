const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const { calculatePricingBreakdown } = require("../utils/pricing");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getDateKey = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getMonthKey = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const formatRecentOrder = (order) => {
  const itemCount = (order.items || []).reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  return {
    _id: order._id,
    customerName: order.user?.name || "Unknown",
    customerEmail: order.user?.email || "Unknown",
    totalAmount: Number(order.totalAmount || 0),
    itemCount,
    status: order.status || "Placed",
    createdAt: order.createdAt,
  };
};

// PLACE ORDER
exports.placeOrder = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    if (req.user?.role !== "admin" && String(req.user?._id) !== String(userId)) {
      return res.status(403).json({ message: "You can place orders only for your account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // get cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const normalizedCartItems = (cart.items || []).filter((item) => !!item.product);
    if (normalizedCartItems.length === 0) {
      cart.items = [];
      await cart.save();
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (normalizedCartItems.length !== cart.items.length) {
      cart.items = normalizedCartItems;
      await cart.save();
    }

    const orderItems = [];
    for (const cartItem of normalizedCartItems) {
      const quantity = Number(cartItem.quantity) || 0;
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: "Cart contains invalid quantity" });
      }

      const product = cartItem.product;
      if (!product?._id) {
        return res.status(400).json({ message: "Cart contains invalid product" });
      }

      const stock = Number(product.stock) || 0;
      if (quantity > stock) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${stock}`,
        });
      }

      const unitPrice = Math.max(0, Number(product.price) || 0);
      orderItems.push({
        product: product._id,
        productName: product.name || "Product",
        unitPrice,
        quantity,
        lineTotal: unitPrice * quantity,
      });
    }

    const deductedStockItems = [];
    try {
      for (const item of orderItems) {
        const updateResult = await Product.updateOne(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
        );

        if (updateResult.modifiedCount !== 1) {
          throw new Error(`Insufficient stock for ${item.productName}`);
        }

        deductedStockItems.push(item);
      }
    } catch (stockError) {
      for (const item of deductedStockItems) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } },
        );
      }

      return res.status(400).json({ message: stockError.message });
    }

    const pricing = calculatePricingBreakdown(
      orderItems.map((item) => ({
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    );

    let order = null;
    try {
      // create order
      order = new Order({
        user: userId,
        items: orderItems,
        subtotal: pricing.subtotal,
        deliveryFee: pricing.deliveryFee,
        handlingFee: pricing.handlingFee,
        taxAmount: pricing.taxAmount,
        totalAmount: pricing.totalAmount,
      });

      await order.save();

      // clear cart
      cart.items = [];
      await cart.save();
    } catch (orderError) {
      for (const item of deductedStockItems) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } },
        );
      }
      throw orderError;
    }

    const populatedOrder = await Order.findById(order._id).populate(
      "items.product",
      "name price image category",
    );

    res.json({
      message: "Order placed successfully",
      order: populatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET USER ORDERS
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    if (req.user?.role !== "admin" && String(req.user?._id) !== String(userId)) {
      return res.status(403).json({ message: "Access denied for this user orders" });
    }

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("items.product", "name price image category");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN: GET all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email role")
      .populate("items.product", "name price image category");

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ADMIN: sales and customer summary
exports.getAdminReport = async (req, res) => {
  try {
    const [orders, customerCount, productCount] = await Promise.all([
      Order.find()
        .sort({ createdAt: -1 })
        .populate("user", "name email"),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments(),
    ]);

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0,
    );

    const totalOrders = orders.length;
    const todayKey = getDateKey(new Date());
    const currentMonthKey = getMonthKey(new Date());

    let todayOrders = 0;
    let todayRevenue = 0;
    let monthOrders = 0;
    let monthRevenue = 0;

    const totalUnitsSold = orders.reduce((sum, order) => {
      const orderDayKey = getDateKey(order.createdAt);
      const orderMonthKey = getMonthKey(order.createdAt);
      const orderTotal = Number(order.totalAmount || 0);

      if (orderDayKey === todayKey) {
        todayOrders += 1;
        todayRevenue += orderTotal;
      }

      if (orderMonthKey === currentMonthKey) {
        monthOrders += 1;
        monthRevenue += orderTotal;
      }

      const orderUnits = (order.items || []).reduce(
        (itemSum, item) => itemSum + Number(item.quantity || 0),
        0,
      );
      return sum + orderUnits;
    }, 0);

    const productMap = new Map();
    for (const order of orders) {
      for (const item of order.items || []) {
        const key = String(item.product || item.productName || "");
        const current = productMap.get(key) || {
          productId: item.product || null,
          productName: item.productName || "Product",
          quantitySold: 0,
          revenue: 0,
        };

        current.quantitySold += Number(item.quantity || 0);
        current.revenue += Number(item.lineTotal || 0);

        productMap.set(key, current);
      }
    }

    const topProducts = [...productMap.values()]
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 8);

    const recentOrders = orders.slice(0, 10).map(formatRecentOrder);

    const monthlyMap = new Map();
    for (const order of orders) {
      const key = getMonthKey(order.createdAt);
      if (!key) continue;

      const current = monthlyMap.get(key) || { month: key, orders: 0, revenue: 0 };
      current.orders += 1;
      current.revenue += Number(order.totalAmount || 0);
      monthlyMap.set(key, current);
    }

    const monthlyRevenue = [...monthlyMap.values()]
      .sort((a, b) => String(a.month).localeCompare(String(b.month)))
      .slice(-6);

    return res.json({
      summary: {
        totalOrders,
        totalRevenue,
        totalCustomers: customerCount,
        totalProducts: productCount,
        totalUnitsSold,
        todayOrders,
        todayRevenue,
        monthOrders,
        monthRevenue,
      },
      topProducts,
      recentOrders,
      monthlyRevenue,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

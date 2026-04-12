const Order = require("../models/Order");
const Cart = require("../models/Cart");

// PLACE ORDER
exports.placeOrder = async (req, res) => {
  try {
    const { userId } = req.body;

    // get cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // calculate total
    const totalAmount = cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    // create order
    const order = new Order({
      user: userId,
      items: cart.items,
      totalAmount,
    });

    await order.save();

    // clear cart
    cart.items = [];
    await cart.save();

    res.json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET USER ORDERS
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ user: userId }).populate("items.product");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// order structure

// Order {
//   user,
//   items: [{ product, quantity }],
//   totalAmount,
//   paymentMethod: "COD",
//   status: "Placed"
// }


const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
      },
    ],
    totalAmount: Number,
    paymentMethod: {
      type: String,
      default: "COD",
    },
    status: {
      type: String,
      default: "Placed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

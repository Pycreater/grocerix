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
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: {
          type: String,
          required: true,
          trim: true,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        lineTotal: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    handlingFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    taxAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      default: "COD",
      trim: true,
    },
    status: {
      type: String,
      default: "Placed",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

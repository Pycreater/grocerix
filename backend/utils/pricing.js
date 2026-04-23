const FREE_DELIVERY_THRESHOLD = 500;
const DEFAULT_DELIVERY_FEE = 40;
const DEFAULT_HANDLING_FEE = 10;
const TAX_RATE = 0.05;

const toNumber = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const calculatePricingBreakdown = (items = []) => {
  const normalizedItems = Array.isArray(items) ? items : [];

  const subtotal = normalizedItems.reduce((sum, item) => {
    const quantity = Math.max(0, toNumber(item.quantity));
    const unitPrice = Math.max(0, toNumber(item.unitPrice));
    return sum + quantity * unitPrice;
  }, 0);

  const totalItems = normalizedItems.reduce(
    (sum, item) => sum + Math.max(0, toNumber(item.quantity)),
    0,
  );

  const deliveryFee =
    subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY_FEE;
  const handlingFee = totalItems > 0 ? DEFAULT_HANDLING_FEE : 0;
  const taxAmount = Math.round(subtotal * TAX_RATE);
  const totalAmount = subtotal + deliveryFee + handlingFee + taxAmount;

  return {
    totalItems,
    subtotal,
    deliveryFee,
    handlingFee,
    taxAmount,
    totalAmount,
    currency: "INR",
  };
};

module.exports = {
  calculatePricingBreakdown,
  FREE_DELIVERY_THRESHOLD,
  DEFAULT_DELIVERY_FEE,
  DEFAULT_HANDLING_FEE,
  TAX_RATE,
};

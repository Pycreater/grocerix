import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  clearCart,
  getCart,
  placeOrder,
  removeFromCart,
  updateCartQuantity,
} from "../api/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=60";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingProductId, setUpdatingProductId] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [clearingCart, setClearingCart] = useState(false);

  const userId = localStorage.getItem("userId");

  const loadCart = useCallback(async () => {
    if (!userId) {
      setCart({ items: [] });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await getCart(userId);
      setCart(data && Array.isArray(data.items) ? data : { items: [] });
    } catch (err) {
      setError(err.message || "Could not load cart.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleUpdateQuantity = async (productId, quantity) => {
    if (!userId) return;

    try {
      setError("");
      setMessage("");
      setUpdatingProductId(productId);
      const updated = await updateCartQuantity({ userId, productId, quantity });
      setCart(updated && Array.isArray(updated.items) ? updated : { items: [] });
    } catch (err) {
      setError(err.message || "Could not update quantity.");
    } finally {
      setUpdatingProductId("");
    }
  };

  const handleRemove = async (productId) => {
    if (!userId) return;

    try {
      setError("");
      setMessage("");
      setUpdatingProductId(productId);
      const updated = await removeFromCart({ userId, productId });
      setCart(updated && Array.isArray(updated.items) ? updated : { items: [] });
    } catch (err) {
      setError(err.message || "Could not remove item.");
    } finally {
      setUpdatingProductId("");
    }
  };

  const handlePlaceOrder = async () => {
    if (!userId) return;

    try {
      setError("");
      setMessage("");
      setPlacingOrder(true);
      await placeOrder({ userId });
      setMessage("Order placed successfully. Redirecting to Orders...");
      await loadCart();
      setTimeout(() => navigate("/orders"), 700);
    } catch (err) {
      setError(err.message || "Could not place order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const items = cart?.items || [];
  const computedTotalItems = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items],
  );
  const computedSubtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const unit = Number(item.product?.price) || 0;
        return sum + unit * Number(item.quantity || 0);
      }, 0),
    [items],
  );
  const serverSummary = cart?.summary || {};
  const totalItems = Number(serverSummary.totalItems ?? computedTotalItems);
  const subtotal = Number(serverSummary.subtotal ?? computedSubtotal);
  const deliveryFee = Number(
    serverSummary.deliveryFee ?? (subtotal >= 500 || subtotal === 0 ? 0 : 40),
  );
  const handlingFee = Number(serverSummary.handlingFee ?? (items.length > 0 ? 10 : 0));
  const taxAmount = Number(serverSummary.taxAmount ?? Math.round(subtotal * 0.05));
  const totalAmount = Number(
    serverSummary.totalAmount ?? subtotal + deliveryFee + handlingFee + taxAmount,
  );

  const handleClearCart = async () => {
    if (!userId || items.length === 0) return;

    try {
      setError("");
      setMessage("");
      setClearingCart(true);
      const updated = await clearCart({ userId });
      setCart(updated && Array.isArray(updated.items) ? updated : { items: [] });
      setMessage("Cart cleared successfully.");
    } catch (err) {
      setError(err.message || "Could not clear cart.");
    } finally {
      setClearingCart(false);
    }
  };

  return (
    <div className="min-h-screen product-page-bg">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <section className="animate-rise rounded-2xl border border-emerald-100/80 bg-gradient-to-r from-emerald-900 via-emerald-800 to-lime-700 px-5 py-5 text-white shadow-xl sm:px-7 sm:py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100 sm:text-xs">
            Ready to checkout
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="products-hero-title text-white">Your Cart</h1>
              <p className="mt-1 max-w-2xl text-xs text-emerald-100 sm:text-sm">
                Review quantities, remove items, and place your order in one
                step.
              </p>
            </div>
            <div className="glass-chip min-w-[170px] rounded-xl p-3">
              <p className="text-xs text-emerald-100">Items selected</p>
              <p className="text-2xl font-black text-white">{totalItems}</p>
            </div>
          </div>
        </section>

        {!userId && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-semibold text-amber-900">
              Please login to view your cart.
            </p>
            <Link
              to="/login"
              className="mt-3 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Go to Login
            </Link>
          </div>
        )}

        {message && (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        {loading && (
          <section className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <div className="h-72 animate-pulse rounded-2xl border border-emerald-100 bg-white/80" />
            <div className="h-52 animate-pulse rounded-2xl border border-emerald-100 bg-white/80" />
          </section>
        )}

        {!loading && userId && items.length === 0 && (
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <p className="text-lg font-bold text-slate-800">Your cart is empty</p>
            <p className="mt-1 text-sm text-slate-600">
              Add fresh products from the marketplace to get started.
            </p>
            <Link
              to="/products"
              className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Browse Products
            </Link>
          </div>
        )}

        {!loading && userId && items.length > 0 && (
          <section className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-3">
              {items.map((item) => {
                const product = item.product || {};
                const productId = product._id || item.product;
                const quantity = Number(item.quantity) || 1;
                const unitPrice = Number(product.price) || 0;
                const lineTotal = unitPrice * quantity;
                const maxStock = Number(product.stock) || 0;
                const outOfStock = maxStock <= 0;
                const reachedStockLimit = maxStock > 0 && quantity >= maxStock;

                return (
                  <article
                    key={productId}
                    className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      <img
                        src={product.image || FALLBACK_IMAGE}
                        alt={product.name || "Product"}
                        className="h-20 w-20 rounded-xl object-cover"
                        onError={(event) => {
                          event.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />

                      <div className="min-w-[160px] grow">
                        <h2 className="m-0 text-base font-extrabold !text-slate-900">
                          {product.name || "Product"}
                        </h2>
                        <p className="mt-1 text-xs text-slate-600">
                          Rs. {formatCurrency(unitPrice)} each
                        </p>
                        <p className="mt-1 text-sm font-semibold text-emerald-700">
                          Line total: Rs. {formatCurrency(lineTotal)}
                        </p>
                        {maxStock > 0 && (
                          <p className="mt-1 text-xs text-slate-500">
                            Available stock: {maxStock}
                          </p>
                        )}
                        {outOfStock && (
                          <p className="mt-1 text-xs font-semibold text-red-600">
                            This product is currently out of stock.
                          </p>
                        )}
                      </div>

                      <div className="ml-auto flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-md border border-emerald-200 px-3 py-1 text-sm font-semibold text-emerald-800"
                          disabled={updatingProductId === productId || quantity <= 1}
                          onClick={() =>
                            handleUpdateQuantity(productId, Math.max(1, quantity - 1))
                          }
                        >
                          -
                        </button>
                        <span className="min-w-8 text-center text-sm font-bold text-slate-800">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          className="rounded-md border border-emerald-200 px-3 py-1 text-sm font-semibold text-emerald-800"
                          disabled={
                            updatingProductId === productId ||
                            outOfStock ||
                            reachedStockLimit
                          }
                          onClick={() => handleUpdateQuantity(productId, quantity + 1)}
                          title={
                            reachedStockLimit
                              ? "Stock limit reached"
                              : "Increase quantity"
                          }
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="ml-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white"
                          disabled={updatingProductId === productId}
                          onClick={() => handleRemove(productId)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="h-fit rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm lg:sticky lg:top-24">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Order summary
              </p>
              <p className="mt-4 text-sm text-slate-600">
                Items: <span className="font-bold text-slate-800">{totalItems}</span>
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Payment: <span className="font-bold text-slate-800">Cash on Delivery</span>
              </p>
              <div className="mt-4 rounded-xl bg-emerald-50 p-4">
                <div className="flex items-center justify-between text-sm text-emerald-900">
                  <span>Subtotal</span>
                  <span className="font-semibold">Rs. {formatCurrency(subtotal)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-emerald-900">
                  <span>Delivery fee</span>
                  <span className="font-semibold">
                    {deliveryFee === 0 ? "Free" : `Rs. ${formatCurrency(deliveryFee)}`}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-emerald-900">
                  <span>Handling fee</span>
                  <span className="font-semibold">Rs. {formatCurrency(handlingFee)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-emerald-900">
                  <span>Estimated tax (5%)</span>
                  <span className="font-semibold">Rs. {formatCurrency(taxAmount)}</span>
                </div>
                <div className="mt-3 border-t border-emerald-200 pt-3">
                  <p className="text-sm text-emerald-800">Total payable</p>
                  <p className="text-2xl font-black text-emerald-700">
                    Rs. {formatCurrency(totalAmount)}
                  </p>
                </div>
                {deliveryFee > 0 && (
                  <p className="mt-2 text-xs text-emerald-700">
                    Add products worth Rs.{" "}
                    {formatCurrency(Math.max(0, 500 - subtotal))} more for free delivery.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleClearCart}
                disabled={clearingCart || placingOrder || items.length === 0}
                className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {clearingCart ? "Clearing cart..." : "Clear Cart"}
              </button>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placingOrder || clearingCart || items.length === 0}
                className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {placingOrder ? "Placing order..." : "Place Order"}
              </button>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
};

export default Cart;

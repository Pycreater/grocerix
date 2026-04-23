import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "../components/Navbar";
import { getOrders } from "../api/api";

const UPI_ID = "ujjzanzane@okicici";
const UPI_NAME = "FreshMart";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=60";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(value) || 0);

const formatOrderDate = (value) => {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const shortOrderId = (id) => String(id).slice(-8).toUpperCase();

const STATUS_STEPS = ["Placed", "Confirmed", "Out for Delivery", "Delivered"];

const getStatusIndex = (status) => {
  const idx = STATUS_STEPS.findIndex(
    (s) => s.toLowerCase() === String(status || "").toLowerCase()
  );
  return idx === -1 ? 0 : idx;
};

const StatusTimeline = ({ status }) => {
  const current = getStatusIndex(status);
  return (
    <div className="mt-4 flex items-center gap-0">
      {STATUS_STEPS.map((step, index) => {
        const done = index <= current;
        const isLast = index === STATUS_STEPS.length - 1;
        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition ${
                  done ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-400"
                }`}
              >
                {done ? "✓" : index + 1}
              </div>
              <p
                className={`mt-1 text-center text-[10px] font-semibold leading-tight ${
                  done ? "text-emerald-700" : "text-slate-400"
                }`}
                style={{ maxWidth: 60 }}
              >
                {step}
              </p>
            </div>
            {!isLast && (
              <div
                className={`mb-4 h-1 flex-1 rounded-full transition ${
                  index < current ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const UpiQrModal = ({ order, onClose }) => {
  const amount = Number(order.totalAmount || 0).toFixed(2);
  const note = `Order #${shortOrderId(order._id)}`;
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-emerald-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pay via UPI</p>
            <p className="text-lg font-black !text-slate-900">Rs. {formatCurrency(amount)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="mt-4 flex justify-center rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <QRCodeSVG value={upiUrl} size={200} level="H" />
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-center">
          <p className="text-xs text-slate-500">Scan with any UPI app</p>
          <div className="mt-2 flex justify-center gap-3 text-xs font-semibold text-slate-700">
            <span>GPay</span>
            <span>·</span>
            <span>PhonePe</span>
            <span>·</span>
            <span>Paytm</span>
            <span>·</span>
            <span>Any Bank App</span>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
          <p className="text-xs text-slate-500">UPI ID</p>
          <p className="text-sm font-bold text-slate-900">{UPI_ID}</p>
          <p className="mt-1 text-xs text-slate-500">Order</p>
          <p className="text-sm font-bold text-slate-900">#{shortOrderId(order._id)}</p>
        </div>

        <p className="mt-3 text-center text-xs text-slate-400">
          Amount is pre-filled. Verify before paying.
        </p>
      </div>
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [payingOrder, setPayingOrder] = useState(null);

  const userId = localStorage.getItem("userId");

  const loadOrders = useCallback(async () => {
    if (!userId) { setOrders([]); setLoading(false); return; }
    try {
      setLoading(true);
      setError("");
      const data = await getOrders(userId);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const orderedList = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [orders],
  );

  const totalSpent = useMemo(
    () => orderedList.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
    [orderedList],
  );

  const totalUnits = useMemo(
    () => orderedList.reduce((sum, o) => {
      return sum + (Array.isArray(o.items) ? o.items : []).reduce(
        (s, item) => s + Number(item.quantity || 0), 0
      );
    }, 0),
    [orderedList],
  );

  return (
    <div className="min-h-screen product-page-bg">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">

        <section className="animate-rise rounded-2xl border border-emerald-100/80 bg-gradient-to-r from-emerald-900 via-emerald-800 to-lime-700 px-5 py-5 text-white shadow-xl sm:px-7 sm:py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100 sm:text-xs">
            Purchase history
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="products-hero-title text-white">Your Orders</h1>
              <p className="mt-1 max-w-2xl text-xs text-emerald-100 sm:text-sm">
                Track your orders, view items, and pay via UPI.
              </p>
            </div>
            <div className="glass-chip min-w-[150px] rounded-xl p-3">
              <p className="text-xs text-emerald-100">Total orders</p>
              <p className="text-2xl font-black text-white">{orderedList.length}</p>
            </div>
          </div>
        </section>

        {!userId && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-semibold text-amber-900">Please login to view your orders.</p>
            <Link to="/login" className="mt-3 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white">
              Go to Login
            </Link>
          </div>
        )}

        {loading && (
          <div className="mt-6 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl border border-emerald-100 bg-white/80" />
            ))}
          </div>
        )}

        {!loading && userId && (
          <section className="animate-rise-delayed mt-6 grid gap-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:grid-cols-3">
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-600">Total spent</p>
              <p className="mt-1 text-2xl font-black text-slate-900">Rs. {formatCurrency(totalSpent)}</p>
            </div>
            <div className="rounded-xl bg-lime-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-600">Items bought</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{totalUnits}</p>
            </div>
            <button
              type="button"
              onClick={loadOrders}
              className="rounded-xl border border-emerald-200 p-4 text-left transition hover:bg-emerald-50"
            >
              <p className="text-xs font-semibold uppercase text-slate-500">Actions</p>
              <p className="mt-1 text-base font-extrabold text-emerald-700">Refresh Orders</p>
            </button>
          </section>
        )}

        {!loading && error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
        )}

        {!loading && !error && userId && orderedList.length === 0 && (
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <p className="text-lg font-bold text-slate-900">No orders yet</p>
            <p className="mt-1 text-sm text-slate-600">Place your first order from the products marketplace.</p>
            <Link to="/products" className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Shop Products
            </Link>
          </div>
        )}

        {!loading && !error && orderedList.length > 0 && (
          <section className="mt-6 space-y-4">
            {orderedList.map((order) => {
              const isExpanded = expandedId === order._id;
              const statusIdx = getStatusIndex(order.status);
              const isDelivered = statusIdx === STATUS_STEPS.length - 1;

              return (
                <article key={order._id} className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">

                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">
                        🛒
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Order</p>
                        <p className="font-mono text-sm font-black text-slate-900">
                          #{shortOrderId(order._id)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        isDelivered
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {order.status || "Placed"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {formatOrderDate(order.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Product image strip */}
                  <div className="flex gap-2 overflow-x-auto px-5 py-3">
                    {(order.items || []).slice(0, 5).map((item, index) => {
                      const product = item.product || {};
                      return (
                        <img
                          key={index}
                          src={product.image || FALLBACK_IMAGE}
                          alt={item.productName || product.name || "Product"}
                          className="h-14 w-14 shrink-0 rounded-xl border border-emerald-100 object-cover"
                          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                        />
                      );
                    })}
                    {(order.items || []).length > 5 && (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-xs font-bold text-emerald-700">
                        +{(order.items || []).length - 5}
                      </div>
                    )}
                  </div>

                  {/* Status Timeline */}
                  <div className="px-5 pb-2">
                    <StatusTimeline status={order.status} />
                  </div>

                  {/* Price + Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
                    <div>
                      <p className="text-xs text-slate-500">{(order.items || []).length} items · {order.paymentMethod || "COD"}</p>
                      <p className="text-xl font-black text-slate-900">Rs. {formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : order._id)}
                        className="rounded-xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                      >
                        {isExpanded ? "Hide Details" : "View Details"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayingOrder(order)}
                        className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800"
                      >
                        Pay via UPI
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                      <p className="text-xs font-semibold uppercase text-slate-500 mb-3">Order Items</p>
                      <div className="space-y-2">
                        {(order.items || []).map((item, index) => {
                          const product = item.product || {};
                          const productName = item.productName || product.name || "Product removed";
                          const quantity = Number(item.quantity || 0);
                          const unitPrice = Number(item.unitPrice ?? product.price ?? 0);
                          const lineTotal = Number(item.lineTotal ?? quantity * unitPrice);

                          return (
                            <div
                              key={index}
                              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
                            >
                              <img
                                src={product.image || FALLBACK_IMAGE}
                                alt={productName}
                                className="h-12 w-12 rounded-lg object-cover"
                                onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                              />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">{productName}</p>
                                <p className="text-xs text-slate-500">
                                  {quantity} × Rs. {formatCurrency(unitPrice)}
                                </p>
                              </div>
                              <p className="text-sm font-black text-slate-900">
                                Rs. {formatCurrency(lineTotal)}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bill breakdown */}
                      <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4 space-y-2">
                        <div className="flex justify-between text-sm text-slate-700">
                          <span>Subtotal</span>
                          <span className="font-semibold">Rs. {formatCurrency(order.subtotal || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-700">
                          <span>Delivery fee</span>
                          <span className="font-semibold">
                            {Number(order.deliveryFee || 0) === 0 ? "Free" : `Rs. ${formatCurrency(order.deliveryFee)}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-700">
                          <span>Handling fee</span>
                          <span className="font-semibold">Rs. {formatCurrency(order.handlingFee || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-700">
                          <span>Tax (5%)</span>
                          <span className="font-semibold">Rs. {formatCurrency(order.taxAmount || 0)}</span>
                        </div>
                        <div className="flex justify-between border-t border-emerald-200 pt-2 text-base font-black text-slate-900">
                          <span>Total</span>
                          <span>Rs. {formatCurrency(order.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </main>

      {payingOrder && (
        <UpiQrModal order={payingOrder} onClose={() => setPayingOrder(null)} />
      )}
    </div>
  );
};

export default Orders;

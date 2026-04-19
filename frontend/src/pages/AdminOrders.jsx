import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { getAllOrdersForAdmin } from "../api/api";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDateKey = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getMonthKey = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("today");

  const todayKey = getDateKey(new Date());
  const currentMonth = getMonthKey(new Date());

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllOrdersForAdmin();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "today") {
      return orders.filter((order) => getDateKey(order.createdAt) === todayKey);
    }
    return orders.filter((order) => getMonthKey(order.createdAt) === currentMonth);
  }, [orders, filter, todayKey, currentMonth]);

  const periodSummary = useMemo(() => {
    return filteredOrders.reduce(
      (acc, order) => {
        const total = Number(order.totalAmount || 0);
        const units = (order.items || []).reduce(
          (sum, item) => sum + Number(item.quantity || 0),
          0,
        );
        acc.revenue += total;
        acc.units += units;
        return acc;
      },
      { revenue: 0, units: 0 },
    );
  }, [filteredOrders]);

  const monthlyRevenue = useMemo(() => {
    const map = new Map();
    for (const order of orders) {
      const key = getMonthKey(order.createdAt);
      if (!key) continue;
      const current = map.get(key) || { month: key, orders: 0, revenue: 0 };
      current.orders += 1;
      current.revenue += Number(order.totalAmount || 0);
      map.set(key, current);
    }
    return [...map.values()]
      .sort((a, b) => String(a.month).localeCompare(String(b.month)))
      .slice(-12);
  }, [orders]);

  return (
    <AdminLayout
      title="Orders & Revenue"
      subtitle="Track orders by period and monitor monthly revenue performance."
    >
      <section className="mt-6 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 text-xl font-black !text-slate-900">Order Filters</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "today", label: "Today" },
              { value: "month", label: "This Month" },
              { value: "all", label: "All" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                  filter === item.value
                    ? "bg-emerald-700 text-white"
                    : "bg-emerald-50 text-emerald-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-3 text-sm text-slate-600">Loading orders...</p>
        ) : (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-emerald-50 p-3">
                <p className="text-xs uppercase text-slate-700">Orders</p>
                <p className="text-xl font-black text-slate-900">{filteredOrders.length}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3">
                <p className="text-xs uppercase text-slate-700">Revenue</p>
                <p className="text-xl font-black text-slate-900">
                  Rs. {formatCurrency(periodSummary.revenue)}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3">
                <p className="text-xs uppercase text-slate-700">Units Sold</p>
                <p className="text-xl font-black text-slate-900">{periodSummary.units}</p>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700">
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Customer</th>
                    <th className="py-2 pr-3">Items</th>
                    <th className="py-2 pr-3">Amount</th>
                    <th className="py-2 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const itemCount = (order.items || []).reduce(
                      (sum, item) => sum + Number(item.quantity || 0),
                      0,
                    );
                    return (
                      <tr key={order._id} className="border-b border-slate-100 text-slate-900">
                        <td className="py-2 pr-3">{formatDateTime(order.createdAt)}</td>
                        <td className="py-2 pr-3">
                          <p className="font-semibold text-slate-900">{order.user?.name || "NA"}</p>
                          <p className="text-xs text-slate-600">{order.user?.email || "NA"}</p>
                        </td>
                        <td className="py-2 pr-3">{itemCount}</td>
                        <td className="py-2 pr-3">Rs. {formatCurrency(order.totalAmount)}</td>
                        <td className="py-2 pr-3">{order.status || "Placed"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {!loading && (
        <section className="mt-6 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <h2 className="m-0 text-xl font-black !text-slate-900">Monthly Revenue (12 Months)</h2>
          {monthlyRevenue.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No monthly data available.</p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {monthlyRevenue.map((item) => (
                <div key={item.month} className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                  <p className="text-sm font-bold text-slate-900">{item.month}</p>
                  <p className="text-xs text-slate-700">
                    Orders: {item.orders} | Revenue: Rs. {formatCurrency(item.revenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;

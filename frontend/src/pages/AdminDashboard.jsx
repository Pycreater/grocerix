import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { getAdminReport, getProducts } from "../api/api";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const AdminDashboard = () => {
  const [report, setReport] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [reportData, productsData] = await Promise.all([
        getAdminReport(),
        getProducts(),
      ]);
      setReport(reportData || null);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      setError(err.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = report?.summary || {};
  const monthlyRevenue = report?.monthlyRevenue || [];

  const trendPoints = useMemo(() => monthlyRevenue.slice(-6), [monthlyRevenue]);

  const maxRevenue = useMemo(() => {
    return Math.max(1, ...trendPoints.map((item) => Number(item.revenue || 0)));
  }, [trendPoints]);

  const minRevenue = useMemo(() => {
    return Math.min(...trendPoints.map((item) => Number(item.revenue || 0)), maxRevenue);
  }, [trendPoints, maxRevenue]);

  const lowStockCount = useMemo(
    () => products.filter((item) => Number(item.stock || 0) <= 5).length,
    [products],
  );

  const averageOrderValue = useMemo(() => {
    const totalRevenue = Number(summary.totalRevenue || 0);
    const totalOrders = Number(summary.totalOrders || 0);
    if (!totalOrders) return 0;
    return Math.round(totalRevenue / totalOrders);
  }, [summary.totalRevenue, summary.totalOrders]);

  const stockHealthPercent = useMemo(() => {
    if (!products.length) return 100;
    const healthy = Math.max(0, products.length - lowStockCount);
    return Math.round((healthy / products.length) * 100);
  }, [products.length, lowStockCount]);

  const chartPolyline = useMemo(() => {
    if (!trendPoints.length) return "";

    const width = 520;
    const height = 190;
    const gap = trendPoints.length > 1 ? width / (trendPoints.length - 1) : width;

    return trendPoints
      .map((item, index) => {
        const value = Number(item.revenue || 0);
        const x = Math.round(index * gap);
        const y = Math.round(height - (value / maxRevenue) * (height - 16));
        return `${x},${y}`;
      })
      .join(" ");
  }, [trendPoints, maxRevenue]);

  const kpiCards = [
    {
      label: "Today Revenue",
      value: `Rs. ${formatCurrency(summary.todayRevenue)}`,
      note: `${summary.todayOrders || 0} orders today`,
      className: "border-l-4 border-emerald-600 bg-gradient-to-br from-emerald-50 to-lime-50",
      valueColor: "text-emerald-800",
    },
    {
      label: "This Month Revenue",
      value: `Rs. ${formatCurrency(summary.monthRevenue)}`,
      note: `${summary.monthOrders || 0} orders this month`,
      className: "border-l-4 border-lime-600 bg-gradient-to-br from-lime-50 to-emerald-50",
      valueColor: "text-lime-800",
    },
    {
      label: "Average Order Value",
      value: `Rs. ${formatCurrency(averageOrderValue)}`,
      note: `${summary.totalOrders || 0} total completed orders`,
      className: "border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50",
      valueColor: "text-emerald-700",
    },
    {
      label: "Low Stock Alerts",
      value: `${lowStockCount}`,
      note: `${products.length || 0} total active products`,
      className: "border-l-4 border-red-500 bg-gradient-to-br from-rose-50 to-red-50",
      valueColor: "text-red-700",
    },
  ];

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="High level snapshot: today, this month, totals, and trends."
    >
      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      {loading && (
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          Loading dashboard...
        </div>
      )}

      {!loading && (
        <>
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map((card) => (
              <div
                key={card.label}
                className={`rounded-2xl p-4 shadow-sm ${card.className}`}
              >
                <p className="text-xs uppercase tracking-wide text-slate-600">{card.label}</p>
                <p className={`mt-2 text-2xl font-black ${card.valueColor}`}>{card.value}</p>
                <p className="mt-1 text-xs text-slate-700">{card.note}</p>
                <div className="mt-3 h-1.5 rounded-full bg-slate-200">
                  <div className="h-1.5 w-2/3 rounded-full bg-emerald-600" />
                </div>
              </div>
            ))}
          </section>

          <section className="mt-6 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
            <article className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="m-0 text-xl font-black !text-slate-900">
                  Revenue Trend - Last 6 Months
                </h2>
                <p className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-slate-900 ring-1 ring-emerald-200">
                  Min Rs. {formatCurrency(minRevenue)} | Max Rs. {formatCurrency(maxRevenue)}
                </p>
              </div>

              {trendPoints.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">No monthly sales data yet.</p>
              ) : (
                <>
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-gradient-to-b from-lime-50 to-white p-3">
                    <svg viewBox="0 0 520 210" className="h-52 w-full">
                      <defs>
                        <linearGradient id="revStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#15803d" />
                          <stop offset="100%" stopColor="#65a30d" />
                        </linearGradient>
                      </defs>
                      <polyline
                        points={chartPolyline}
                        fill="none"
                        stroke="url(#revStroke)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {chartPolyline
                        .split(" ")
                        .filter(Boolean)
                        .map((point) => {
                          const [x, y] = point.split(",");
                          return (
                            <circle
                              key={point}
                              cx={x}
                              cy={y}
                              r="5"
                              fill="#ffffff"
                              stroke="#166534"
                              strokeWidth="3"
                            />
                          );
                        })}
                    </svg>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                    {trendPoints.map((item) => (
                      <div
                        key={item.month}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center"
                      >
                        <p className="text-[11px] font-semibold text-slate-900">{item.month}</p>
                        <p className="text-xs font-bold text-emerald-700">
                          Rs. {formatCurrency(item.revenue)}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </article>

            <article className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
              <h2 className="m-0 text-xl font-black !text-slate-900">Stock Health</h2>
              <p className="mt-1 text-sm text-slate-500">
                Quick visibility of inventory readiness.
              </p>

              <div className="mt-5 flex items-center justify-center">
                <div
                  className="grid h-40 w-40 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(#15803d ${stockHealthPercent}%, #e2e8f0 ${stockHealthPercent}% 100%)`,
                  }}
                >
                  <div className="grid h-28 w-28 place-items-center rounded-full bg-white">
                    <p className="text-3xl font-black text-green-800">{stockHealthPercent}%</p>
                    <p className="text-xs font-semibold uppercase text-slate-500">Healthy</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="text-xs uppercase text-emerald-700">Total Products</p>
                  <p className="text-lg font-black text-emerald-800">{summary.totalProducts || 0}</p>
                </div>
                <div className="rounded-xl bg-red-50 p-3">
                  <p className="text-xs uppercase text-red-700">Low Stock Alerts</p>
                  <p className="text-lg font-black text-red-700">{lowStockCount}</p>
                </div>
              </div>
            </article>
          </section>

          <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase text-slate-700">Total Revenue</p>
              <p className="mt-1 text-xl font-black text-slate-900">
                Rs. {formatCurrency(summary.totalRevenue)}
              </p>
              <p className="mt-1 text-xs text-slate-700">All time sales volume</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase text-slate-700">Total Customers</p>
              <p className="mt-1 text-xl font-black text-slate-900">{summary.totalCustomers || 0}</p>
              <p className="mt-1 text-xs text-slate-700">Customers with placed orders</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase text-slate-700">Units Sold</p>
              <p className="mt-1 text-xl font-black text-slate-900">{summary.totalUnitsSold || 0}</p>
              <p className="mt-1 text-xs text-slate-700">All product units delivered</p>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="m-0 text-xl font-black !text-slate-900">Business Pulse</h2>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Today vs Month Overview
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-lime-50 p-4">
                <p className="text-xs uppercase text-emerald-700">Today Orders Share</p>
                <p className="mt-2 text-2xl font-black text-emerald-800">
                  {summary.totalOrders
                    ? `${Math.round((Number(summary.todayOrders || 0) / Number(summary.totalOrders || 1)) * 100)}%`
                    : "0%"}
                </p>
                <p className="text-xs text-emerald-700/80">
                  of total orders happened today
                </p>
              </div>
              <div className="rounded-xl border border-lime-200 bg-gradient-to-br from-lime-50 to-amber-50 p-4">
                <p className="text-xs uppercase text-lime-700">Monthly Progress</p>
                <p className="mt-2 text-2xl font-black text-lime-800">
                  {summary.totalRevenue
                    ? `${Math.round((Number(summary.monthRevenue || 0) / Number(summary.totalRevenue || 1)) * 100)}%`
                    : "0%"}
                </p>
                <p className="text-xs text-lime-700/80">
                  of lifetime revenue in this month
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;

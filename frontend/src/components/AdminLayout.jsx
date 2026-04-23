import { Link, NavLink } from "react-router-dom";
import Navbar from "./Navbar";
import { getStoredUser, isAdminUser } from "../utils/auth";

const adminTabs = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders & Revenue" },
];

const AdminLayout = ({ title, subtitle, children }) => {
  const currentUser = getStoredUser();
  const isAdmin = isAdminUser(currentUser);

  if (!currentUser) {
    return (
      <div className="min-h-screen product-page-bg">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <p className="font-semibold text-amber-900">
              Please login as admin to access this page.
            </p>
            <Link
              to="/login"
              className="mt-3 inline-block rounded-lg bg-amber-200 px-4 py-2 text-sm font-semibold text-slate-900"
            >
              Go to Login
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen product-page-bg">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="font-semibold text-red-700">
              This page is only available for admin users.
            </p>
            <Link
              to="/products"
              className="mt-3 inline-block rounded-lg bg-emerald-200 px-4 py-2 text-sm font-semibold text-slate-900"
            >
              Back to Products
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen product-page-bg">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <section className="animate-rise rounded-2xl border border-emerald-100/80 bg-gradient-to-r from-emerald-900 via-emerald-800 to-lime-700 px-5 py-5 text-white shadow-xl sm:px-7 sm:py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100 sm:text-xs">
            Admin control center
          </p>
          <h1 className="mt-3 text-3xl font-black text-white">{title}</h1>
          <p className="mt-1 text-sm text-emerald-100">{subtitle}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {adminTabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-white text-emerald-800 shadow"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </div>
        </section>

        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

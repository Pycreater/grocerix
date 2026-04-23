import { Link, NavLink } from "react-router-dom";
import { clearUserSession, getStoredUser, isAdminUser } from "../utils/auth";

const Navbar = () => {
  const currentUser = getStoredUser();
  const isAdmin = isAdminUser(currentUser);

  const navItems = isAdmin
    ? [
        { to: "/", label: "Home" },
        { to: "/admin/dashboard", label: "Dashboard" },
        { to: "/admin/products", label: "Admin Products" },
        { to: "/admin/orders", label: "Admin Orders" },
        { to: "/products", label: "Products" },
      ]
    : [
        { to: "/", label: "Home" },
        { to: "/products", label: "Products" },
        { to: "/cart", label: "Cart" },
        { to: "/orders", label: "Orders" },
      ];

  const handleLogout = () => {
    clearUserSession();
    window.location.href = "/login";
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-emerald-100 bg-white/95 px-4 py-2 shadow-sm backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        <Link
          to="/"
          className="mr-2 rounded-lg bg-gradient-to-r from-emerald-700 to-lime-600 px-3 py-1.5 text-base font-black tracking-tight text-white shadow-sm transition hover:brightness-105 sm:text-lg"
        >
          FreshMart
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-emerald-700 text-white shadow"
                    : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {currentUser ? (
            <>
              <span className="ml-1 text-sm text-gray-600">
                Hi, {currentUser.userName || "User"}{" "}
                <span className="font-semibold text-emerald-700">
                  ({isAdmin ? "Admin" : "Customer"})
                </span>
              </span>
              <button
                type="button"
                className="rounded-full bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-emerald-200 px-3 py-1.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
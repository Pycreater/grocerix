import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 shadow-sm px-6 py-2 flex justify-between items-center">
      
      {/* LOGO */}
      <h1 className="text-xl font-bold text-green-600 tracking-wide">
        FreshMart 🛒
      </h1>

      {/* LINKS */}
      <div className="flex items-center gap-5 text-sm font-medium">
        
        <Link to="/" className="hover:text-green-600 transition">
          Home
        </Link>

        <Link to="/products" className="hover:text-green-600 transition">
          Products
        </Link>

        <Link to="/cart" className="hover:text-green-600 transition">
          Cart
        </Link>

        <Link to="/orders" className="hover:text-green-600 transition">
          Orders
        </Link>

        <Link to="/about" className="hover:text-green-600 transition">
          About
        </Link>

        {/* LOGIN BUTTON */}
        <Link
          to="/login"
          className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition"
        >
          Login
        </Link>

      </div>
    </nav>
  );
};

export default Navbar;
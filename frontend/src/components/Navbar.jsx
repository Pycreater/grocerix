import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md px-8 py-4 flex justify-between">
      <h1 className="text-2xl font-bold text-green-600">
        FreshMart Grocery
      </h1>

      <div className="flex gap-6">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-10">
      <div className="max-w-6xl mx-auto p-8 grid md:grid-cols-3 gap-6">

        {/* BRAND */}
        <div>
          <h2 className="text-2xl font-bold text-white">
            FreshMart Grocery
          </h2>
          <p className="text-gray-400 mt-2">
            Fresh groceries delivered at your doorstep in Hadapsar, Pune.
          </p>
        </div>

        {/* LINKS */}
        <div>
          <h3 className="font-semibold mb-2">Quick Links</h3>
          <ul className="text-gray-400 space-y-1">
            <li>Home</li>
            <li>Products</li>
            <li>Cart</li>
            <li>Orders</li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="font-semibold mb-2">Contact</h3>
          <p className="text-gray-400">
            Hadapsar, Pune
          </p>
          <p className="text-gray-400">
            Phone: +91 9876543210
          </p>
          <p className="text-gray-400">
            Email: support@freshmart.com
          </p>
        </div>

      </div>

      <div className="text-center text-gray-500 pb-4">
        © 2026 FreshMart Grocery. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
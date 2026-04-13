import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="bg-gray-50">

      <Navbar />

      {/* HERO SECTION (NO CROPPING) */}
      <div className="h-[90vh] flex items-center justify-center bg-gray-100">
        <img
          src="/data/banner2.png"
          alt="FreshMart Banner"
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* CTA BELOW HERO */}
      <div className="text-center mt-6">
        <Link to="/products">
          <button className="bg-green-600 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-green-700 transition shadow-lg">
            Shop Now 🛒
          </button>
        </Link>
      </div>

      {/* CATEGORIES */}
      <div className="p-10 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          Shop by Category
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* FRUITS */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition group cursor-pointer">
            <div className="overflow-hidden">
              <img
                src="/data/fruits.jpg"
                className="h-52 w-full object-cover group-hover:scale-110 transition duration-300"
              />
            </div>
            <h2 className="p-4 text-xl font-semibold text-center">
              Fruits 🍎
            </h2>
          </div>

          {/* VEGETABLES */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition group cursor-pointer">
            <div className="overflow-hidden">
              <img
                src="/data/vegetables.webp"
                className="h-52 w-full object-cover group-hover:scale-110 transition duration-300"
              />
            </div>
            <h2 className="p-4 text-xl font-semibold text-center">
              Vegetables 🥦
            </h2>
          </div>

          {/* DAIRY */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition group cursor-pointer">
            <div className="overflow-hidden">
              <img
                src="/data/dairy.jpg"
                className="h-52 w-full object-cover group-hover:scale-110 transition duration-300"
              />
            </div>
            <h2 className="p-4 text-xl font-semibold text-center">
              Dairy 🥛
            </h2>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
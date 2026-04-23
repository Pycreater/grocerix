import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getProducts } from "../api/api";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=60";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingFeatured(true);
        const data = await getProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        setProducts([]);
      } finally {
        setLoadingFeatured(false);
      }
    };

    loadProducts();
  }, []);

  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);
  const categoryCount = useMemo(
    () => new Set(products.map((item) => item.category).filter(Boolean)).size,
    [products],
  );

  const stats = [
    { label: "Products", value: `${products.length || 0}+` },
    { label: "Categories", value: `${categoryCount || 0}` },
    { label: "Delivery", value: "30 min avg" },
    { label: "Checkout", value: "Secure" },
  ];

  const categories = [
    { name: "Fruits", note: "Seasonal and farm fresh" },
    { name: "Vegetables", note: "Daily handpicked stock" },
    { name: "Dairy", note: "Milk, paneer, and more" },
    { name: "Snacks", note: "Quick bites and munchies" },
    { name: "Beverages", note: "Juices and refreshers" },
  ];

  const features = [
    {
      title: "Quality Checked",
      description: "Every product goes through freshness and quality checks.",
    },
    {
      title: "Best Price Value",
      description: "Competitive daily pricing with reliable product quality.",
    },
    {
      title: "Fast Support",
      description: "Quick assistance for order, payment, and delivery updates.",
    },
  ];

  return (
    <div className="min-h-screen product-page-bg">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <section className="animate-rise grid items-center gap-6 rounded-3xl border border-emerald-100/80 bg-gradient-to-r from-emerald-900 via-emerald-800 to-lime-700 p-6 text-white shadow-xl lg:grid-cols-2 lg:p-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-100 sm:text-xs">
              Welcome to FreshMart
            </p>
            <h1 className="m-0 mt-3 text-4xl font-black leading-tight text-white sm:text-5xl">
              Fresh groceries delivered fast to your doorstep
            </h1>
            <p className="mt-3 max-w-xl text-sm text-emerald-100 sm:text-base">
              Shop quality fruits, vegetables, dairy, and pantry essentials in
              minutes with a smooth checkout experience.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
              >
                Shop Now
              </Link>
              <Link
                to="/cart"
                className="rounded-xl border border-white/70 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/20"
              >
                View Cart
              </Link>
            </div>
          </div>

          <div className="relative">
            <img
              src={HERO_IMAGE}
              alt="Fresh grocery assortment"
              className="h-60 w-full rounded-2xl object-cover shadow-lg sm:h-72"
              onError={(event) => {
                event.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
            <div className="absolute -bottom-3 left-4 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-emerald-800 shadow">
              Fresh picks updated daily
            </div>
          </div>
        </section>

        <section className="animate-rise-delayed mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-black text-emerald-700">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="m-0 text-2xl font-black !text-slate-900">Shop by Category</h2>
            <Link
              to="/products"
              className="rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-800"
            >
              See all
            </Link>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category.name}
                to="/products"
                className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-base font-extrabold text-slate-900">{category.name}</p>
                <p className="mt-1 text-xs text-slate-600">{category.note}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="m-0 text-2xl font-black !text-slate-900">Why FreshMart</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-base font-extrabold text-slate-800">{feature.title}</p>
                <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="m-0 text-2xl font-black !text-slate-900">
              Featured Products
            </h2>
            <Link
              to="/products"
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white"
            >
              Browse Products
            </Link>
          </div>

          {loadingFeatured && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-52 animate-pulse rounded-2xl border border-emerald-100 bg-white/80"
                />
              ))}
            </div>
          )}

          {!loadingFeatured && featuredProducts.length === 0 && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="font-semibold text-amber-900">No featured products yet.</p>
            </div>
          )}

          {!loadingFeatured && featuredProducts.length > 0 && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <article
                  key={product._id}
                  className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <img
                    src={product.image || FALLBACK_IMAGE}
                    alt={product.name}
                    className="h-36 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                  <div className="p-3">
                    <p className="m-0 text-base font-extrabold text-slate-900">
                      {product.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{product.category}</p>
                    <p className="mt-2 text-lg font-black text-emerald-700">
                      Rs. {formatCurrency(product.price)}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      per {product.unitLabel || "1 unit"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10 rounded-2xl border border-emerald-100 bg-gradient-to-r from-lime-100 via-emerald-50 to-teal-100 p-6 text-center">
          <p className="text-lg font-black text-slate-900">
            Ready to fill your cart with fresh essentials?
          </p>
          <Link
            to="/products"
            className="mt-4 inline-block rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800"
          >
            Start Shopping
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Home;

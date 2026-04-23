import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { addToCart, getProducts } from "../api/api";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [addingProductId, setAddingProductId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleAddToCart = async (productId) => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      setMessage("Please login first to add products to cart.");
      return;
    }

    try {
      setMessage("");
      setAddingProductId(productId);
      await addToCart({ userId, productId });
      setMessage("Product added to cart.");
    } catch (err) {
      setMessage(err.message || "Could not add product to cart.");
    } finally {
      setAddingProductId("");
    }
  };

  const categories = useMemo(() => {
    const allCategories = products
      .map((product) => product.category)
      .filter(Boolean);
    return ["All", ...new Set(allCategories)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    const result = products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;

      const haystack = [
        product.name,
        product.description,
        product.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !normalizedTerm || haystack.includes(normalizedTerm);

      return matchesCategory && matchesSearch;
    });

    return result.sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;

      if (sortBy === "price-low-high") return priceA - priceB;
      if (sortBy === "price-high-low") return priceB - priceA;
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      return 0;
    });
  }, [products, activeCategory, searchTerm, sortBy]);

  const inStockCount = useMemo(
    () => products.filter((product) => Number(product.stock) > 0).length,
    [products],
  );

  return (
    <div className="min-h-screen product-page-bg">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <section className="animate-rise rounded-2xl border border-emerald-100/80 bg-gradient-to-r from-emerald-900 via-emerald-800 to-lime-700 px-5 py-5 text-white shadow-xl sm:px-7 sm:py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100 sm:text-xs">
            Fresh picks for your kitchen
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="products-hero-title text-white">
                Product Marketplace
              </h1>
              <p className="mt-1 max-w-2xl text-xs text-emerald-100 sm:text-sm">
                Discover organic staples, pantry essentials, and local produce,
                all in one place.
              </p>
            </div>
            <div className="glass-chip min-w-[170px] rounded-xl p-3">
              <p className="text-xs text-emerald-100">In stock today</p>
              <p className="text-2xl font-black text-white">{inStockCount}</p>
            </div>
          </div>
        </section>

        <section className="animate-rise-delayed mt-6 rounded-3xl border border-emerald-100 bg-white/85 p-4 shadow-md backdrop-blur sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative grow min-w-[220px]">
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, category, or description"
                className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            >
              <option value="featured">Featured</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {categories.map((category) => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-emerald-700 text-white shadow-md"
                      : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </section>

        {message && (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {message}
          </p>
        )}

        {!loading && !error && (
          <div className="mt-6 flex items-center justify-between gap-3 text-sm text-slate-600">
            <p>
              Showing <span className="font-bold">{filteredProducts.length}</span>{" "}
              of <span className="font-bold">{products.length}</span> products
            </p>
            {activeCategory !== "All" && (
              <p className="rounded-full bg-lime-100 px-3 py-1 font-semibold text-lime-800">
                {activeCategory}
              </p>
            )}
          </div>
        )}

        {loading && (
          <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-2xl border border-emerald-100 bg-white/80"
              />
            ))}
          </section>
        )}

        {!loading && error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-700">{error}</p>
            <button
              type="button"
              onClick={loadProducts}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
            <p className="text-lg font-bold">No matching products found</p>
            <p className="mt-1 text-sm">
              Try clearing filters or searching with a different keyword.
            </p>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product, index) => (
              <div
                key={product._id}
                className={index < 3 ? "animate-rise-grid" : "animate-rise-soft"}
              >
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  adding={addingProductId === product._id}
                />
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default Products;

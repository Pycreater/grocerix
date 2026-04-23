import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { addToCart, getProductById, getProducts } from "../api/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=60";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        const [detail, allProducts] = await Promise.all([
          getProductById(productId),
          getProducts(),
        ]);

        setProduct(detail);
        const related = (Array.isArray(allProducts) ? allProducts : [])
          .filter((item) => item._id !== detail._id)
          .filter((item) => item.category === detail.category)
          .slice(0, 4);
        setRelatedProducts(related);
      } catch (err) {
        setError(err.message || "Could not load product details.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId]);

  const stockLabel = useMemo(() => {
    const stock = Number(product?.stock) || 0;
    if (stock <= 0) return "Out of stock";
    if (stock <= 5) return `Only ${stock} left`;
    return `${stock} in stock`;
  }, [product?.stock]);

  const handleAddToCart = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      setMessage("Please login first to add this item to cart.");
      return;
    }

    if (!product?._id) return;

    try {
      setAdding(true);
      setMessage("");
      await addToCart({ userId, productId: product._id });
      setMessage("Product added to cart.");
    } catch (err) {
      setMessage(err.message || "Could not add product to cart.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen product-page-bg">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="mb-5">
          <Link
            to="/products"
            className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800"
          >
            Back to Products
          </Link>
        </div>

        {loading && (
          <section className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
            <div className="h-96 animate-pulse rounded-2xl border border-emerald-100 bg-white/80" />
            <div className="h-96 animate-pulse rounded-2xl border border-emerald-100 bg-white/80" />
          </section>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && product && (
          <>
            <section className="animate-rise grid gap-6 lg:grid-cols-[1.05fr_1fr]">
              <article className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
                <img
                  src={product.image || FALLBACK_IMAGE}
                  alt={product.name}
                  className="h-80 w-full object-cover sm:h-[460px]"
                  onError={(event) => {
                    event.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
              </article>

              <article className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Product Details
                </p>
                <h1 className="m-0 mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                  {product.name}
                </h1>
                <p className="mt-2 inline-flex rounded-full bg-lime-100 px-3 py-1 text-xs font-bold text-lime-800">
                  {product.category || "General"}
                </p>

                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  {product.description || "No detailed description available."}
                </p>

                <div className="mt-6 rounded-xl bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-800">Price</p>
                  <p className="text-3xl font-black text-emerald-700">
                    Rs. {formatCurrency(product.price)}
                  </p>
                  <p className="text-xs font-semibold text-slate-600">
                    per {product.unitLabel || "1 unit"}
                  </p>
                  <p
                    className={`mt-2 text-sm font-semibold ${
                      Number(product.stock) > 0 ? "text-lime-700" : "text-red-600"
                    }`}
                  >
                    {stockLabel}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {adding ? "Adding..." : "Add to Cart"}
                </button>

                {message && (
                  <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                    {message}
                  </p>
                )}
              </article>
            </section>

            {relatedProducts.length > 0 && (
              <section className="mt-8">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="m-0 text-2xl font-black !text-slate-900">
                    Related Products
                  </h2>
                  <Link
                    to="/products"
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    See All
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {relatedProducts.map((item) => (
                    <Link
                      key={item._id}
                      to={`/products/${item._id}`}
                      className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <img
                        src={item.image || FALLBACK_IMAGE}
                        alt={item.name}
                        className="h-36 w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                      <div className="p-3">
                        <p className="m-0 text-base font-extrabold text-slate-900">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{item.category}</p>
                        <p className="mt-2 text-lg font-black text-emerald-700">
                          Rs. {formatCurrency(item.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ProductDetail;

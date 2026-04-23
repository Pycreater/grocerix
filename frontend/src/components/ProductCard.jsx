import { Link } from "react-router-dom";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=60";

const ProductCard = ({ product, onAddToCart, adding }) => {
  const outOfStock = Number(product.stock) <= 0;
  const formattedPrice = new Intl.NumberFormat("en-IN").format(
    Number(product.price) || 0,
  );

  return (
    <article className="group overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/products/${product._id}`} className="relative block">
        <img
          src={product.image || FALLBACK_IMAGE}
          alt={product.name}
          className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {product.category && (
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-emerald-800 shadow">
              {product.category}
            </span>
          )}
          {outOfStock && (
            <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
              Out of stock
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          <h2 className="product-title m-0 text-lg font-extrabold text-slate-900 hover:text-emerald-700">
            {product.name}
          </h2>
        </Link>
        <p className="product-desc mt-2 min-h-10 text-sm text-slate-600">
          {product.description || "No description available for this product."}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Price
            </p>
            <p className="text-2xl font-black text-emerald-700">
              Rs. {formattedPrice}
            </p>
            <p className="text-xs font-semibold text-slate-500">
              per {product.unitLabel || "1 unit"}
            </p>
          </div>
          <div
            className={`rounded-lg px-3 py-1 text-xs font-bold ${
              outOfStock
                ? "bg-red-100 text-red-700"
                : "bg-lime-100 text-lime-700"
            }`}
          >
            Stock: {product.stock ?? 0}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            to={`/products/${product._id}`}
            className="rounded-xl border border-emerald-200 px-4 py-2.5 text-center text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
          >
            View
          </Link>
          <button
            type="button"
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            onClick={() => onAddToCart(product._id)}
            disabled={adding}
          >
            {adding ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
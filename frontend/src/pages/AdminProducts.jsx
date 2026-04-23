import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../api/api";

const blankForm = {
  name: "",
  category: "",
  unitLabel: "",
  price: "",
  stock: "",
  image: "",
  description: "",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState(blankForm);
  const [stockDraft, setStockDraft] = useState({});
  const [editProduct, setEditProduct] = useState(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const list = await getProducts();
      const productsList = Array.isArray(list) ? list : [];
      setProducts(productsList);
      setStockDraft(
        productsList.reduce((acc, item) => {
          acc[item._id] = String(Number(item.stock || 0));
          return acc;
        }, {}),
      );
    } catch (err) {
      setError(err.message || "Could not load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      setMessage("");
      await createProduct({
        name: newProduct.name,
        category: newProduct.category,
        unitLabel: newProduct.unitLabel,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        image: newProduct.image,
        description: newProduct.description,
      });
      setMessage("Product added successfully.");
      setNewProduct(blankForm);
      setShowAddModal(false);
      await loadProducts();
    } catch (err) {
      setError(err.message || "Could not create product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveStock = async (product) => {
    const nextStock = Number(stockDraft[product._id]);
    if (!Number.isInteger(nextStock) || nextStock < 0) {
      setError("Stock must be an integer >= 0.");
      return;
    }

    try {
      setUpdatingId(product._id);
      setError("");
      setMessage("");
      await updateProduct(product._id, {
        name: product.name,
        category: product.category,
        unitLabel: product.unitLabel || "1 unit",
        price: Number(product.price),
        stock: nextStock,
        image: product.image || "",
        description: product.description || "",
      });
      setMessage(`Stock updated for ${product.name}.`);
      await loadProducts();
    } catch (err) {
      setError(err.message || "Could not update stock.");
    } finally {
      setUpdatingId("");
    }
  };

  const handleEditProduct = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      setMessage("");
      await updateProduct(editProduct._id, {
        name: editProduct.name,
        category: editProduct.category,
        unitLabel: editProduct.unitLabel || "1 unit",
        price: Number(editProduct.price),
        stock: Number(editProduct.stock),
        image: editProduct.image || "",
        description: editProduct.description || "",
      });
      setMessage(`${editProduct.name} updated successfully.`);
      setEditProduct(null);
      await loadProducts();
    } catch (err) {
      setError(err.message || "Could not update product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      setDeletingId(productId);
      setError("");
      setMessage("");
      await deleteProduct(productId);
      setMessage("Product deleted successfully.");
      await loadProducts();
    } catch (err) {
      setError(err.message || "Could not delete product.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <AdminLayout
      title="Products"
      subtitle="Add products, set unit labels, maintain stock, and delete old items."
    >
      {message && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <section className="mt-6 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="m-0 text-xl font-black !text-slate-900">Product Details</h2>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="rounded-full bg-emerald-700 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-800"
          >
            + Add Product
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <h2 className="m-0 text-xl font-black !text-slate-900">Stock Management</h2>
        {loading ? (
          <p className="mt-3 text-sm text-slate-600">Loading products...</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700">
                  <th className="py-2 pr-3">Product</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3">Unit</th>
                  <th className="py-2 pr-3">Price</th>
                  <th className="py-2 pr-3">Stock</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b border-slate-100 text-slate-900">
                    <td className="py-2 pr-3 font-semibold">{product.name}</td>
                    <td className="py-2 pr-3">{product.category}</td>
                    <td className="py-2 pr-3">{product.unitLabel || "1 unit"}</td>
                    <td className="py-2 pr-3">Rs. {formatCurrency(product.price)}</td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min="0"
                        className="w-24 rounded-lg border border-emerald-200 px-2 py-1"
                        value={stockDraft[product._id] ?? ""}
                        onChange={(e) =>
                          setStockDraft((prev) => ({
                            ...prev,
                            [product._id]: e.target.value,
                          }))
                        }
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={updatingId === product._id}
                          onClick={() => handleSaveStock(product)}
                          className="rounded-lg bg-emerald-700 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          {updatingId === product._id ? "Saving..." : "Save Stock"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditProduct({ ...product, price: String(product.price), stock: String(product.stock) })}
                          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === product._id}
                          onClick={() => handleDeleteProduct(product._id)}
                          className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          {deletingId === product._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-emerald-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="m-0 text-2xl font-black !text-slate-900">Edit Product</h2>
              <button
                type="button"
                onClick={() => setEditProduct(null)}
                className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-emerald-50"
              >
                Close
              </button>
            </div>

            {editProduct.image && (
              <img
                src={editProduct.image}
                alt="preview"
                className="mt-4 h-36 w-full rounded-xl object-cover border border-emerald-100"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            )}

            <form onSubmit={handleEditProduct} className="mt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  value={editProduct.name}
                  onChange={(e) => setEditProduct((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Product name"
                  className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-emerald-500"
                />
                <input
                  required
                  value={editProduct.category}
                  onChange={(e) => setEditProduct((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="Category"
                  className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-emerald-500"
                />
                <input
                  required
                  value={editProduct.unitLabel}
                  onChange={(e) => setEditProduct((prev) => ({ ...prev, unitLabel: e.target.value }))}
                  placeholder="Unit (e.g. 1 kg, 500 g, 1 pack)"
                  className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-emerald-500"
                />
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={editProduct.stock}
                  onChange={(e) => setEditProduct((prev) => ({ ...prev, stock: e.target.value }))}
                  placeholder="Stock"
                  className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-emerald-500"
                />
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={editProduct.price}
                  onChange={(e) => setEditProduct((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="Price"
                  className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-emerald-500"
                />
              </div>

              <input
                value={editProduct.image}
                onChange={(e) => setEditProduct((prev) => ({ ...prev, image: e.target.value }))}
                placeholder="Image URL (optional)"
                className="mt-3 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-emerald-500"
              />
              <textarea
                rows={3}
                value={editProduct.description}
                onChange={(e) => setEditProduct((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Description (optional)"
                className="mt-3 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-emerald-500"
              />

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditProduct(null)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-emerald-200 bg-white p-5 text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="m-0 text-2xl font-black !text-slate-900">Add Product</h2>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setNewProduct(blankForm);
                }}
                className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-emerald-50"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="mt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Product name"
                  className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-emerald-500"
                />
                <input
                  required
                  value={newProduct.category}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="Category"
                  className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-emerald-500"
                />
                <input
                  required
                  value={newProduct.unitLabel}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, unitLabel: e.target.value }))}
                  placeholder="Unit (e.g. 1 kg, 500 g, 1 pack)"
                  className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-emerald-500"
                />
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, stock: e.target.value }))}
                  placeholder="Stock"
                  className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-emerald-500"
                />
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="Price"
                  className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-emerald-500"
                />
              </div>

              <input
                value={newProduct.image}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, image: e.target.value }))}
                placeholder="Image URL (optional)"
                className="mt-3 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-emerald-500"
              />
              {newProduct.image && (
                <img
                  src={newProduct.image}
                  alt="preview"
                  className="mt-2 h-32 w-full rounded-xl object-cover border border-emerald-100"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              )}
              <textarea
                rows={3}
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Description (optional)"
                className="mt-3 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-emerald-500"
              />

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewProduct(blankForm);
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;

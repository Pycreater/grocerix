import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Components/NavBar";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        const foundProduct = data.find((p) => p._id === id);
        setProduct(foundProduct);
      })
      .catch((err) => console.log(err));
  }, [id]);

  if (!product) {
    return <h1 className="p-10 text-xl">Loading...</h1>;
  }

  const handleAddToCart = async () => {
  const userId = localStorage.getItem("userId");

  console.log("USER ID:", userId);
  console.log("PRODUCT ID:", product._id);

  if (!userId) {
    alert("Please login first");
    return;
  }

  const res = await fetch("http://localhost:5000/api/cart/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      productId: product._id,
    }),
  });

  const data = await res.json();
  console.log("CART RESPONSE:", data);

  alert("Added to cart");
};

  return (
    <div>
      <Navbar />

      <div className="p-10 grid md:grid-cols-2 gap-10">
        {/* IMAGE */}
        <img
          src={product.image || "/fruits.jpg"}
          alt={product.name}
          className="w-full h-80 object-cover rounded-xl"
        />

        {/* DETAILS */}
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <p className="text-green-600 text-xl mt-2">₹{product.price}</p>

          <p className="mt-4 text-gray-600">{product.description}</p>

          <button
            onClick={handleAddToCart}
            className="mt-6 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 hover:pointer transition"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

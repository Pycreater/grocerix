import { useEffect, useState } from "react";
import Navbar from "../Components/NavBar";

const Cart = () => {
  const [cart, setCart] = useState(null);

  useEffect(() => {
  const userId = localStorage.getItem("userId");

  if (!userId) return;

  fetch(`http://localhost:5000/api/cart/${userId}`)
    .then((res) => res.json())
    .then((data) => {
      console.log("CART DATA:", data);
      setCart(data);
    })
    .catch((err) => console.log(err));
}, []);

  if (!cart) return <h1 className="p-10">Loading...</h1>;

  return (
    <div>
      <Navbar />

      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Your Cart 🛒</h1>

        {cart.items.length === 0 ? (
          <h2>Cart is empty</h2>
        ) : (
          cart.items.map((item) => (
            <div
              key={item._id}
              className="flex justify-between bg-white p-4 mb-4 rounded shadow"
            >
              <div>
                <h2>{item.product.name}</h2>
                <p>₹{item.product.price}</p>
              </div>

              <p>Qty: {item.quantity}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Cart;
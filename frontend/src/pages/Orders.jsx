import { useEffect, useState } from "react";
import Navbar from "../Components/NavBar";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    fetch(`http://localhost:5000/api/orders/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("ORDERS:", data);
        setOrders(data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      <Navbar />

      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">My Orders 📦</h1>

        {orders.length === 0 ? (
          <h2>No orders yet</h2>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="bg-white shadow rounded-xl p-6 mb-6"
            >
              <p className="text-gray-500 mb-2">
                Order ID: {order._id}
              </p>

              <p className="text-gray-500 mb-4">
                Date: {new Date(order.createdAt).toLocaleString()}
              </p>

              {order.items.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between border-b py-2"
                >
                  <p>{item.product.name}</p>
                  <p>₹{item.product.price}</p>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
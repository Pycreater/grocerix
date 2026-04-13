import { useEffect, useState } from "react";
import Navbar from "../Components/NavBar";
import { Link } from "react-router-dom";

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        console.log("Products:", data);
        setProducts(data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      <Navbar />

      <h1 className="text-2xl font-bold p-6">All Products</h1>

      {products.length === 0 ? (
        <h2 className="p-6">No products found</h2>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          
          {products.map((p) => (
            <Link to={`/product/${p._id}`} key={p._id}>
              <div className="bg-white shadow rounded-xl p-4 cursor-pointer hover:shadow-lg transition">
                
                <img
                  src={p.image || "/fruits.jpg"}
                  alt={p.name}
                  className="h-40 w-full object-cover rounded"
                />

                <h2 className="mt-2 font-bold">{p.name}</h2>
                <p className="text-green-600">₹{p.price}</p>

              </div>
            </Link>
          ))}

        </div>
      )}
    </div>
  );
};

export default Products;
import { useState } from "react";
import Navbar from "../components/Navbar";
import { loginUser, registerUser } from "../api/api";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let data;

    if (isLogin) {
      data = await loginUser({
        email: form.email,
        password: form.password,
      });
    } else {
      data = await registerUser(form);
    }

    if (data.user) {
      localStorage.setItem("userId", data.user._id);
      alert("Success 🎉");
      navigate("/");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="grid md:grid-cols-2 min-h-[90vh]">

        {/* LEFT SIDE IMAGE */}
        <div className="hidden md:flex items-center justify-center bg-green-100">
          <img
            src="/data/banner2.png"
            alt="FreshMart"
            className="w-[80%] object-contain"
          />
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="flex items-center justify-center px-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md"
          >
            <h2 className="text-3xl font-bold text-center mb-6">
              {isLogin ? "Welcome Back 👋" : "Create Account 🛒"}
            </h2>

            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="w-full mb-3 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={handleChange}
              />
            )}

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className="w-full mb-3 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={handleChange}
            />

            <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-md">
              {isLogin ? "Login" : "Register"}
            </button>

            <p
              className="text-sm text-center mt-5 cursor-pointer text-gray-600 hover:text-green-600 transition"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Don't have an account? Register"
                : "Already have an account? Login"}
            </p>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;
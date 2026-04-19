import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { loginUser, registerUser } from "../api/api";
import { clearUserSession, getStoredUser, saveUserSession } from "../utils/auth";

const LOGIN_BG_IMAGE =
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80";
const LOGIN_BG_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=1000&q=75";

const Login = () => {
  const navigate = useNavigate();
  const currentUser = getStoredUser();

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const headline = useMemo(
    () => (mode === "login" ? "Welcome back to FreshMart" : "Create your FreshMart account"),
    [mode]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const cleanedName = name.trim();
    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    if (mode === "register" && cleanedName.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      let response;
      if (mode === "register") {
        response = await registerUser({
          name: cleanedName,
          email: cleanedEmail,
          password,
        });
      } else {
        response = await loginUser({ email: cleanedEmail, password });
      }

      if (response?.user?._id) {
        saveUserSession({ ...response.user, token: response.token });
      }

      setMessage(
        mode === "login"
          ? "Login successful. Redirecting to products..."
          : "Registration successful. Redirecting to products..."
      );

      setTimeout(() => {
        navigate("/products");
      }, 700);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearUserSession();
    setMessage("Logged out successfully.");
    setError("");
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <img
          src={LOGIN_BG_IMAGE}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover opacity-45"
          onError={(event) => {
            event.currentTarget.src = LOGIN_BG_FALLBACK_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/70 via-slate-900/65 to-lime-900/60" />
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-lime-300/25 blur-3xl" />
        <div className="absolute top-20 right-0 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-teal-300/15 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl px-4 pb-5 pt-2 sm:px-6 sm:pt-3 lg:px-10 lg:pt-4">
          <div className="mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-white/25 bg-white/78 shadow-2xl backdrop-blur-md">
            <div className="min-h-[420px]">
            <section className="flex items-start justify-center bg-white/88 px-4 py-5 backdrop-blur-sm sm:px-8 lg:px-9">
              <div className="w-full max-w-md">
                <h1 className="m-0 text-3xl font-black leading-tight !text-slate-900">
                  {headline}
                </h1>
                <p className="mt-2 text-sm text-slate-700">
                  {mode === "login"
                    ? "Sign in to continue shopping and track your orders."
                    : "Register once and start adding your daily essentials in seconds."}
                </p>

                <div className="mt-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                      mode === "login"
                        ? "bg-white text-emerald-700 shadow-sm"
                        : "text-slate-700 hover:text-slate-900"
                    }`}
                    onClick={() => {
                      setMode("login");
                      setError("");
                      setMessage("");
                    }}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                      mode === "register"
                        ? "bg-white text-emerald-700 shadow-sm"
                        : "text-slate-700 hover:text-slate-900"
                    }`}
                    onClick={() => {
                      setMode("register");
                      setError("");
                      setMessage("");
                    }}
                  >
                    Register
                  </button>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="mt-4 space-y-4 rounded-2xl border border-emerald-100 bg-white/85 p-5 shadow-sm backdrop-blur-sm"
                >
                  {mode === "register" && (
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                      >
                        Full Name
                      </label>
                      <input
                        id="name"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                      />
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      placeholder="you@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 pr-16 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                        placeholder="Minimum 6 characters"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-emerald-700 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Please wait..."
                      : mode === "login"
                      ? "Login to FreshMart"
                      : "Create Account"}
                  </button>
                </form>

                {error && (
                  <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}
                {message && (
                  <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {message}
                  </p>
                )}

                {currentUser && (
                  <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                          Logged in as
                        </p>
                        <p className="truncate text-sm font-bold text-slate-900">
                          {currentUser.userName || "FreshMart user"}
                        </p>
                        <p className="truncate text-xs text-slate-600">
                          {currentUser.userEmail || "No email available"}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;

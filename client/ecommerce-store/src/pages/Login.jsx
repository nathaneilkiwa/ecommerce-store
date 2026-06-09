// frontend/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/login", form);
      
      console.log("Login response:", res.data); // Debug log

      // Save user data - handle both response formats
      const userData = res.data.user || res.data;
      const token = res.data.token;
      
      if (token) {
        localStorage.setItem("token", token);
      }
      
      // Make sure user object has all required fields
      localStorage.setItem("user", JSON.stringify({
        _id: userData._id,
        name: userData.name || userData.username,
        email: userData.email,
        role: userData.role || "user"
      }));

      // Dispatch events
      window.dispatchEvent(new Event("userLoggedIn"));
      window.dispatchEvent(new Event("cartUpdated"));

      toast.success("Login successful!");

      // Redirect based on role
      const userRole = userData.role || "user";
      if (userRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500 mt-1">Please sign in to your account</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800 text-white"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-purple-600 hover:text-purple-700 font-medium">
              Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
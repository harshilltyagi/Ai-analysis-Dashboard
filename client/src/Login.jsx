import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await axios.post(` ${API_URL}/api/auth/login`, formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/upload");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f1e8] text-[#1f1a14]">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="hidden lg:flex flex-col justify-between p-10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#f08c33] text-white flex items-center justify-center font-bold text-lg">
              AI
            </div>

            <div>
              <h1 className="text-xl font-semibold">DataSense</h1>
              <p className="text-sm text-gray-500">AI Analyst Dashboard</p>
            </div>
          </div>

          <div className="pr-10">
            <p className="inline-block rounded-full bg-white px-4 py-2 text-sm text-gray-600 shadow-sm mb-4">
              Welcome Back
            </p>

            <h2 className="text-5xl font-semibold leading-tight">
              Login and continue your smart data analysis journey.
            </h2>

            <p className="mt-5 text-lg text-gray-600">
              Upload CSV files, generate charts, ask AI questions, and export
              reports.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-3xl bg-[#fbf7f1] p-5 shadow-sm">
              <p className="text-sm text-gray-500">Upload</p>
              <p className="mt-2 text-2xl font-semibold">CSV</p>
            </div>

            <div className="rounded-3xl bg-[#fbf7f1] p-5 shadow-sm">
              <p className="text-sm text-gray-500">AI</p>
              <p className="mt-2 text-2xl font-semibold">Insights</p>
            </div>

            <div className="rounded-3xl bg-[#fbf7f1] p-5 shadow-sm">
              <p className="text-sm text-gray-500">Export</p>
              <p className="mt-2 text-2xl font-semibold">PDF</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md rounded-[32px] border border-[#eadfce] bg-[#fbf7f1] p-8 shadow-sm">
            <div className="mb-8">
              <p className="text-sm text-gray-500">Access your dashboard</p>

              <h2 className="mt-2 text-4xl font-semibold">Login</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-[#eadfce] bg-white px-4 py-3 outline-none focus:border-[#f08c33]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-[#eadfce] bg-white px-4 py-3 outline-none focus:border-[#f08c33]"
                />
              </div>

              {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-black py-3 text-white font-medium hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Logging In..." : "Login"}
              </button>
            </form>

            <p className="mt-6 text-sm text-gray-600">
              Don’t have an account?{" "}
              <Link to="/signup" className="font-medium text-black underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

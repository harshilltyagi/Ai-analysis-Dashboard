import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/signup`, formData);

      setMessage(res.data.message || "Account created successfully");

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
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
              Get Started
            </p>

            <h2 className="text-5xl font-semibold leading-tight">
              Create your account and start analyzing CSV data with AI.
            </h2>

            <p className="mt-5 text-lg text-gray-600">
              Upload files, generate charts, ask questions, and download smart
              reports.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-3xl bg-[#fbf7f1] p-5 shadow-sm">
              <p className="text-sm text-gray-500">Reports</p>
              <p className="mt-2 text-2xl font-semibold">PDF</p>
            </div>

            <div className="rounded-3xl bg-[#fbf7f1] p-5 shadow-sm">
              <p className="text-sm text-gray-500">Charts</p>
              <p className="mt-2 text-2xl font-semibold">Live</p>
            </div>

            <div className="rounded-3xl bg-[#fbf7f1] p-5 shadow-sm">
              <p className="text-sm text-gray-500">AI</p>
              <p className="mt-2 text-2xl font-semibold">Smart</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md rounded-[32px] border border-[#eadfce] bg-[#fbf7f1] p-8 shadow-sm">
            <div className="mb-8">
              <p className="text-sm text-gray-500">Build your workspace</p>

              <h2 className="mt-2 text-4xl font-semibold">Sign Up</h2>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-[#eadfce] bg-white px-4 py-3 outline-none focus:border-[#f08c33]"
                />
              </div>

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
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-[#eadfce] bg-white px-4 py-3 outline-none focus:border-[#f08c33]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Role</label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#eadfce] bg-white px-4 py-3 outline-none focus:border-[#f08c33]"
                >
                  <option value="student">Student</option>
                </select>
              </div>

              {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-600">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-black py-3 text-white font-medium hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/" className="font-medium text-black underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;

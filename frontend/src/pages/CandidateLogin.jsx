// src/pages/CandidateLogin.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AnimatedBlobBackground from "../components/AnimatedBlobBackground";
// import { FaGoogle, FaLinkedin } from "react-icons/fa"; // <-- Removed
import { FiEye, FiEyeOff } from "react-icons/fi";
import { loginCandidate } from "../api/api";

export default function CandidateLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const loginData = { email: email, pass_word: password };

    setLoading(true);
    try {
      const data = await loginCandidate(loginData);
      localStorage.setItem("token", data.access_token);
      setLoading(false);
      navigate("/candidate/profile");
    } catch (err) {
      setLoading(false);
      console.error("Login failed:", err);
      const errorMsg =
        err.response?.data?.detail ||
        "Invalid email or password. Please try again.";
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-light flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <AnimatedBlobBackground />
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-dark">
          Candidate Login
        </h2>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-sm py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && <p className="text-center text-sm text-red-600">{error}</p>}

            {/* Forgot password + Submit */}
            <div className="flex flex-col items-center">
              <Link
                to="/candidate/forgot-password"
                className="text-sm text-primary hover:text-primary-dark mb-4"
              >
                Forgot your password? Click here to reset it.
              </Link>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary hover:bg-primary-dark"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </div>
          </form>

          {/* --- Social logins block removed --- */}

          {/* Sign up link */}
          <p className="text-sm text-center mt-4">
            Don’t have an account?{" "}
            <Link
              to="/candidate/signup"
              className="font-medium text-primary hover:text-primary-dark"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
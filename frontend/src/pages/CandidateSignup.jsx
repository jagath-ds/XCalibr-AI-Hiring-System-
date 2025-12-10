// src/pages/CandidateSignup.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import AnimatedBlobBackground from "../components/AnimatedBlobBackground";
import { createCandidate } from "../api/api"; // Make sure this is uncommented

export default function CandidateSignup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    // 2. Check for empty fields
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    // --- 3. NEW: Detailed Password Validation ---
    const passwordErrors = [];
    if (password.length < 12) {
      passwordErrors.push("at least 12 characters");
    }
    if (!/[a-z]/.test(password)) {
      passwordErrors.push("a lowercase letter");
    }
    if (!/[A-Z]/.test(password)) {
      passwordErrors.push("an uppercase letter");
    }
    if (!/[0-9]/.test(password)) {
      passwordErrors.push("a number");
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      passwordErrors.push("a special character (e.g., @, #, $)");
    }

    if (passwordErrors.length > 0) {
      // Create a clear error message
      setError(`Password must contain: ${passwordErrors.join(", ")}.`);
      return;
    }
    // --- End of New Validation ---

    setLoading(true);
    try {
      // This is the API call
      const response = await createCandidate({
        firstname: firstName,
        lastname: lastName,
        email: email,
        pass_word: password,
      });

      console.log("Signup successful:", response);
      alert("Signup successful! Please log in.");
      navigate("/candidate/login");

    } catch (err) {
      console.error("Signup failed:", err);
      // Show the actual error from the backend (e.g., "Email already registered")
      const errorMsg =
        err.response?.data?.detail || "Signup failed. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 bg-light relative overflow-hidden">
      <AnimatedBlobBackground />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-dark">
          Candidate Sign Up
        </h2>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-sm py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10">
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="First"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Last"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3"
                required
                disabled={loading}
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-slate-500"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-slate-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <FiEyeOff size={20} />
                ) : (
                  <FiEye size={20} />
                )}
              </button>
            </div>

            {error && (
              // This will now show the detailed password error
              <p className="text-center text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary hover:bg-primary-dark"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
          <p className="text-sm text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <Link
              to="/candidate/login"
              className="font-medium text-primary hover:text-primary-dark"
            >
              Login Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
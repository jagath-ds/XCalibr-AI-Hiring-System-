import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLoader, FiShield } from "react-icons/fi";
import { loginAdmin } from "../api/api";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); 
    setLoading(true);
    
    const loginData = {
      email: email.trim(),
      password: password
    };

    console.log('Attempting admin login with email:', email);

    try {
      const data = await loginAdmin(loginData);
      console.log('Login response:', data);
      
      if (!data.access_token) {
        throw new Error('No access token received from server');
      }
      
      // Store the admin token
      localStorage.setItem("admin_token", data.access_token);
      console.log('Admin token stored successfully');
      
      setLoading(false);
      
      // Redirect to the admin dashboard
      navigate("/system-admin-portal-2024", { replace: true });

    } catch (err) {
      setLoading(false);
      console.error("Admin login failed:", err);
      console.error("Error response:", err.response?.data);
      const errorMsg = err.response?.data?.detail || err.message || "Invalid email or password.";
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col justify-center items-center py-12 px-4">
      {/* Header */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <FiShield className="text-5xl text-primary" />
        </div>
        <h2 className="text-4xl font-extrabold text-white mb-2">
          XCalibr Admin Portal
        </h2>
        <p className="text-slate-400">Secure administrative access</p>
      </div>

      {/* Login Form */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-200">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@xcalibr.com"
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 text-slate-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            
            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 pr-12 text-slate-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-primary hover:bg-primary-dark disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-center text-slate-500">
              🔒 This is a secure administrative area. All access is logged and monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
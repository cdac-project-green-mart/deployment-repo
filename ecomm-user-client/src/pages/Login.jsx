import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import eyeIcon from "../assets/eye.svg";
import { login as authLogin, getAuthErrorMessage } from "../api/authApi";
import { getProfile } from "../api/userApi";
import { mergeGuestCartToUser, isLoggedIn } from "../utils/cartUtils";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state (e.g., from checkout)
  const from = location.state?.from || "/";

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn()) {
      navigate(from, { replace: true });
    }
  }, [navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    setLoading(true);
    try {
      const data = await authLogin(email.trim(), password);
      const token = data?.token ?? data?.accessToken;
      if (token) {
        localStorage.setItem("token", token);
        // Store user info for account page
        if (data?.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          // Fallback: store email if user object not returned
          localStorage.setItem("user", JSON.stringify({ email: email.trim() }));
        }

        // Fetch full profile from User Service (phone, addresses, preferences)
        try {
          const profile = await getProfile();
          if (profile) {
            const existing = JSON.parse(localStorage.getItem("user") || "{}");
            localStorage.setItem("user", JSON.stringify({ ...existing, ...profile }));
          }
        } catch { /* profile fetch optional — Account page will retry */ }

        // Merge guest cart items into user's cart
        mergeGuestCartToUser();
        // Dispatch auth changed event
        window.dispatchEvent(new CustomEvent('authChanged'));
        // Navigate to the original destination or home
        navigate(from, { replace: true });
      } else {
        setError("Invalid response from server.");
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-white">
      <div className="bg-white p-8 rounded-2xl shadow-[0_10px_60px_rgba(0,0,0,0.06)] w-96 text-center">
        <h2 className="text-2xl font-bold mb-6">Sign In</h2>

        <form onSubmit={handleSubmit}>
          {error && (
            <p className="text-red-600 text-sm mb-4" role="alert">
              {error}
            </p>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <img
              src={eyeIcon}
              onClick={() => setShowPassword(!showPassword)}
              className="w-5 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer opacity-70 hover:opacity-100"
              alt="Toggle password visibility"
            />
          </div>

          <div className="flex justify-between items-center mb-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Remember me
            </label>
            <button type="button" className="text-gray-500 hover:text-black">
              Forget Password
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-full text-lg transition disabled:opacity-70"
          >
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm">
          Don&apos;t have account?{" "}
          <Link to="/register" className="font-bold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

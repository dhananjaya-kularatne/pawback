import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { loginUser } from "../../api/authApi";
import AuthModalShell from "./AuthModalShell";

// Sign-in form rendered as a modal on the landing page — the counterpart to
// RegisterModal. On success it persists the returned token/user and calls
// onSuccess so the landing page decides what happens next.
export default function LoginModal({ onClose, onSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      onSuccess();
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthModalShell
      onClose={onClose}
      title="Sign in to your account"
      subtitle="Access your dashboard and manage your pets."
      footer={
        <>
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-700 hover:text-blue-800 font-medium underline cursor-pointer"
          >
            Register
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm font-medium border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={15} />
            </div>
            <input
              id="login-email"
              type="email"
              required
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-700 transition-shadow text-gray-900"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="login-password" className="block text-xs font-medium text-gray-700">Password</label>
            <Link
              to="/forgot-password"
              className="text-xs text-blue-700 hover:text-blue-800 font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock size={15} />
            </div>
            <input
              id="login-password"
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-700 transition-shadow text-gray-900"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800
                     text-white text-sm font-semibold py-2.5 px-4 rounded-lg shadow-sm
                     transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : (<>Sign in <ArrowRight size={15} /></>)}
        </button>
      </form>
    </AuthModalShell>
  );
}

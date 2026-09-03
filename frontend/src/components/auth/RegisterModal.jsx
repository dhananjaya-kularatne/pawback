import { useState } from "react";
import { User, Mail, Lock, Phone, ArrowRight } from "lucide-react";
import { registerUser } from "../../api/authApi";
import AuthModalShell from "./AuthModalShell";

// Register form rendered as a modal on the landing page. On success it persists
// the returned token/user and hands control back to the caller via onSuccess so
// the landing page can decide what to do next (stay put, redirect, etc).
export default function RegisterModal({ onClose, onSuccess, onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setPasswordError("");

    // Client-side check — don't hit the API if passwords don't match
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser({ name, email, phone, password });
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      onSuccess();
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthModalShell
      onClose={onClose}
      title="Create your account"
      subtitle="Register your pet and start protecting them today."
      footer={
        <>
          Already registered?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-700 hover:text-blue-800 font-medium underline cursor-pointer"
          >
            Sign in
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
        {/* Full Name */}
        <div>
          <label htmlFor="reg-name" className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <User size={15} />
            </div>
            <input
              id="reg-name"
              type="text"
              required
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-700 transition-shadow text-gray-900"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={15} />
            </div>
            <input
              id="reg-email"
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

        {/* Phone */}
        <div>
          <label htmlFor="reg-phone" className="block text-xs font-medium text-gray-700 mb-1">
            Phone <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Phone size={15} />
            </div>
            <input
              id="reg-phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-700 transition-shadow text-gray-900"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="reg-password" className="block text-xs font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock size={15} />
            </div>
            <input
              id="reg-password"
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-700 transition-shadow text-gray-900"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="reg-confirm" className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock size={15} />
            </div>
            <input
              id="reg-confirm"
              type="password"
              required
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-700 transition-shadow text-gray-900 ${
                           passwordError ? "border-red-500 bg-red-50/30" : "border-gray-300"
                         }`}
            />
          </div>
          {passwordError && (
            <p className="mt-1 text-xs text-red-600 font-medium">{passwordError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800
                     text-white text-sm font-semibold py-2.5 px-4 rounded-lg shadow-sm
                     transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account..." : (<>Create Account <ArrowRight size={15} /></>)}
        </button>
      </form>
    </AuthModalShell>
  );
}

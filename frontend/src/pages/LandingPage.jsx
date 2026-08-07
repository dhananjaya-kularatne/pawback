import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PawPrint, Shield, QrCode, Bell, ArrowRight, Heart, X, User, Mail, Lock, Phone } from "lucide-react";
import heroImg from "../assets/hero.png";
import { registerUser } from "../api/authApi";

// Landing page — register modal opens as a popup overlay when CTA is clicked
function LandingPage() {
  const navigate = useNavigate();

  // Derive auth state from token presence — no global auth context needed yet
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  // null = closed, true = open — follows the team modal state pattern
  const [registerOpen, setRegisterOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  function openRegister() {
    setRegisterOpen(true);
    setError("");
    setPasswordError("");
    setName(""); setEmail(""); setPhone(""); setPassword(""); setConfirmPassword("");
  }

  function closeRegister() {
    setRegisterOpen(false);
  }

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
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 border-b border-blue-800/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-white group">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <PawPrint size={22} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">PawBack</span>
          </Link>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                to="/dashboard"
                className="bg-white text-blue-800 hover:bg-blue-50 text-sm font-semibold
                           px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-blue-100 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <button
                  onClick={openRegister}
                  className="bg-white text-blue-800 hover:bg-blue-50 text-sm font-semibold
                             px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-paw-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-paw-pattern)" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-blue-100">
              <Shield size={14} />
              The Smart Protection System for Your Pets
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-sm">
              Keep your pets safe & always findable.
            </h1>

            <p className="text-lg text-blue-100 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Create instant digital pet profiles, generate unique scannable QR tags, and reunite with your lost furry family members faster than ever.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {isLoggedIn ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full sm:w-auto bg-white text-blue-800 hover:bg-blue-50 text-base
                             font-semibold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl
                             hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRight size={18} />
                </button>
              ) : (
                <>
                  <button
                    onClick={openRegister}
                    className="w-full sm:w-auto bg-white text-blue-800 hover:bg-blue-50 text-base
                               font-semibold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl
                               hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    Register your pet
                    <ArrowRight size={18} />
                  </button>

                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full sm:w-auto border border-white/30 hover:bg-white/10 text-white
                               text-base font-medium px-7 py-3.5 rounded-xl transition-all cursor-pointer"
                  >
                    Explore Dashboard
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Hero Image */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur-lg opacity-30"></div>
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-3xl shadow-2xl overflow-hidden">
                <img
                  src={heroImg}
                  alt="Happy pet owner with registered dog"
                  className="w-full h-80 sm:h-96 object-cover rounded-2xl shadow-inner"
                />
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/40 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700 flex-shrink-0">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">QR Code Tag Enabled</p>
                    <p className="text-xs text-gray-600">Scan to view owner contact details instantly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
            Why pet parents choose PawBack
          </h2>
          <p className="text-gray-600 text-base">
            Simple, reliable, and built to give you peace of mind wherever your pets wander.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-6">
              <QrCode size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant QR Tags</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Generate custom QR tags for collar attachment. Anyone with a smartphone can scan and contact you instantly.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mb-6">
              <Shield size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Status Toggle</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Switch your pet status between "Safe" and "Lost" at a tap. Control what details are shown to rescuers.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center mb-6">
              <Bell size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Reunification</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Provide specific "If Found" instructions and phone numbers so finders can reach you without delay.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Ready to protect your pet?</h2>
          <p className="text-gray-300 text-base max-w-xl mx-auto">
            {isLoggedIn
              ? "Welcome back! Head to your dashboard to manage your pets."
              : "It takes less than 2 minutes to create an account and register your pet's first profile."}
          </p>
          {isLoggedIn ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold
                         px-8 py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              onClick={openRegister}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold
                         px-8 py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Get Started for Free
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2 font-medium text-gray-700">
            <PawPrint size={16} className="text-blue-700" />
            <span>PawBack © {new Date().getFullYear()}</span>
          </div>
          <p className="flex items-center gap-1">
            Built with <Heart size={12} className="text-red-500 fill-red-500 mx-1" /> for pet owners everywhere.
          </p>
          <div className="flex items-center gap-6">
            {!isLoggedIn && (
              <button onClick={openRegister} className="hover:text-gray-900 transition-colors cursor-pointer">Register</button>
            )}
            <Link to="/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>

      {/* Register Modal — dark backdrop, centered white card, close button top-right */}
      {registerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={closeRegister}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeRegister}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full
                         text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
              aria-label="Close register form"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center">
                  <PawPrint size={18} className="text-white" />
                </div>
                <span className="font-bold text-gray-900">PawBack</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Create your account</h2>
              <p className="text-sm text-gray-600 mt-1">Register your pet and start protecting them today.</p>
            </div>

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

            <p className="mt-4 text-center text-xs text-gray-500">
              Already registered?{" "}
              <Link to="/dashboard" className="text-blue-700 hover:text-blue-800 font-medium underline">
                Go to Dashboard
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;

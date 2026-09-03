import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PawPrint, Shield, QrCode, Bell, ArrowRight, Heart } from "lucide-react";
import heroImg from "../assets/hero.png";
import RegisterModal from "../components/auth/RegisterModal";
import LoginModal from "../components/auth/LoginModal";
import AccountMenu from "../components/AccountMenu";
import AppHeader from "../components/AppHeader";

// Landing page — the register form opens as a modal overlay when a CTA is clicked
function LandingPage() {
  const navigate = useNavigate();

  // Auth state is derived from token presence — kept in state so signing in or
  // out updates the page in place. A storage listener keeps other tabs in sync.
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem("token")));

  useEffect(() => {
    function syncAuth() {
      setIsLoggedIn(Boolean(localStorage.getItem("token")));
    }
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  // Called by both auth modals once a token has been stored — close the modal
  // and reflect the logged-in state without leaving the landing page.
  function handleAuthSuccess() {
    setLoginOpen(false);
    setRegisterOpen(false);
    setIsLoggedIn(true);
  }

  function openLogin() {
    setRegisterOpen(false);
    setLoginOpen(true);
  }

  function openRegister() {
    setLoginOpen(false);
    setRegisterOpen(true);
  }

  return (
    <div className="bg-slate-50 font-sans">
      {/* Navigation Header — shared AppHeader shell */}
      <AppHeader showNavLinks={isLoggedIn}>
        {isLoggedIn ? (
          <AccountMenu onLoggedOut={() => setIsLoggedIn(false)} />
        ) : (
          <>
            <button
              onClick={openLogin}
              className="text-sm font-medium text-blue-100 hover:text-white transition-colors cursor-pointer"
            >
              Sign in
            </button>
            <button
              onClick={openRegister}
              className="bg-white text-blue-800 hover:bg-blue-50 text-sm font-semibold
                         px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
            >
              Register
            </button>
          </>
        )}
      </AppHeader>

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

        <div className="w-full px-6 md:px-10 lg:px-16 py-16 md:py-24 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
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
              <button
                onClick={isLoggedIn ? () => navigate("/dashboard") : openRegister}
                className="w-full sm:w-auto bg-white text-blue-800 hover:bg-blue-50 text-base
                           font-semibold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl
                           hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoggedIn ? "Go to Dashboard" : "Register your pet"}
                <ArrowRight size={18} />
              </button>
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
      <section className="py-20 w-full px-6 md:px-10 lg:px-16">
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

      {/* CTA Banner — conversion prompt, only relevant to signed-out visitors */}
      {!isLoggedIn && (
        <section className="bg-slate-900 text-white py-16 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Ready to protect your pet?</h2>
            <p className="text-gray-300 text-base max-w-xl mx-auto">
              It takes less than 2 minutes to create an account and register your pet's first profile.
            </p>
            <button
              onClick={openRegister}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold
                         px-8 py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Get Started for Free
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="w-full px-6 md:px-10 lg:px-16 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2 font-medium text-gray-700">
            <PawPrint size={16} className="text-blue-700" />
            <span>PawBack © {new Date().getFullYear()}</span>
          </div>
          <p className="flex items-center gap-1">
            Built with <Heart size={12} className="text-red-500 fill-red-500 mx-1" /> for pet owners everywhere.
          </p>
        </div>
      </footer>

      {registerOpen && (
        <RegisterModal
          onClose={() => setRegisterOpen(false)}
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={openLogin}
        />
      )}

      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSuccess={handleAuthSuccess}
          onSwitchToRegister={openRegister}
        />
      )}
    </div>
  );
}

export default LandingPage;

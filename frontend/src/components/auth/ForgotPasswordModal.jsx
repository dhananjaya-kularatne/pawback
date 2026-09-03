import { useState } from "react";
import { Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { forgotPassword, verifyOtp, resetPassword } from "../../api/authApi";
import AuthModalShell from "./AuthModalShell";

// Password-reset flow rendered as a modal on the landing page, matching the
// login/register modals. Three steps (request code -> verify code -> set
// password) plus a done state that hands the user back to the sign-in modal.
const TITLES = {
  1: "Reset your password",
  2: "Enter the reset code",
  3: "Choose a new password",
  4: "Password updated",
};

const SUBTITLES = {
  1: "We'll email you a 6-digit code to confirm it's you.",
  2: "Check your inbox for the code we just sent.",
  3: "Pick a strong password you haven't used before.",
  4: "",
};

export default function ForgotPasswordModal({ onClose, onSwitchToLogin }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setError("");
    setNotice("");
  }

  async function handleEmail(e) {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      await forgotPassword(email);
      setNotice(`If ${email} is registered, a 6-digit code is on its way.`);
      setStep(2);
    } catch (err) {
      setError(err.message || "Couldn't send the reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtp(e) {
    e.preventDefault();
    reset();
    if (otp.length !== 6) {
      setError("Enter the full 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      setStep(3);
    } catch (err) {
      setError(err.message || "That code is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    reset();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      setStep(4);
    } catch (err) {
      setError(err.message || "Couldn't reset your password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg " +
    "focus:outline-none focus:ring-2 focus:ring-blue-700 transition-shadow text-gray-900";

  const submitClass =
    "w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 " +
    "text-white text-sm font-semibold py-2.5 px-4 rounded-lg shadow-sm " +
    "transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <AuthModalShell
      onClose={onClose}
      title={TITLES[step]}
      subtitle={SUBTITLES[step]}
      footer={
        step !== 4 && (
          <>
            Remembered it?{" "}
            <button
              type="button"
              onClick={() => onSwitchToLogin()}
              className="text-blue-700 hover:text-blue-800 font-medium underline cursor-pointer"
            >
              Back to sign in
            </button>
          </>
        )
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm font-medium border border-red-200">
          {error}
        </div>
      )}
      {notice && !error && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-800 text-sm font-medium border border-blue-200">
          {notice}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleEmail} className="space-y-4">
          <div>
            <label htmlFor="fp-email" className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={15} />
              </div>
              <input
                id="fp-email"
                type="email"
                required
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className={submitClass}>
            {loading ? "Sending..." : (<>Send reset code <ArrowRight size={15} /></>)}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleOtp} className="space-y-4">
          <div>
            <label htmlFor="fp-otp" className="block text-xs font-medium text-gray-700 mb-1">6-digit code</label>
            <input
              id="fp-otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full px-3 py-2.5 text-center text-lg tracking-[0.4em] border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-700 transition-shadow text-gray-900"
            />
          </div>
          <button type="submit" disabled={loading} className={submitClass}>
            {loading ? "Verifying..." : (<>Verify code <ArrowRight size={15} /></>)}
          </button>
          <button
            type="button"
            onClick={() => { reset(); setStep(1); }}
            className="w-full text-center text-xs text-blue-700 hover:text-blue-800 hover:underline cursor-pointer"
          >
            Use a different email
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label htmlFor="fp-new" className="block text-xs font-medium text-gray-700 mb-1">New password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={15} />
              </div>
              <input
                id="fp-new"
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="fp-confirm" className="block text-xs font-medium text-gray-700 mb-1">Confirm password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={15} />
              </div>
              <input
                id="fp-confirm"
                type="password"
                required
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className={submitClass}>
            {loading ? "Updating..." : (<>Update password <ArrowRight size={15} /></>)}
          </button>
        </form>
      )}

      {step === 4 && (
        <div className="text-center space-y-4 py-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-700">
            <ShieldCheck size={22} />
          </div>
          <p className="text-sm text-gray-600">
            Your password has been updated. You can sign in with it now.
          </p>
          <button type="button" onClick={() => onSwitchToLogin()} className={submitClass}>
            Back to sign in <ArrowRight size={15} />
          </button>
        </div>
      )}
    </AuthModalShell>
  );
}

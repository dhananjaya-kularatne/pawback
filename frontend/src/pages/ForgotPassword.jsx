import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, verifyOtp, resetPassword } from "../api/authApi";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setIsLoading(true);
    try {
      await forgotPassword(email);
      toast.success("If the email exists, a reset code was sent.");
      setStep(2);
    } catch (err) {
      toast.error(err.message || "Failed to request password reset");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("Please enter a 6-digit code");

    setIsLoading(true);
    try {
      await verifyOtp(email, otp);
      toast.success("Code verified! You can now reset your password.");
      setStep(3);
    } catch (err) {
      toast.error(err.message || "Invalid or expired code");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setIsLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      toast.success("Password reset successfully! You can now log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[calc(100vh-64px)] bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Reset Password
        </h2>

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <p className="text-sm text-gray-600 mb-4 text-center">
              Enter your registered email address, and we'll send you a 6-digit
              verification code to reset your password.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
            >
              {isLoading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <p className="text-sm text-gray-600 mb-4 text-center">
              We've sent a 6-digit code to <strong>{email}</strong>. Enter it
              below to verify.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                6-Digit Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center tracking-widest text-lg"
                placeholder="000000"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-blue-600 hover:underline"
              >
                Change email address
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <p className="text-sm text-gray-600 mb-4 text-center">
              Set a strong new password for your account.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Must be at least 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Confirm your new password"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {step === 1 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Remembered your password?{" "}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Log in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

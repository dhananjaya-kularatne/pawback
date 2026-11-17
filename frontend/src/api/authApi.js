import { readApiResponse } from "./readApiResponse";
import { API_BASE_URL } from "./config";

export async function getCurrentProfile(token = sessionStorage.getItem("token")) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  return readApiResponse(response, "Could not verify your account", token);
}

// Registers a new user account with name, email, password, and optional phone
export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return readApiResponse(response, "Failed to register account");
}

// Authenticates a user with email and password
export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  return readApiResponse(response, "Failed to login");
}

// Requests a password reset code to be sent to the user's email
export async function forgotPassword(email) {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  return readApiResponse(response, "Failed to request password reset");
}

// Verifies the 6-digit OTP code sent to the email
export async function verifyOtp(email, otp) {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp }),
  });

  return readApiResponse(response, "Invalid or expired OTP");
}

// Sets a new password using the verified OTP
export async function resetPassword(email, otp, newPassword) {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp, newPassword }),
  });

  return readApiResponse(response, "Failed to reset password");
}

export async function exchangeGoogleCode(code) {
  const response = await fetch(`${API_BASE_URL}/auth/oauth/exchange`, {
    method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }), cache: "no-store",
  });
  return readApiResponse(response, "Google sign-in could not be completed");
}

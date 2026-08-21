const API_BASE_URL = "http://localhost:8080/api";

// Registers a new user account with name, email, password, and optional phone
export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to register account");
  }

  return result.data;
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

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to login");
  }

  return result.data;
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

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to request password reset");
  }

  return result;
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

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Invalid or expired OTP");
  }

  return result;
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

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to reset password");
  }

  return result;
}

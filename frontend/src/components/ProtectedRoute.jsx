import { Navigate } from "react-router-dom";

// Decodes a JWT and returns the payload, or null if it is malformed
function decodeJwtPayload(token) {
  try {
    const base64Payload = token.split(".")[1];
    const decoded = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// Returns true if the token exists and its exp claim is still in the future
function isTokenValid(token) {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return false;
  // exp is in seconds; Date.now() is in milliseconds
  return payload.exp * 1000 > Date.now();
}

// A wrapper for routes that require authentication.
// On every render (including page refresh) it reads the JWT from localStorage,
// validates its expiry, and redirects to /login if the token is missing,
// expired, or malformed — cleaning up stale storage along the way.
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!isTokenValid(token)) {
    // Clear any stale data so the login page starts with a clean slate
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;

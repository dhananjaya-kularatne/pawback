import { Navigate } from "react-router-dom";

// A wrapper for routes that require authentication
// Redirects to the login page if the user is not authenticated
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;

import { Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { isAdmin } from "../utils/auth";

// Route guard for the admin area. First the standard authenticated-token check
// via ProtectedRoute (redirects to the landing page when the token is missing or
// expired), then a role check — a signed-in non-admin is sent to their own
// dashboard rather than the landing page.
function AdminRoute({ children }) {
  return (
    <ProtectedRoute>
      {isAdmin() ? children : <Navigate to="/dashboard" replace />}
    </ProtectedRoute>
  );
}

export default AdminRoute;

import { Navigate } from "react-router-dom";
import { useSession } from "../utils/useSession";
export default function ProtectedRoute({ children }) {
  const { token, expired } = useSession();
  return token ? children : <Navigate to="/" replace state={{ sessionExpired: expired }} />;
}

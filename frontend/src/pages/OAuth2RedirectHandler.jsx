import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/authApi";

export default function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Assuming login or setToken exists in AuthContext

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (token) {
      // Decode the token locally to extract user info (just like we do on normal login)
      try {
        const payloadStr = atob(token.split('.')[1]);
        const payload = JSON.parse(payloadStr);

        const userData = {
          token,
          user: {
            id: payload.userId,
            email: payload.sub,
            role: payload.role?.replace("ROLE_", "")
          }
        };

        // Call the context login method with the parsed user data
        login(userData);
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("Failed to parse OAuth2 token", err);
        navigate("/login?error=invalid_token", { replace: true });
      }
    } else if (error) {
      navigate(`/login?error=${error}`, { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [location, navigate, login]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center">
        <h2 className="text-xl font-semibold mb-2">Authenticating...</h2>
        <p className="text-gray-500">Please wait while we log you in.</p>
      </div>
    </div>
  );
}

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/+$/, "");
export const GOOGLE_LOGIN_URL = `${API_BASE_URL.replace(/\/api$/, "")}/oauth2/authorization/google`;

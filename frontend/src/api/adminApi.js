const API_BASE_URL = "http://localhost:8080/api";

function authHeaders() {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Confirms the caller holds a valid ADMIN token and returns the admin's identity.
// A non-ADMIN token is rejected by the backend @PreAuthorize gate with 403.
export async function getAdminProfile() {
  const response = await fetch(`${API_BASE_URL}/admin/me`, {
    method: "GET",
    headers: authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load the admin area");
  }

  return result.data;
}

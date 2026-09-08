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

// Headline counts for the admin console tiles:
// { totalUsers, activeUsers, disabledUsers, admins }.
export async function getAdminStats() {
  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    method: "GET",
    headers: authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load admin stats");
  }

  return result.data;
}

// Paginated list of every registered user. Returns the backend's PagedResponse
// shape: { content, page, size, totalElements, totalPages, last }.
export async function listUsers(page = 0, size = 20) {
  const response = await fetch(
    `${API_BASE_URL}/admin/users?page=${page}&size=${size}`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load users");
  }

  return result.data;
}

// Enables or disables a user account. The backend rejects an admin disabling
// their own account with a 403, which surfaces here as a thrown Error.
export async function setUserEnabled(userId, enabled) {
  const action = enabled ? "enable" : "disable";
  const response = await fetch(
    `${API_BASE_URL}/admin/users/${userId}/${action}`,
    {
      method: "PATCH",
      headers: authHeaders(),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || `Failed to ${action} user`);
  }

  return result.data;
}

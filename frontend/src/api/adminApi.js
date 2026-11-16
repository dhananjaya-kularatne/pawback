import { readApiResponse, authenticatedFetch as fetch } from "./readApiResponse";
import { API_BASE_URL } from "./config";

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

  return readApiResponse(response, "Failed to load the admin area", true);
}

// Headline counts for the admin console tiles:
// { totalUsers, activeUsers, disabledUsers, admins, totalPets, totalReports, lostPets }.
// `no-store` keeps the browser from serving a cached response, so every page load
// or refresh shows counts computed live by the backend.
export async function getAdminStats() {
  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    method: "GET",
    headers: authHeaders(),
    cache: "no-store",
  });

  return readApiResponse(response, "Failed to load admin stats", true);
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

  return readApiResponse(response, "Failed to load users", true);
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

  return readApiResponse(response, `Failed to ${action} user`, true);
}

// Paginated, filterable list of every scan report platform-wide. `filters` may
// include petId, from, and to (from/to are "YYYY-MM-DD" date strings). Returns
// the backend's PagedResponse shape, with the owning pet's name/uuid folded
// into each row. `no-store` so a refresh always shows current data.
export async function listReports(page = 0, size = 20, filters = {}) {
  const params = new URLSearchParams({ page, size });
  if (filters.petId) params.set("petId", filters.petId);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  const response = await fetch(`${API_BASE_URL}/admin/reports?${params}`, {
    method: "GET",
    headers: authHeaders(),
    cache: "no-store",
  });

  return readApiResponse(response, "Failed to load reports", true);
}

// Permanently deletes a scan report. Reports have no soft-delete flag, so the
// backend removes the row outright; this cannot be undone.
export async function deleteReport(reportId) {
  const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  return readApiResponse(response, "Failed to delete report", true);
}

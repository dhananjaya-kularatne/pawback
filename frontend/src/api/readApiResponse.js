// Preserve validation details while handling non-JSON server/proxy errors safely.
import { clearSession } from "../utils/auth";
const requestTokens = new WeakMap();

export async function authenticatedFetch(url, options = {}) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(url, { ...options, headers: { ...options.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  requestTokens.set(response, token);
  return response;
}

export async function readApiResponse(response, fallbackMessage, authenticated = false) {
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    if (authenticated && response.status === 401) {
      const requestToken = typeof authenticated === "string" ? authenticated : requestTokens.get(response);
      if (requestToken === sessionStorage.getItem("token")) clearSession(true);
      throw new Error("Your session has ended. Please sign in again.");
    }
    const fieldErrors = response.status === 400 && result?.data &&
      typeof result.data === "object" && !Array.isArray(result.data)
      ? Object.values(result.data).filter((value) => typeof value === "string")
      : [];
    const error = new Error(fieldErrors.length
      ? [...new Set(fieldErrors)].join(". ")
      : result?.message || fallbackMessage);
    error.fieldErrors = fieldErrors.length ? result.data : {};
    throw error;
  }
  if (!result || typeof result !== "object" || !("data" in result)) {
    throw new Error(fallbackMessage);
  }
  return result.data;
}

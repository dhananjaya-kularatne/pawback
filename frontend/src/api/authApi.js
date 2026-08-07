const API_BASE_URL = "http://localhost:8080/api";

// Registers a new user account with name, email, password, and optional phone
export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to register account");
  }

  return result.data;
}

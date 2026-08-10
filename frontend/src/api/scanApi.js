const API_BASE_URL = "http://localhost:8080/api";

// Fetches public-safe info for a pet by its QR UUID — no auth required
export async function getPetByUuid(petUuid) {
  const response = await fetch(`${API_BASE_URL}/scan/${petUuid}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Pet not found");
  }

  return result.data;
}
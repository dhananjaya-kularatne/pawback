import { readApiResponse } from "./readApiResponse";

const API_BASE_URL = "http://localhost:8080/api";

function authHeaders() {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function createPet(petData, imageFile, requestKey) {
  const formData = new FormData();

  const petBlob = new Blob([JSON.stringify(petData)], {
    type: "application/json",
  });
  formData.append("pet", petBlob);
  formData.append("image", imageFile);

  const response = await fetch(`${API_BASE_URL}/pets`, {
    method: "POST",
    headers: { ...authHeaders(), ...(requestKey ? { "Idempotency-Key": requestKey } : {}) },
    body: formData,
  });

  return readApiResponse(response, "Failed to register pet");
}

// Fetches all pets belonging to the logged-in owner
export async function getMyPets() {
  const response = await fetch(`${API_BASE_URL}/pets`, {
    method: "GET",
    headers: authHeaders(),
  });

  return readApiResponse(response, "Failed to fetch pets");
}

// Fetches a single pet by id
export async function getPetById(petId) {
  const response = await fetch(`${API_BASE_URL}/pets/${petId}`, {
    headers: authHeaders(),
  });
  return readApiResponse(response, "Failed to fetch pet");
}

// Updates an existing pet, with an optional new photo
export async function updatePet(petId, petData, imageFile) {
  const formData = new FormData();

  const petBlob = new Blob([JSON.stringify(petData)], {
    type: "application/json",
  });
  formData.append("pet", petBlob);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await fetch(`${API_BASE_URL}/pets/${petId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

  return readApiResponse(response, "Failed to update pet");
}

// Private, paginated finder reports for a pet belonging to the signed-in owner.
export async function getPetReports(petId, page = 0, size = 20, signal) {
  const response = await fetch(
    `${API_BASE_URL}/pets/${petId}/reports?page=${page}&size=${size}`,
    { headers: authHeaders(), cache: "no-store", signal }
  );
  return readApiResponse(response, "Failed to load reports");
}

// Toggles a pet's status between SAFE and LOST
export async function updatePetStatus(petId, status) {
  const response = await fetch(`${API_BASE_URL}/pets/${petId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ status }),
  });

  return readApiResponse(response, "Failed to update pet status");
}

export async function deletePet(petId) {
  const response = await fetch(`${API_BASE_URL}/pets/${petId}`, { method: "DELETE", headers: authHeaders() });
  return readApiResponse(response, "Failed to remove pet");
}

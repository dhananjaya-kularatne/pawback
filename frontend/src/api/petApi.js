const API_BASE_URL = "http://localhost:8080/api";

export async function createPet(petData, imageFile) {
  const formData = new FormData();

  const petBlob = new Blob([JSON.stringify(petData)], {
    type: "application/json",
  });
  formData.append("pet", petBlob);
  formData.append("image", imageFile);

  const response = await fetch(`${API_BASE_URL}/pets`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to register pet");
  }

  return result.data;
}

// Fetches all pets belonging to the logged-in owner
export async function getMyPets() {
  const response = await fetch(`${API_BASE_URL}/pets`, {
    method: "GET",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch pets");
  }

  return result.data;
}

// Fetches a single pet by id
export async function getPetById(petId) {
  const response = await fetch(`${API_BASE_URL}/pets/${petId}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch pet");
  }

  return result.data;
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
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update pet");
  }

  return result.data;
}
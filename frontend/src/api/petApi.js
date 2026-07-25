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
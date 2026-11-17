import { readApiResponse } from "./readApiResponse";

const API_BASE_URL = "http://localhost:8080/api";

// Fetches public-safe info for a pet by its QR UUID — no auth required
export async function getPetByUuid(petUuid) {
  const response = await fetch(`${API_BASE_URL}/scan/${petUuid}`);
  return readApiResponse(response, "Pet not found");
}

// Submits a finder's report for a Lost pet
export async function submitReport(petUuid, reportData, photoFile) {
  const formData = new FormData();

  const reportBlob = new Blob([JSON.stringify(reportData)], {
    type: "application/json",
  });
  formData.append("report", reportBlob);

  if (photoFile) {
    formData.append("photo", photoFile);
  }

  const response = await fetch(`${API_BASE_URL}/scan/${petUuid}/report`, {
    method: "POST",
    body: formData,
  });

  return readApiResponse(response, "Failed to submit report");
}

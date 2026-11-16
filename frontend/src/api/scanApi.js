import { readApiResponse } from "./readApiResponse";

import { API_BASE_URL } from "./config";

// Fetches public-safe info for a pet by its QR UUID â€” no auth required
export async function getPetByUuid(petUuid) {
  const response = await fetch(`${API_BASE_URL}/scan/${petUuid}`);
  return readApiResponse(response, "Pet not found");
}

// Submits a finder's report for a Lost pet
export async function submitReport(petUuid, reportData, photoFile, requestKey) {
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
    headers: requestKey ? { "Idempotency-Key": requestKey } : {},
    body: formData,
  });

  return readApiResponse(response, "Failed to submit report");
}

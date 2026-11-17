// Preserve validation details while handling non-JSON server/proxy errors safely.
export async function readApiResponse(response, fallbackMessage) {
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const fieldErrors = response.status === 400 && result?.data &&
      typeof result.data === "object" && !Array.isArray(result.data)
      ? Object.values(result.data).filter((value) => typeof value === "string")
      : [];
    throw new Error(fieldErrors.length
      ? [...new Set(fieldErrors)].join(". ")
      : result?.message || fallbackMessage);
  }
  if (!result || typeof result !== "object" || !("data" in result)) {
    throw new Error(fallbackMessage);
  }
  return result.data;
}

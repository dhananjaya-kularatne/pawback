export const PHOTO_ACCEPT = "image/jpeg,image/png";

export async function validatePhoto(file) {
  if (!file?.size) throw new Error("Choose a non-empty photo.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Photo must be 5 MB or smaller.");
  if (!["image/jpeg", "image/png"].includes(file.type)) throw new Error("Choose a JPEG or PNG photo.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (image.naturalWidth > 4096 || image.naturalHeight > 4096 || image.naturalWidth * image.naturalHeight > 16_000_000) {
      throw new Error("Photo must be at most 4096 pixels per side and 16 megapixels.");
    }
  } catch (error) {
    if (error instanceof DOMException) throw new Error("Photo could not be read. Choose an undamaged JPEG or PNG.", { cause: error });
    throw error;
  } finally { URL.revokeObjectURL(url); }
}

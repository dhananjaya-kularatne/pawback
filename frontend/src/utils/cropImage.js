// Canvas-based helper that turns a source image plus a crop selection into a
// File ready for upload. Cropping happens entirely client-side, so the backend
// never sees (or needs to know about) the original, uncropped photo.

// Loads a URL (including an object URL from a <input type="file">) into an
// HTMLImageElement so its pixels can be drawn onto a canvas.
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (err) => reject(err));
    image.crossOrigin = "anonymous";
    image.src = src;
  });
}

// Draws only the selected `croppedAreaPixels` region of `imageSrc` onto a
// same-sized canvas and resolves a File containing that region, encoded as a
// JPEG. `croppedAreaPixels` is the shape react-easy-crop reports from its
// onCropComplete callback: { x, y, width, height } in source pixel units.
export async function getCroppedImageFile(imageSrc, croppedAreaPixels, fileName = "pet-photo.jpg") {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  const context = canvas.getContext("2d");
  context.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("Failed to crop the image"))),
      "image/jpeg",
      0.92
    );
  });

  return new File([blob], fileName, { type: "image/jpeg" });
}

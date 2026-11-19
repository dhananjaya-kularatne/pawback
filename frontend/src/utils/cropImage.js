function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Could not open this photo for cropping.")));
    image.crossOrigin = "anonymous";
    image.src = src;
  });
}

// Convert the percentage selection against the original photo dimensions even
// when the editor is resized between selecting the area and saving it.
export async function getCroppedImageFile(imageSrc, crop, fileName = "pet-photo.jpg") {
  const image = await loadImage(imageSrc);
  const x = Math.min(image.naturalWidth - 1, Math.max(0, Math.round(crop.x * image.naturalWidth / 100)));
  const y = Math.min(image.naturalHeight - 1, Math.max(0, Math.round(crop.y * image.naturalHeight / 100)));
  const right = Math.min(image.naturalWidth, Math.round((crop.x + crop.width) * image.naturalWidth / 100));
  const bottom = Math.min(image.naturalHeight, Math.round((crop.y + crop.height) * image.naturalHeight / 100));

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, right - x);
  canvas.height = Math.max(1, bottom - y);

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare the photo crop.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, x, y, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("Failed to crop the image"))),
      "image/jpeg",
      0.92
    );
  });

  const name = fileName.replace(/\.[^.]+$/, "");
  return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
}

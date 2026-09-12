import { useState } from "react";
import Cropper from "react-easy-crop";
import { ZoomIn } from "lucide-react";
import { getCroppedImageFile } from "../utils/cropImage";

// Fixed 4:5 portrait frame, matching the dashboard card's image area so a
// cropped photo never clips awkwardly against the name/breed/status overlay.
const CROP_ASPECT = 4 / 5;

// Reusable crop step shown after a photo is selected on the Add pet form or
// the edit modal, before the file ever reaches the upload flow. Confirming
// hands the parent a cropped File in place of the original; cancelling (or
// picking a different file) leaves the caller free to redo the crop.
function PhotoCropModal({ imageSrc, fileName, onCancel, onConfirm }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    if (!croppedAreaPixels) return;

    setSaving(true);
    setError("");
    try {
      const croppedFile = await getCroppedImageFile(imageSrc, croppedAreaPixels, fileName);
      onConfirm(croppedFile);
    } catch (err) {
      setError(err.message || "Failed to crop the image");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-gray-900">Adjust photo</h2>
        <p className="text-sm text-gray-600 mt-1">
          Drag to reposition, use the slider to zoom. The framed area is what shows on the pet's card.
        </p>

        <div className="relative w-full h-72 sm:h-96 mt-4 bg-gray-900 rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={CROP_ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
          />
        </div>

        <div className="flex items-center gap-3 mt-4">
          <ZoomIn size={16} className="text-gray-500 shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-blue-700 cursor-pointer"
            aria-label="Zoom"
          />
        </div>

        {error && <p className="text-sm text-red-700 mt-3">{error}</p>}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            disabled={saving}
            className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200
                       text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving || !croppedAreaPixels}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800
                       text-white transition-colors cursor-pointer
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Cropping..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PhotoCropModal;

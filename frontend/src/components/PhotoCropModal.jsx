import { useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Crop, X } from "lucide-react";
import Modal from "./Modal";
import { getCroppedImageFile } from "../utils/cropImage";
import { validatePhoto } from "../utils/validatePhoto";

const INITIAL_CROP = { unit: "%", x: 8, y: 8, width: 84, height: 84 };

export default function PhotoCropModal({ imageSrc, originalFile, fileName, onCancel, onConfirm }) {
  const [crop, setCrop] = useState();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function applyCrop() {
    if (!crop?.width || !crop.height) return;

    setSaving(true);
    setError("");
    try {
      const croppedFile = await getCroppedImageFile(imageSrc, crop, fileName);
      await validatePhoto(croppedFile);
      onConfirm(croppedFile);
    } catch (err) {
      setError(err.message || "Could not crop this photo. Try a different selection.");
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onCancel} busy={saving} titleId="crop-title" className="max-w-2xl">
      <div className="dialog-header">
        <h2 id="crop-title">Adjust photo</h2>
        <button type="button" onClick={onCancel} disabled={saving} aria-label="Close photo crop" className="icon-button">
          <X size={20} />
        </button>
      </div>
      <div className="p-4 sm:p-6">
        <p className="text-sm text-gray-600">Move the crop box to frame your pet. Drag its edges or corners to resize it.</p>
        <div className="crop-stage mt-4">
          <ReactCrop crop={crop} onChange={(_, percent) => setCrop(percent)} disabled={saving} keepSelection ruleOfThirds>
            <img src={imageSrc} alt="Photo to crop" onLoad={({ currentTarget }) => {
              const { naturalWidth, naturalHeight } = currentTarget;
              const cardHeight = 115 * naturalWidth / naturalHeight;
              setCrop(cardHeight < 100
                ? { unit: "%", x: 0, y: 0, width: 100, height: cardHeight }
                : INITIAL_CROP);
            }}
              onError={() => setError("Could not open this photo. Choose a different image.")} />
          </ReactCrop>
        </div>
        {error && <p role="alert" className="notice-error text-sm mt-4">{error}</p>}
        <div className="crop-actions mt-5">
          <button type="button" onClick={onCancel} disabled={saving} className="button-quiet">Cancel</button>
          {originalFile && (
            <button type="button" onClick={() => onConfirm(originalFile)} disabled={saving} className="button-secondary">
              Keep full photo
            </button>
          )}
          <button type="button" onClick={applyCrop} disabled={saving || !crop?.width || !crop.height} className="button-primary">
            <Crop size={18} /> {saving ? "Cropping..." : "Apply crop"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

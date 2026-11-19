import { Camera, Crop } from "lucide-react";
import { PHOTO_ACCEPT } from "../utils/validatePhoto";

export default function PetPhotoField({ previewUrl, alt, required = false, disabled, onChange, onCrop }) {
  return (
    <div className="pet-photo-field">
      <p className="text-sm font-semibold">Photo {required && <span className="text-red-700">*</span>}</p>
      {previewUrl && <img src={previewUrl} alt={alt} className="pet-photo-field-preview pet-photo" />}
      <label className="button-secondary button-small finder-photo w-full mt-2">
        <Camera size={17} /> {previewUrl ? "Change photo" : "Upload photo"}
        <input type="file" accept={PHOTO_ACCEPT} aria-label="Pet photo" className="sr-only" disabled={disabled} onChange={onChange} />
      </label>
      {previewUrl && (
        <button type="button" className="button-quiet button-small w-full mt-1" onClick={onCrop} disabled={disabled}>
          <Crop size={17} /> Adjust crop
        </button>
      )}
    </div>
  );
}

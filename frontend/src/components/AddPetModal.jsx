import Modal from "./Modal";
import { useObjectUrls } from "../utils/useObjectUrls";
import { useRef, useState } from "react";
import { validatePhoto } from "../utils/validatePhoto";
import { X } from "lucide-react";
import PhotoCropModal from "./PhotoCropModal";
import PetPhotoField from "./PetPhotoField";

function AddPetModal({ onClose, onSave }) {
  const { createObjectUrl, revokeObjectUrl } = useObjectUrls();
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [description, setDescription] = useState("");
  const [ifFoundInstructions, setIfFoundInstructions] = useState("");
  const [image, setImage] = useState(null);
  // Object URL for the cropped image, so the chosen photo shows in the frame
  // instead of just its file name
  const [previewUrl, setPreviewUrl] = useState(null);
  // Name to reuse if the currently shown preview is re-cropped without
  // picking a different file
  const [photoFileName, setPhotoFileName] = useState();
  // The photo staged for cropping: either a just-picked file, or the preview
  // already shown, reopened via "Adjust crop"
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const requestKey = useRef(null);

  async function handleFileSelected(e) {
    const file = e.target.files[0];
    // Reset so picking the same file again still fires a change event, letting
    // the owner redo the crop on a re-selected file
    e.target.value = "";
    if (!file) return;
    setError("");
    try { await validatePhoto(file); } catch (err) { setError(err.message); return; }
    const src = createObjectUrl(file);
    if (src) setPendingPhoto({ src, name: file.name });
  }

  function handleAdjustCrop() {
    setPendingPhoto({ src: previewUrl, name: photoFileName });
  }

  function handleCropCancel() {
    // Don't revoke a URL that's still the one on screen (true when re-cropping
    // the already-shown preview rather than a freshly picked file)
    if (pendingPhoto.src !== previewUrl) revokeObjectUrl(pendingPhoto.src);
    setPendingPhoto(null);
  }

  function handleCropConfirm(croppedFile) {
    if (pendingPhoto.src !== previewUrl) revokeObjectUrl(pendingPhoto.src);
    if (previewUrl) revokeObjectUrl(previewUrl);

    setPendingPhoto(null);
    setImage(croppedFile);
    setPreviewUrl(createObjectUrl(croppedFile));
    setPhotoFileName(pendingPhoto.name);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!image) {
      setError("Image is required");
      return;
    }

    setSaving(true);
    try {
      requestKey.current ??= crypto.randomUUID();
      await onSave({ name, breed, description, ifFoundInstructions }, image, requestKey.current);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} busy={saving || Boolean(pendingPhoto)} titleId="add-pet-title" className="max-w-2xl">
      <div className="dialog-header">
        <h2 id="add-pet-title" className="text-base font-medium text-gray-900">Register a pet</h2>
        <button
          onClick={onClose}
          disabled={saving}
          aria-label="Close pet form"
          className="icon-button disabled:opacity-50"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-5 p-5 sm:p-7">
        <PetPhotoField
          previewUrl={previewUrl} alt="Selected pet" required disabled={saving || Boolean(pendingPhoto)}
          onChange={handleFileSelected} onCrop={handleAdjustCrop}
        />

        {/* Right: details */}
        <div className="space-y-3">
          <div>
            <label htmlFor="add-pet-name" className="text-sm text-gray-600">
              Name <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              id="add-pet-name"
              value={name}
              required
              maxLength={100}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1
                         focus:outline-none focus:ring-2 focus:ring-blue-700 transition-shadow"
            />
          </div>

          <div>
            <label htmlFor="add-pet-breed" className="text-sm text-gray-600">
              Breed <span className="field-optional">Optional</span>
            </label>
            <input
              type="text"
              id="add-pet-breed"
              value={breed}
              maxLength={100}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1
                         focus:outline-none focus:ring-2 focus:ring-blue-700 transition-shadow"
            />
          </div>

          <div>
            <label htmlFor="add-pet-description" className="text-sm text-gray-600">
              Description <span className="field-optional">Optional</span>
            </label>
            <textarea
              id="add-pet-description"
              value={description}
              maxLength={255}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1
                         focus:outline-none focus:ring-2 focus:ring-blue-700 transition-shadow"
            />
          </div>

          <div>
            <label htmlFor="add-pet-ifFoundInstructions" className="text-sm text-gray-600">
              If found instructions <span className="field-optional">Optional</span>
            </label>
            <textarea
              id="add-pet-ifFoundInstructions"
              value={ifFoundInstructions}
              maxLength={255}
              onChange={(e) => setIfFoundInstructions(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1
                         focus:outline-none focus:ring-2 focus:ring-blue-700 transition-shadow"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          {error && <p role="alert" className="notice-error text-sm mb-3">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="button-primary w-full"
          >
            {saving ? "Registering..." : "Register pet"}
          </button>

          <p className="field-help text-center">
            New pet profiles are marked safe.
          </p>
        </div>
      </form>

      {pendingPhoto && (
        <PhotoCropModal
          imageSrc={pendingPhoto.src}
          fileName={pendingPhoto.name}
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
        />
      )}
    </Modal>
  );
}

export default AddPetModal;

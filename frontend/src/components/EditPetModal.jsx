import Modal from "./Modal";
import { useObjectUrls } from "../utils/useObjectUrls";
import { useState } from "react";
import { X } from "lucide-react";
import PhotoCropModal from "./PhotoCropModal";
import PetPhotoField from "./PetPhotoField";
import { validatePhoto } from "../utils/validatePhoto";

function EditPetModal({ pet, onClose, onSave }) {
  const { createObjectUrl, revokeObjectUrl } = useObjectUrls();
  const [name, setName] = useState(pet.name);
  const [breed, setBreed] = useState(pet.breed || "");
  const [description, setDescription] = useState(pet.description || "");
  const [ifFoundInstructions, setIfFoundInstructions] = useState(
    pet.ifFoundInstructions || ""
  );
  const [image, setImage] = useState(null);
  // Defaults to the pet's current photo; becomes an object URL once a new
  // photo is cropped, so the frame always shows what will actually be saved
  const [previewUrl, setPreviewUrl] = useState(pet.photoUrl || null);
  // The photo staged for cropping: either a just-picked file, or the photo
  // already shown, reopened via "Adjust crop"
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleFileSelected(e) {
    const file = e.target.files[0];
    // Reset so picking the same file again still fires a change event, letting
    // the owner redo the crop on a re-selected file
    e.target.value = "";
    if (!file) return;
    setError("");
    try { await validatePhoto(file); } catch (err) { setError(err.message); return; }
    const src = createObjectUrl(file);
    if (src) setPendingPhoto({ src, file });
  }

  function handleAdjustCrop() {
    setPendingPhoto({ src: previewUrl });
  }

  function handleCropCancel() {
    // Don't revoke a URL that's still the one on screen (true when re-cropping
    // the already-shown photo rather than a freshly picked file)
    if (pendingPhoto.src !== previewUrl) revokeObjectUrl(pendingPhoto.src);
    setPendingPhoto(null);
  }

  function handleCropConfirm(croppedFile) {
    if (pendingPhoto.src !== previewUrl) revokeObjectUrl(pendingPhoto.src);

    // Only revoke the previous preview if it was itself a local object URL,
    // not the pet's original (remote) photoUrl
    if (previewUrl && previewUrl !== pet.photoUrl) revokeObjectUrl(previewUrl);

    setPendingPhoto(null);
    setImage(croppedFile);
    setPreviewUrl(createObjectUrl(croppedFile));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    try {
      await onSave({ name, breed, description, ifFoundInstructions }, image);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} busy={saving || Boolean(pendingPhoto)} titleId="edit-pet-title" className="max-w-2xl">
      <div className="dialog-header">
        <h2 id="edit-pet-title" className="text-base font-medium text-gray-900">Edit pet</h2>
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
          previewUrl={previewUrl} alt={pet.name} disabled={saving || Boolean(pendingPhoto)}
          onChange={handleFileSelected} onCrop={handleAdjustCrop}
        />

        {/* Right: details */}
        <div className="space-y-3">
          <div>
            <label htmlFor="edit-pet-name" className="text-sm text-gray-600">Name <span className="text-red-700">*</span></label>
            <input
              type="text"
              id="edit-pet-name"
              value={name}
              required
              maxLength={100}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1
                         focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent
                         transition-shadow"
            />
          </div>
          <div>
            <label htmlFor="edit-pet-breed" className="text-sm text-gray-600">Breed <span className="field-optional">Optional</span></label>
            <input
              type="text"
              id="edit-pet-breed"
              value={breed}
              maxLength={100}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1
                         focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent
                         transition-shadow"
            />
          </div>
          <div>
            <label htmlFor="edit-pet-description" className="text-sm text-gray-600">Description <span className="field-optional">Optional</span></label>
            <textarea
              id="edit-pet-description"
              value={description}
              maxLength={255}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1
                         focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent
                         transition-shadow"
            />
          </div>
          <div>
            <label htmlFor="edit-pet-ifFoundInstructions" className="text-sm text-gray-600">If found instructions <span className="field-optional">Optional</span></label>
            <textarea
              id="edit-pet-ifFoundInstructions"
              value={ifFoundInstructions}
              maxLength={255}
              onChange={(e) => setIfFoundInstructions(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1
                         focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent
                         transition-shadow"
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
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>

      {pendingPhoto && (
        <PhotoCropModal
          imageSrc={pendingPhoto.src}
          originalFile={pendingPhoto.file}
          fileName={pendingPhoto.file?.name ?? image?.name}
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
        />
      )}
    </Modal>
  );
}

export default EditPetModal;

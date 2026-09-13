import { useState } from "react";
import { X, Camera, Crop } from "lucide-react";
import PhotoCropModal from "./PhotoCropModal";

function AddPetModal({ onClose, onSave }) {
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

  function handleFileSelected(e) {
    const file = e.target.files[0];
    // Reset so picking the same file again still fires a change event, letting
    // the owner redo the crop on a re-selected file
    e.target.value = "";
    if (!file) return;

    setPendingPhoto({ src: URL.createObjectURL(file), name: file.name });
  }

  function handleAdjustCrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setPendingPhoto({ src: previewUrl, name: photoFileName });
  }

  function handleCropCancel() {
    // Don't revoke a URL that's still the one on screen (true when re-cropping
    // the already-shown preview rather than a freshly picked file)
    if (pendingPhoto.src !== previewUrl) URL.revokeObjectURL(pendingPhoto.src);
    setPendingPhoto(null);
  }

  function handleCropConfirm(croppedFile) {
    if (pendingPhoto.src !== previewUrl) URL.revokeObjectURL(pendingPhoto.src);
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setPendingPhoto(null);
    setImage(croppedFile);
    setPreviewUrl(URL.createObjectURL(croppedFile));
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
      await onSave({ name, breed, description, ifFoundInstructions }, image);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-medium text-gray-900">Register a pet</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100
                       p-1 rounded-md cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-5">
          {/* Left: photo */}
          <div>
            <label className="text-sm text-gray-600">
              Image <span className="text-red-700">*</span>
            </label>
            <label
              className="relative mt-1 flex flex-col items-center justify-center gap-1.5
                         aspect-[4/5] w-full max-w-[200px] mx-auto sm:max-w-none rounded-lg border
                         border-gray-300 border-dashed text-gray-500 cursor-pointer overflow-hidden
                         hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Selected pet"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleAdjustCrop}
                    className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center
                               rounded-full bg-white/90 hover:bg-white text-gray-700 cursor-pointer
                               transition-colors shadow-sm"
                    aria-label="Adjust crop"
                    title="Adjust crop"
                  >
                    <Crop size={14} />
                  </button>
                  <div
                    className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-xs
                               font-medium text-center py-1.5"
                  >
                    Change photo
                  </div>
                </>
              ) : (
                <>
                  <Camera size={20} />
                  <span className="text-xs px-2 text-center">Upload photo</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelected}
              />
            </label>
          </div>

          {/* Right: details */}
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">
                Name <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1
                           focus:outline-none focus:ring-2 focus:ring-blue-700 transition-shadow"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Breed <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1
                           focus:outline-none focus:ring-2 focus:ring-blue-700 transition-shadow"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Description <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1
                           focus:outline-none focus:ring-2 focus:ring-blue-700 transition-shadow"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                If found instructions <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={ifFoundInstructions}
                onChange={(e) => setIfFoundInstructions(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1
                           focus:outline-none focus:ring-2 focus:ring-blue-700 transition-shadow"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            {error && <p className="text-sm text-red-700 mb-3">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium
                         py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                         cursor-pointer transition-colors shadow-sm hover:shadow"
            >
              {saving ? "Registering..." : "Register pet"}
            </button>

            <p className="text-xs text-gray-400 text-center mt-2">
              By default this pet will be shown as Safe
            </p>
          </div>
        </form>
      </div>

      {pendingPhoto && (
        <PhotoCropModal
          imageSrc={pendingPhoto.src}
          fileName={pendingPhoto.name}
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  );
}

export default AddPetModal;

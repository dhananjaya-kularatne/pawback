import { useState } from "react";
import { X, Camera } from "lucide-react";
import PhotoCropModal from "./PhotoCropModal";

function EditPetModal({ pet, onClose, onSave }) {
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
  // The just-selected file, staged as an object URL until the crop is confirmed
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

  function handleCropCancel() {
    URL.revokeObjectURL(pendingPhoto.src);
    setPendingPhoto(null);
  }

  function handleCropConfirm(croppedFile) {
    URL.revokeObjectURL(pendingPhoto.src);
    setPendingPhoto(null);

    // Only revoke the previous preview if it was itself a local object URL,
    // not the pet's original (remote) photoUrl
    if (previewUrl && previewUrl !== pet.photoUrl) URL.revokeObjectURL(previewUrl);
    setImage(croppedFile);
    setPreviewUrl(URL.createObjectURL(croppedFile));
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-medium text-gray-900">Edit pet</h2>
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
            <label className="text-sm text-gray-600">Photo</label>
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
                    alt={pet.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
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
              <label className="text-sm text-gray-600">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1
                           focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent
                           transition-shadow"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Breed</label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1
                           focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent
                           transition-shadow"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1
                           focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent
                           transition-shadow"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">If found instructions</label>
              <textarea
                value={ifFoundInstructions}
                onChange={(e) => setIfFoundInstructions(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1
                           focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent
                           transition-shadow"
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
              {saving ? "Saving..." : "Save changes"}
            </button>
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

export default EditPetModal;

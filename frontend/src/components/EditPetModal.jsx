import { useState } from "react";
import { X, Camera } from "lucide-react";

function EditPetModal({ pet, onClose, onSave }) {
  const [name, setName] = useState(pet.name);
  const [breed, setBreed] = useState(pet.breed || "");
  const [description, setDescription] = useState(pet.description || "");
  const [ifFoundInstructions, setIfFoundInstructions] = useState(
    pet.ifFoundInstructions || ""
  );
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
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

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Photo</label>
            <label
              className="mt-1 flex items-center justify-center gap-2 border border-gray-300
                         rounded-lg px-3 py-2 text-sm text-gray-600 cursor-pointer
                         hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              <Camera size={16} />
              {image ? image.name : "Change photo (optional)"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </label>
          </div>

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

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium
                       py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                       cursor-pointer transition-colors shadow-sm hover:shadow"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditPetModal;
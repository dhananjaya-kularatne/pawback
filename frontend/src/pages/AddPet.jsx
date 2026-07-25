import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import { createPet } from "../api/petApi";

function AddPet() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [description, setDescription] = useState("");
  const [ifFoundInstructions, setIfFoundInstructions] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      await createPet(
        { name, breed, description, ifFoundInstructions },
        image
      );
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
        <h1 className="text-lg font-medium text-gray-900 mb-4">
          Register a pet
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">
              Name <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1
                         focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Image <span className="text-red-700">*</span>
            </label>
            <label
              className="mt-1 flex items-center justify-center gap-2 border border-gray-300
                         rounded-lg px-3 py-2 text-sm text-gray-600 cursor-pointer hover:bg-gray-50"
            >
              <Camera size={16} />
              {image ? image.name : "Upload photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </label>
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
                         focus:outline-none focus:ring-2 focus:ring-blue-700"
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
                         focus:outline-none focus:ring-2 focus:ring-blue-700"
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
                         focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>

          {error && (
            <p className="text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white text-sm
                       font-medium px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register pet"}
          </button>

          <p className="text-xs text-gray-400 text-center">
            By default this pet will be shown as Safe
          </p>
        </form>
      </div>
    </div>
  );
}

export default AddPet;
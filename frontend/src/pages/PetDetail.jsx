import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import Navbar from "../components/Navbar";
import { getPetById, updatePet } from "../api/petApi";
import EditPetModal from "../components/EditPetModal";

// Pet detail page with an edit modal for updating the pet's info
function PetDetail() {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchPet() {
      try {
        const data = await getPetById(id);
        setPet(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPet();
  }, [id]);

  async function handleSave(updatedFields, imageFile) {
    const updated = await updatePet(id, updatedFields, imageFile);
    setPet(updated);
    setModalOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {loading && <p className="text-sm text-gray-600 p-6">Loading...</p>}
      {error && <p className="text-sm text-red-700 p-6">{error}</p>}

      {pet && (
        <div className="max-w-md mx-auto p-6">
          <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
            <img
              src={pet.photoUrl}
              alt={pet.name}
              className="w-full h-56 object-cover rounded-lg mb-4"
            />

            <div className="flex items-center justify-between mb-1">
              <h1 className="text-lg font-medium text-gray-900">{pet.name}</h1>
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1 text-sm text-blue-700
                           hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md
                           cursor-pointer transition-colors"
              >
                <Pencil size={14} />
                Edit
              </button>
            </div>

            {pet.breed && <p className="text-sm text-gray-600 mb-2">{pet.breed}</p>}
            {pet.description && (
              <p className="text-sm text-gray-600 mb-2">{pet.description}</p>
            )}
            {pet.ifFoundInstructions && (
              <p className="text-xs text-gray-500 italic mb-3">
                If found: {pet.ifFoundInstructions}
              </p>
            )}

            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                pet.status === "SAFE"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {pet.status === "SAFE" ? "Safe" : "Lost"}
            </span>
          </div>
        </div>
      )}

      {modalOpen && pet && (
        <EditPetModal
          pet={pet}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default PetDetail;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";
import Navbar from "../components/Navbar";
import { getMyPets, updatePet } from "../api/petApi";
import EditPetModal from "../components/EditPetModal";

// Owner's dashboard — lists all registered pets, with inline editing
function Dashboard() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPet, setEditingPet] = useState(null);

  // Load the owner's pets once, when the dashboard first renders
  useEffect(() => {
    async function fetchPets() {
      try {
        const data = await getMyPets();
        setPets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPets();
  }, []);

  // Saves the edited pet and updates it in place in the local list —
  // no full page reload or re-fetch needed
  async function handleSave(updatedFields, imageFile) {
    const updated = await updatePet(editingPet.id, updatedFields, imageFile);
    setPets((prev) =>
      prev.map((pet) => (pet.id === updated.id ? updated : pet))
    );
    setEditingPet(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-medium text-gray-900">My pets</h1>
          <Link
            to="/pets/new"
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800
                       text-white text-sm font-medium px-4 py-2 rounded-lg
                       shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus size={16} />
            Add pet
          </Link>
        </div>

        {loading && <p className="text-sm text-gray-600">Loading...</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}

        {!loading && !error && pets.length === 0 && (
          <div className="border border-dashed border-gray-400 rounded-xl p-10 text-center">
            <p className="text-sm text-gray-600 mb-3">
              You haven't registered any pets yet.
            </p>
            <Link
              to="/pets/new"
              className="inline-block bg-blue-700 hover:bg-blue-800 text-white text-sm
                         font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Register pet
            </Link>
          </div>
        )}

        {!loading && !error && pets.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="bg-white border border-gray-200 rounded-xl p-4
                           shadow-sm hover:shadow-md hover:-translate-y-0.5
                           transition-all duration-200"
              >
                <div className="relative overflow-hidden rounded-lg mb-3">
                  <img
                    src={pet.photoUrl}
                    alt={pet.name}
                    className="w-full h-48 object-cover transition-transform
                               duration-300 hover:scale-105"
                  />
                </div>

                <div className="flex items-start justify-between mb-1">
                  <p className="text-base font-medium text-gray-900">{pet.name}</p>
                  <button
                    onClick={() => setEditingPet(pet)}
                    className="flex items-center gap-1 text-xs font-medium text-blue-700
                               hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md
                               cursor-pointer transition-colors shrink-0"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                </div>

                {pet.breed && (
                  <p className="text-sm text-gray-600 mb-1">{pet.breed}</p>
                )}

                {pet.description && (
                  <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                    {pet.description}
                  </p>
                )}

                {pet.ifFoundInstructions && (
                  <p className="text-xs text-gray-500 italic mb-2">
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
            ))}
          </div>
        )}
      </div>

      {editingPet && (
        <EditPetModal
          pet={editingPet}
          onClose={() => setEditingPet(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default Dashboard;
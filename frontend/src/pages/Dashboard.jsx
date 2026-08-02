import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import Navbar from "../components/Navbar";
import { getMyPets, updatePet, createPet } from "../api/petApi";
import EditPetModal from "../components/EditPetModal";
import AddPetModal from "../components/AddPetModal";

// Owner's dashboard — lists all registered pets, with inline add/edit
function Dashboard() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPet, setEditingPet] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

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

  // Saves an edited pet in place in the local list — no reload needed
  async function handleSave(updatedFields, imageFile) {
    const updated = await updatePet(editingPet.id, updatedFields, imageFile);
    setPets((prev) =>
      prev.map((pet) => (pet.id === updated.id ? updated : pet))
    );
    setEditingPet(null);
  }

  // Adds a newly created pet straight into the local list — no reload needed
  async function handleAddPet(petData, imageFile) {
    const newPet = await createPet(petData, imageFile);
    setPets((prev) => [...prev, newPet]);
    setAddModalOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar + welcome banner share one continuous blue background */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="paw-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#paw-pattern)" />
          </svg>
        </div>

        <div className="relative">
          <Navbar />
          <div className="max-w-5xl mx-auto px-6 pb-10">
            <h1 className="text-2xl font-semibold text-white mb-1">
              Welcome back, Dhananjaya
            </h1>
            <p className="text-blue-100 text-sm">
              Keep your pets' profiles up to date so they can always find their way home.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">My pets</h2>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800
                       text-white text-sm font-medium px-4 py-2 rounded-lg
                       shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus size={16} />
            Add pet
          </button>
        </div>

        {loading && <p className="text-sm text-gray-600">Loading...</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}

        {!loading && !error && pets.length === 0 && (
          <div className="border border-dashed border-gray-400 rounded-xl p-10 text-center">
            <p className="text-sm text-gray-600 mb-3">
              You haven't registered any pets yet.
            </p>
            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-block bg-blue-700 hover:bg-blue-800 text-white text-sm
                         font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Register pet
            </button>
          </div>
        )}

        {!loading && !error && pets.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg
                          hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={pet.photoUrl}
                    alt={pet.name}
                    className="w-full h-full object-cover transition-transform
                              duration-500 group-hover:scale-110"
                  />
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />

                  {/* Status badge, top-left, on the image */}
                  <span
                    className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${
                      pet.status === "SAFE"
                        ? "bg-green-500/90 text-white"
                        : "bg-red-500/90 text-white"
                    }`}
                  >
                    {pet.status === "SAFE" ? "Safe" : "Lost"}
                  </span>

                  {/* Edit button, top-right, on the image */}
                  <button
                    onClick={() => setEditingPet(pet)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center
                              bg-white/90 hover:bg-white rounded-full cursor-pointer
                              transition-colors shadow-sm"
                    aria-label="Edit pet"
                  >
                    <Pencil size={14} className="text-gray-700" />
                  </button>

                  {/* Name overlaid at the bottom of the image */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-semibold text-lg drop-shadow-sm">
                      {pet.name}
                    </p>
                    {pet.breed && (
                      <p className="text-white/90 text-xs">{pet.breed}</p>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  {pet.description && (
                    <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                      {pet.description}
                    </p>
                  )}
                  {pet.ifFoundInstructions && (
                    <p className="text-xs text-gray-500 italic">
                      If found: {pet.ifFoundInstructions}
                    </p>
                  )}
                  {!pet.description && !pet.ifFoundInstructions && (
                    <p className="text-xs text-gray-400">No additional details</p>
                  )}
                </div>
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

      {addModalOpen && (
        <AddPetModal
          onClose={() => setAddModalOpen(false)}
          onSave={handleAddPet}
        />
      )}
    </div>
  );
}

export default Dashboard;
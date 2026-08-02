import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import Navbar from "../components/Navbar";
import { getPetById, updatePet } from "../api/petApi";

// Pet detail page — shows full info and links to the edit modal
function PetDetail() {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <p className="text-sm text-gray-600 p-6">Loading...</p>;
  if (error) return <p className="text-sm text-red-700 p-6">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-md mx-auto p-6">
        <div className="bg-white border border-gray-300 rounded-xl p-6">
          <img
            src={pet.photoUrl}
            alt={pet.name}
            className="w-full h-56 object-cover rounded-lg mb-4"
          />

          <div className="flex items-center justify-between mb-1">
            <h1 className="text-lg font-medium text-gray-900">{pet.name}</h1>
            <button className="flex items-center gap-1 text-sm text-blue-700 hover:underline">
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
    </div>
  );
}

export default PetDetail;
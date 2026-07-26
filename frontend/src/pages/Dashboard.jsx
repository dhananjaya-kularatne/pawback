import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import Navbar from "../components/Navbar";
import { getMyPets } from "../api/petApi";

// Owner's dashboard — lists all registered pets, or an empty state if none exist
function Dashboard() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-medium text-gray-900">My pets</h1>
          <Link
            to="/pets/new"
            className="flex items-center gap-1 border border-gray-300 text-sm text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100"
          >
            <Plus size={14} />
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
              className="inline-block bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              Register pet
            </Link>
          </div>
        )}

        {!loading && !error && pets.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="bg-white border border-gray-300 rounded-xl p-3"
              >
                <img
                  src={pet.photoUrl}
                  alt={pet.name}
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
                <p className="text-sm font-medium text-gray-900">{pet.name}</p>
                <p className="text-xs text-gray-600 mb-1">{pet.breed}</p>
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
    </div>
  );
}

export default Dashboard;
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PawPrint, Heart } from "lucide-react";
import { getPetByUuid } from "../api/scanApi";

// Public page a finder lands on after scanning a pet's QR code.
// No login required. Branches on the pet's status
function ScanPage() {
  const { petUuid } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPet() {
      try {
        const data = await getPetByUuid(petUuid);
        setPet(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPet();
  }, [petUuid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white">
            <PawPrint size={22} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-center">
          <img
            src={pet.photoUrl}
            alt={pet.name}
            className="w-full h-56 object-cover"
          />

          <div className="p-6">
            <p className="text-lg font-semibold text-gray-900 mb-1">
              {pet.name}
            </p>
            {pet.breed && (
              <p className="text-sm text-gray-500 mb-4">{pet.breed}</p>
            )}

            <div className="flex flex-col items-center gap-2 py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Heart size={22} className="text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                {pet.name} is not currently reported lost
              </p>
              <p className="text-xs text-gray-500">
                Thanks for checking in!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScanPage;
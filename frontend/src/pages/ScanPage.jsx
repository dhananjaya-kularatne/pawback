import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PawPrint, Heart, Camera, MapPin } from "lucide-react";
import { getPetByUuid, submitReport } from "../api/scanApi";

// Public page a finder lands on after scanning a pet's QR code.
// No login required. Branches on the pet's status: Safe shows a calm message, Lost shows the pet's details (conditional fields) plus a
// working report form (message, optional photo, optional location).
function ScanPage() {
  const { petUuid } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [location, setLocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState(null);

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

  // Requests the browser's geolocation — silently does nothing if denied,
  // since location is optional per the AC
  function handleShareLocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        // Permission denied or unavailable — location stays null, form still submittable
      }
    );
  }

  async function handleSubmitReport() {
    setFormError("");

    if (!message.trim()) {
      setFormError("Please enter a message");
      return;
    }

    setSubmitting(true);
    try {
      await submitReport(
        petUuid,
        {
          message,
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null,
        },
        photo
      );
      setSubmitted(true);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

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
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  const isLost = pet.status === "LOST";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white">
            <PawPrint size={22} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <img
            src={pet.photoUrl}
            alt={pet.name}
            className="w-full h-56 object-cover"
          />

          <div className="p-6">
            {isLost && (
              <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                This pet is lost
              </span>
            )}

            <p className="text-lg font-semibold text-gray-900 mb-1">
              {pet.name}
            </p>

            {pet.breed && (
              <p className="text-sm text-gray-500 mb-1">{pet.breed}</p>
            )}

            {pet.description && (
              <p className="text-sm text-gray-600 mb-1">{pet.description}</p>
            )}

            {pet.ifFoundInstructions && (
              <p className="text-xs text-gray-500 italic mb-3">
                If found: {pet.ifFoundInstructions}
              </p>
            )}

            {!isLost && (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Heart size={22} className="text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {pet.name} is not currently reported lost
                </p>
                <p className="text-xs text-gray-500">Thanks for checking in!</p>
              </div>
            )}

            {isLost && !submitted && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <div>
                  <label className="text-sm text-gray-600">
                    Message <span className="text-red-700">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Where did you see this pet?"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1
                               focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow"
                  />
                </div>

                <label
                  className="flex items-center justify-center gap-2 border border-gray-300
                             rounded-lg px-3 py-2 text-sm text-gray-600 cursor-pointer
                             hover:bg-gray-50 transition-colors"
                >
                  <Camera size={16} />
                  {photo ? photo.name : "Add a photo (optional)"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setPhoto(e.target.files[0])}
                  />
                </label>

                <button
                  type="button"
                  onClick={handleShareLocation}
                  className={`w-full flex items-center justify-center gap-2 border rounded-lg px-3 py-2 text-sm
                             cursor-pointer transition-colors ${
                    location
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <MapPin size={16} />
                  {location ? "Location shared" : "Share my location (optional)"}
                </button>

                {formError && (
                  <p className="text-xs text-red-600">{formError}</p>
                )}

                <button
                  type="button"
                  onClick={handleSubmitReport}
                  disabled={submitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium
                             py-2.5 rounded-lg cursor-pointer transition-colors shadow-sm hover:shadow
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending..." : "Send report"}
                </button>
              </div>
            )}

            {isLost && submitted && (
              <div className="mt-4 pt-4 border-t border-gray-200 text-center py-4">
                <p className="text-sm font-medium text-gray-900">Thank you!</p>
                <p className="text-xs text-gray-500 mt-1">
                  The owner has been notified and will reach out soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScanPage;
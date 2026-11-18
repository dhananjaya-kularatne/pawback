import BrandMark from "../components/BrandMark";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Heart, Camera, MapPin } from "lucide-react";
import { getPetByUuid, submitReport } from "../api/scanApi";
import { PHOTO_ACCEPT, validatePhoto } from "../utils/validatePhoto";
import PageStatus from "../components/PageStatus";

// Public page a finder lands on after scanning a pet's QR code.
// No login required. Branches on the pet's status: Safe shows a calm message, Lost shows the pet's details (conditional fields) plus a
// working report form (message, optional photo, optional location).
function ScanPage() {
  const { petUuid } = useParams();
  // A different tag starts a fresh report, including photo/location and success state.
  return <ScanPetPage key={petUuid} petUuid={petUuid} />;
}

function ScanPetPage({ petUuid }) {
  const requestKey = useRef(null);
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const locationRequest = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");
  const [finderPhone, setFinderPhone] = useState("");
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchPet() {
      try {
        const data = await getPetByUuid(petUuid);
        if (!cancelled) setPet(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPet();
    return () => { cancelled = true; locationRequest.current = null; };
  }, [petUuid]);

  // Capture the finder's current position only after they choose to share it.
  function handleShareLocation() {
    if (locationRequest.current || submitting) return;
    setLocationError("");
    if (!window.isSecureContext || !navigator.geolocation) {
      setLocationError("Location is unavailable in this browser or connection. You can describe the place in your message instead.");
      return;
    }
    const request = Symbol();
    locationRequest.current = request;
    setLocation(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (locationRequest.current !== request) return;
        locationRequest.current = null;
        setLocating(false);
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        if (locationRequest.current !== request) return;
        locationRequest.current = null;
        setLocating(false);
        setLocationError(error.code === 1
          ? "Location permission was denied. Allow location in your browser settings and try again, or send the report without it."
          : error.code === 3
            ? "Finding your location took too long. Try again, or describe the place in your message."
            : "Your location could not be found. Check your device's location settings and try again, or send the report without it.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  function clearLocation() {
    locationRequest.current = null;
    setLocating(false);
    setLocation(null);
    setLocationError("");
  }

  async function handleSubmitReport() {

  // Guard against duplicate submissions , blocks the request even if the form somehow becomes visible again after a successful submit
    if (submitted || submitting || locationRequest.current) return;
    
    setFormError("");

    if (!message.trim()) {
      setFormError("Please enter a message");
      return;
    }

    const phone = finderPhone.trim();
    if (phone && (!/^\+?[0-9() .-]{7,32}$/.test(phone) || (phone.match(/[0-9]/g) || []).length < 7 || (phone.match(/[0-9]/g) || []).length > 15)) {
      setFormError("Enter a valid contact number with 7 to 15 digits, or leave it blank.");
      return;
    }
    setSubmitting(true);
    try {
      requestKey.current ??= crypto.randomUUID();
      await submitReport(
        petUuid,
        {
          message,
          finderPhone: phone || null,
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null,
        },
        photo,
        requestKey.current
      );
      setSubmitted(true);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <PageStatus title="Loading pet profile" message="Please wait while we open this pet's details." busy />;
  }

  if (error) {
    return <PageStatus title="Pet profile unavailable" message={error} />;
  }

  const isLost = pet.status === "LOST";

  return (
    <div id="main-content" className="scan-page min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white">
            <BrandMark />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="pet-profile-photo">
            <img src={pet.photoUrl} alt={pet.name} className="pet-photo" />
          </div>

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
                  <label htmlFor="finder-message" className="text-sm text-gray-600">
                    Message <span className="text-red-700">*</span>
                  </label>
                  <textarea
                    id="finder-message"
                    value={message}
                    maxLength={255}
                    aria-describedby="finder-message-count"
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Where did you see this pet?"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1
                               focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow"
                  />
                  <p id="finder-message-count" className="mt-1 text-xs text-gray-500">{message.length}/255 characters</p>
                </div>

                <div><label htmlFor="finder-phone" className="text-sm text-gray-600">Your phone number (optional)</label><input id="finder-phone" type="tel" autoComplete="tel" value={finderPhone} maxLength={32} onChange={(event) => setFinderPhone(event.target.value)} aria-describedby="finder-phone-help" placeholder="e.g. +94 77 123 4567" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" /><p id="finder-phone-help" className="mt-1 text-xs text-gray-500">Shared with the pet's owner so they can contact you about this report. Administrators can also view it for moderation. It is not shown on the public pet profile.</p></div>

                <label
                  className="flex items-center justify-center gap-2 border border-gray-300
                             rounded-lg px-3 py-2 text-sm text-gray-600 cursor-pointer
                             hover:bg-gray-50 transition-colors"
                >
                  <Camera size={16} />
                  {photo ? photo.name : "Add a photo (optional)"}
                  <input
                    type="file"
                    accept={PHOTO_ACCEPT}
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      e.target.value = "";
                      if (!file) return;
                      try { await validatePhoto(file); setPhoto(file); setFormError(""); }
                      catch (err) { setFormError(err.message); }
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={handleShareLocation}
                  disabled={locating || submitting}
                  aria-busy={locating}
                  aria-describedby="finder-location-status"
                  className={`w-full flex items-center justify-center gap-2 border rounded-lg px-3 py-2 text-sm
                             cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    location
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <MapPin size={16} />
                  {locating ? "Finding your location..." : location ? "Update my location" : "Share my location (optional)"}
                </button>
                <p id="finder-location-status" role="status" className={`text-xs ${locationError ? "text-red-700" : "text-gray-500"}`}>
                  {locationError || (location
                    ? `Location added to this report.${Number.isFinite(location.accuracy) ? ` Estimated accuracy: within ${Math.ceil(location.accuracy)} metres.` : ""} This is your current location, not the pet's live location.`
                    : locating ? "Waiting for your device. Allow location access if your browser asks."
                    : "Adds your current location when you send the report. If you saw the pet somewhere else, describe that place in your message.")}
                </p>
                {location && <div className="space-y-2">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location.latitude},${location.longitude}`)}`}
                    target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-700 underline">
                    <MapPin size={14} /> Check location on map
                  </a>
                  {location.accuracy > 1000 && <p className="text-xs text-amber-800">Your device returned a broad area. Check the map before sending. If the pin is wrong, remove the location and describe the exact place in your message. A phone with location services enabled may give a more accurate result.</p>}
                </div>}
                {(location || locating) && <button type="button" onClick={clearLocation} disabled={submitting}
                  className="text-xs text-blue-700 underline cursor-pointer disabled:opacity-50">
                  {locating ? "Cancel location request" : "Remove location"}
                </button>}

                {formError && (
                  <p role="alert" className="text-xs text-red-600">{formError}</p>
                )}

                <button
                  type="button"
                  onClick={handleSubmitReport}
                  disabled={submitting || locating}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium
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
                  Your report has been received. The owner can view it in their dashboard.
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

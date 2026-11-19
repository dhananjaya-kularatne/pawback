import BrandMark from "../components/BrandMark";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Camera, Check, CheckCircle2, ChevronRight, Heart, LoaderCircle, MapPin, Send } from "lucide-react";
import { getPetByUuid, submitReport } from "../api/scanApi";
import { PHOTO_ACCEPT, validatePhoto } from "../utils/validatePhoto";
import PageStatus from "../components/PageStatus";
const LocationPickerModal = lazy(() => import("../components/LocationPickerModal"));

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
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
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
          source: "device",
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

  function openLocationPicker() {
    setLocationPickerOpen(true);
  }

  function confirmLocation(point) {
    locationRequest.current = null;
    setLocating(false);
    setLocation({ latitude: point.latitude, longitude: point.longitude, source: "map" });
    setLocationError("");
    setLocationPickerOpen(false);
  }

  async function handleSubmitReport() {

  // Guard against duplicate submissions , blocks the request even if the form somehow becomes visible again after a successful submit
    if (submitted || submitting || locationRequest.current || locationPickerOpen) return;
    
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
  let locationStatus = locationError;
  if (!locationStatus && locating) locationStatus = "Allow location access if your browser asks.";
  if (!locationStatus && location) {
    if (location.source === "map") locationStatus = "Corrected pin saved to this report.";
    else if (location.accuracy > 1000) locationStatus = "Your device estimated a broad area. Open the map to check the pin.";
    else locationStatus = "Location added. Open the map to check or adjust the pin.";
  }

  return (
    <div className="scan-page min-h-screen">
      <header className="finder-header">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <div className="content-width">
          <Link to="/" className="brand"><BrandMark /> PawBack</Link>
          <Link className="header-link" to="/help#found">Finder help <ChevronRight size={16} /></Link>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className={`content-width finder-layout ${isLost ? "finder-layout-lost" : ""}`}>
        <article className="surface finder-profile">
          <div className="pet-profile-photo">
            <img src={pet.photoUrl} alt={pet.name} className="pet-photo" />
          </div>
          <div className="finder-profile-body">
            <span className={`pet-state ${isLost ? "pet-state-lost" : "pet-state-safe"}`}>
              <span aria-hidden="true" /> {isLost ? "Reported lost" : "Safe"}
            </span>
            <h1>{pet.name}</h1>
            {pet.breed && <p className="text-gray-600">{pet.breed}</p>}
            {pet.description && <p className="mt-3 text-gray-600">{pet.description}</p>}
            {pet.ifFoundInstructions && (
              <div className="finder-instructions">
                <h2>If you find {pet.name}</h2>
                <p>{pet.ifFoundInstructions}</p>
              </div>
            )}
            {!isLost && (
              <p className="finder-safe"><Heart size={19} /> {pet.name} is currently marked safe.</p>
            )}
          </div>
        </article>

        {isLost && (
          <section className="surface finder-report" aria-labelledby="finder-report-title">
            {submitted ? (
              <div className="finder-success" role="status">
                <div className="status-icon"><CheckCircle2 size={24} /></div>
                <h2 id="finder-report-title">Report sent</h2>
                <p>Your report has been received. The owner can view it in their dashboard.</p>
                <Link to="/" className="button-secondary mt-5">Back to PawBack <ArrowRight size={17} /></Link>
              </div>
            ) : (
              <>
                <h2 id="finder-report-title">Report a sighting</h2>
                <p className="finder-intro">Tell {pet.name}'s owner where and when you saw them.</p>
                <form className="finder-form" onSubmit={(event) => { event.preventDefault(); void handleSubmitReport(); }}>
                  <div>
                    <label htmlFor="finder-message">Message <span className="text-red-700">*</span></label>
                    <textarea
                      id="finder-message"
                      value={message}
                      maxLength={255}
                      aria-describedby="finder-message-count"
                      onChange={(event) => setMessage(event.target.value)}
                      required
                      rows={3}
                      placeholder="For example, near the park entrance at 4 pm."
                      className="finder-input"
                    />
                    <p id="finder-message-count" className="finder-count">{message.length}/255</p>
                  </div>
                  <div>
                    <label htmlFor="finder-phone">Phone number <span className="field-optional">Optional</span></label>
                    <input
                      id="finder-phone"
                      type="tel"
                      autoComplete="tel"
                      value={finderPhone}
                      maxLength={32}
                      onChange={(event) => setFinderPhone(event.target.value)}
                      aria-describedby="finder-phone-help"
                      placeholder="e.g. +94 77 123 4567"
                      className="finder-input"
                    />
                    <p id="finder-phone-help" className="field-help">Shared with the owner and PawBack moderators.</p>
                  </div>
                  <div className="finder-attachments">
                    <div className="finder-attachment">
                      <label className="button-secondary finder-photo">
                        {photo ? <Check size={19} /> : <Camera size={19} />}
                        <span>{photo ? "Change photo" : "Add a photo (optional)"}</span>
                        <input
                          type="file"
                          accept={PHOTO_ACCEPT}
                          className="sr-only"
                          disabled={submitting}
                          onChange={async (event) => {
                            const file = event.target.files[0];
                            event.target.value = "";
                            if (!file) return;
                            try { await validatePhoto(file); setPhoto(file); setFormError(""); }
                            catch (err) { setFormError(err.message); }
                          }}
                        />
                      </label>
                      {photo && (
                        <>
                          <p className="field-help break-all" role="status">Photo added: {photo.name}</p>
                          <button type="button" className="button-quiet button-small mt-1"
                            disabled={submitting} onClick={() => setPhoto(null)}>Remove photo</button>
                        </>
                      )}
                    </div>
                    <div className="finder-attachment">
                      <button
                        type="button"
                        onClick={location ? openLocationPicker : handleShareLocation}
                        disabled={locating || submitting}
                        aria-busy={locating}
                        aria-describedby={locationStatus ? "finder-location-status" : undefined}
                        className="button-secondary finder-location"
                      >
                        {locating ? <LoaderCircle size={19} className="motion-safe:animate-spin" /> : <MapPin size={19} />}
                        <span>{locating ? "Finding location..." : location ? "Open location" : "Share my location (optional)"}</span>
                        {location && <ChevronRight size={16} className="ml-auto" />}
                      </button>
                      {locationStatus && <p id="finder-location-status" role="status" className={`field-help ${locationError ? "text-red-700" : ""}`}>{locationStatus}</p>}
                      {(location || locating) && (
                        <button type="button" onClick={clearLocation} disabled={submitting} className="button-quiet button-small mt-1">
                          {locating ? "Cancel location request" : "Remove location"}
                        </button>
                      )}
                    </div>
                  </div>

                  {formError && <p role="alert" className="notice-error text-sm">{formError}</p>}
                  <button type="submit" disabled={submitting || locating || locationPickerOpen} className="button-primary w-full">
                    {submitting ? <LoaderCircle size={18} className="motion-safe:animate-spin" /> : <Send size={18} />}
                    {submitting ? "Sending report..." : "Send report"}
                  </button>
                </form>
              </>
            )}
          </section>
        )}
      </main>
      {locationPickerOpen && (
        <Suspense fallback={<p className="map-loading" role="status">Opening location map...</p>}>
          <LocationPickerModal location={location} onConfirm={confirmLocation} onClose={() => setLocationPickerOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}

export default ScanPage;

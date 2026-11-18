import { Link } from "react-router-dom";
import Footer from "../components/layout/Footer";
import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, MessageSquare, Trash2, QrCode as QrCodeIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import { getMyPets, updatePet, createPet, updatePetStatus, deletePet, regeneratePetQr } from "../api/petApi";
import ConfirmDialog from "../components/ConfirmDialog";
import { useSession } from "../utils/useSession";
import EditPetModal from "../components/EditPetModal";
import AddPetModal from "../components/AddPetModal";
import QrCodeModal from "../components/QrCodeModal";
import PetReportsModal from "../components/PetReportsModal";

// Owner's dashboard , lists all registered pets, with inline add/edit/QR view/status toggle
function Dashboard() {
  const { user } = useSession();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPet, setEditingPet] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewingQrPet, setViewingQrPet] = useState(null);
  const [viewingReportsPet, setViewingReportsPet] = useState(null);
  const statusRequests = useRef(new Set());
  const [pendingStatusIds, setPendingStatusIds] = useState(() => new Set());
  const [statusErrors, setStatusErrors] = useState({});
  const [removingPet, setRemovingPet] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  // Greeting name comes from the stored user, so the banner reflects whoever is
  // actually signed in rather than a hard-coded owner.
  const firstName = user?.name?.split(" ")[0] || "";

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

  // Saves an edited pet in place in the local list , no reload needed
  async function handleSave(updatedFields, imageFile) {
    const updated = await updatePet(editingPet.id, updatedFields, imageFile);
    setPets((prev) =>
      prev.map((pet) => (pet.id === updated.id ? updated : pet))
    );
    setEditingPet(null);
  }

  // Adds a newly created pet straight into the local list , no reload needed
  async function handleAddPet(petData, imageFile, requestKey) {
    const newPet = await createPet(petData, imageFile, requestKey);
    setPets((prev) => prev.some((pet) => pet.id === newPet.id) ? prev : [...prev, newPet]);
    setAddModalOpen(false);
  }

  async function handleDeletePet(pet) {
    if (deletingId != null) return;
    setDeletingId(pet.id);
    setDeleteError("");
    try {
      await deletePet(pet.id);
      setPets((prev) => prev.filter((item) => item.id !== pet.id));
      setRemovingPet(null);
    } catch (err) { setDeleteError(err.message); setRemovingPet(null); }
    finally { setDeletingId(null); }
  }

  async function handleRegenerateQr(pet) {
    const updated = await regeneratePetQr(pet.id);
    setPets((prev) => prev.map((item) => item.id === updated.id ? updated : item));
    setViewingQrPet(updated);
  }

  // Toggles a pet's status between SAFE and LOST, updating in place
  async function handleToggleStatus(pet) {
    if (statusRequests.current.has(pet.id)) return;
    statusRequests.current.add(pet.id);
    setPendingStatusIds(new Set(statusRequests.current));
    setStatusErrors((prev) => ({ ...prev, [pet.id]: "" }));
    const newStatus = pet.status === "SAFE" ? "LOST" : "SAFE";
    try {
      const updated = await updatePetStatus(pet.id, newStatus);
      setPets((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
    } catch (err) {
      setStatusErrors((prev) => ({
        ...prev,
        [pet.id]: err.message || "Unable to update status. Please try again.",
      }));
    } finally {
      statusRequests.current.delete(pet.id);
      setPendingStatusIds(new Set(statusRequests.current));
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="dashboard-welcome">
        <div className="relative w-full px-6 md:px-10 lg:px-16 py-8">
          <h1 className="text-2xl font-semibold text-blue-950 mb-1">
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </h1>
          <p className="text-blue-900 text-sm">
            Keep your pet profiles up to date so they can always find their way home.
          </p>
        </div>
      </div>

      <main id="main-content" className="content-width dashboard-content">
        <div className="dashboard-tip"><span>New to QR tags? Get your pet ready in a few simple steps.</span><Link to="/help">Read the guide</Link></div>
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
        {deleteError && <p role="alert" className="text-sm text-red-700 mb-3">{deleteError}</p>}

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
          <div className="pet-grid">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="pet-card bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm"
              >
                <div className="pet-photo-frame relative overflow-hidden">
                  <img
                    src={pet.photoUrl}
                    alt={pet.name}
                    className="pet-photo"
                  />
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />

                  {/* Status badge, top-left, on the image , now a clickable toggle */}
                  <button
                    onClick={() => handleToggleStatus(pet)}
                    disabled={pendingStatusIds.has(pet.id)}
                    aria-label={`Mark ${pet.name} as ${pet.status === "SAFE" ? "lost" : "safe"}`}
                    aria-busy={pendingStatusIds.has(pet.id)}
                    className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full
                               backdrop-blur-sm cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-wait ${
                      pet.status === "SAFE"
                        ? "bg-green-700 hover:bg-green-800 text-white"
                        : "bg-red-700 hover:bg-red-800 text-white"
                    }`}
                    title={`Click to mark as ${pet.status === "SAFE" ? "Lost" : "Safe"}`}
                  >
                    {pendingStatusIds.has(pet.id) ? "Updating..." : pet.status === "SAFE" ? "Safe" : "Lost"}
                  </button>

                  {/* View QR button, top-right (left of Edit), on the image */}
                  <button
                    onClick={() => setViewingQrPet(pet)}
                    className="absolute top-3 right-14 w-8 h-8 flex items-center justify-center
                              bg-white/90 hover:bg-white rounded-full cursor-pointer
                              transition-colors shadow-sm"
                    aria-label="View QR code"
                  >
                    <QrCodeIcon size={16} className="text-gray-700" />
                  </button>

                  {/* Edit button, top-right, on the image */}
                  <button
                    onClick={() => setEditingPet(pet)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center
                              bg-white/90 hover:bg-white rounded-full cursor-pointer
                              transition-colors shadow-sm"
                    aria-label="Edit pet"
                  >
                    <Pencil size={16} className="text-gray-700" />
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
                  {statusErrors[pet.id] && (
                    <p role="alert" className="mb-2 text-xs text-red-700">
                      {statusErrors[pet.id]} Click the status badge to try again.
                    </p>
                  )}
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
                  <button
                    type="button"
                    onClick={() => setViewingReportsPet(pet)}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900 cursor-pointer"
                    aria-label={`View reports for ${pet.name}`}
                  >
                    <MessageSquare size={15} /> View reports
                  </button>
                  <button type="button" onClick={() => setRemovingPet(pet)}
                    disabled={pendingStatusIds.has(pet.id) || deletingId != null}
                    aria-label={`Remove ${pet.name}`}
                    className="mt-3 ml-3 inline-flex items-center gap-1 text-xs text-red-700 hover:underline disabled:opacity-50 cursor-pointer">
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />

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

      {viewingQrPet && (
        <QrCodeModal
          key={`${viewingQrPet.id}:${viewingQrPet.qrCodeUrl}`}
          pet={viewingQrPet}
          onRegenerate={() => handleRegenerateQr(viewingQrPet)}
          onClose={() => setViewingQrPet(null)}
        />
      )}
      {viewingReportsPet && (
        <PetReportsModal
          key={viewingReportsPet.id}
          pet={viewingReportsPet}
          onClose={() => setViewingReportsPet(null)}
        />
      )}
      {removingPet && <ConfirmDialog tone="danger" title={`Remove ${removingPet.name}?`}
        message="This removes the pet and its report history from your account. Existing QR tags will stop working. This cannot be undone."
        confirmLabel="Remove pet" busy={deletingId === removingPet.id}
        onConfirm={() => handleDeletePet(removingPet)} onCancel={() => setRemovingPet(null)} />}
    </div>
  );
}

export default Dashboard;

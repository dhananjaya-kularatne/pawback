import { Link } from "react-router-dom";
import Footer from "../components/layout/Footer";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown, LoaderCircle, MapPin, PawPrint, Plus, Pencil, MessageSquare, Trash2, QrCode as QrCodeIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import { getMyPets, updatePet, createPet, updatePetStatus, deletePet, regeneratePetQr } from "../api/petApi";
import ConfirmDialog from "../components/ConfirmDialog";
import { useSession } from "../utils/useSession";
import EditPetModal from "../components/EditPetModal";
import AddPetModal from "../components/AddPetModal";
import QrCodeModal from "../components/QrCodeModal";
import PetReportsModal from "../components/PetReportsModal";

function PetCardPhoto({ pet }) {
  const [failed, setFailed] = useState(false);
  const hasPhoto = pet.photoUrl && !failed;

  return (
    hasPhoto ? (
      <div className="pet-card-photo">
        <img
          src={pet.photoUrl} alt={pet.name} decoding="async" loading="lazy"
          onError={() => setFailed(true)}
        />
      </div>
    ) : (
      <div className="pet-card-photo pet-card-photo-empty">
        <PawPrint size={36} aria-hidden="true" />
        <span>Photo unavailable</span>
      </div>
    )
  );
}

function PetActions({ name, children }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const controlRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(event) {
      if (!controlRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [open]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className="pet-actions" ref={controlRef}
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (open && event.key === "Escape") close();
      }}>
      <button type="button" className="button-quiet button-small pet-actions-trigger" ref={triggerRef}
        aria-label={`Actions for ${name}`} aria-expanded={open} aria-controls={open ? panelId : undefined}
        onClick={() => setOpen(!open)}>
        Actions <ChevronDown size={15} aria-hidden="true" />
      </button>
      {open && <div id={panelId} className="surface pet-actions-panel" onClick={(event) => {
        if (event.target.closest("button")) close();
      }}>{children}</div>}
    </div>
  );
}

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
  const [feedback, setFeedback] = useState("");

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
    setFeedback(`${updated.name}’s profile was updated.`);
  }

  // Adds a newly created pet straight into the local list , no reload needed
  async function handleAddPet(petData, imageFile, requestKey) {
    const newPet = await createPet(petData, imageFile, requestKey);
    setPets((prev) => prev.some((pet) => pet.id === newPet.id) ? prev : [...prev, newPet]);
    setAddModalOpen(false);
    setFeedback(`${newPet.name} was added to My pets.`);
  }

  async function handleDeletePet(pet) {
    if (deletingId != null) return;
    setDeletingId(pet.id);
    setDeleteError("");
    try {
      await deletePet(pet.id);
      setPets((prev) => prev.filter((item) => item.id !== pet.id));
      setRemovingPet(null);
      setFeedback(`${pet.name} was removed.`);
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="content-width dashboard-content">
        <div className="dashboard-welcome">
          <div>
            <h1>My pets</h1>
            <p>{firstName ? `Hi, ${firstName}. Manage your pet profiles, tags and finder reports here.` : "Manage your pet profiles, tags and finder reports here."}</p>
          </div>
          <button type="button" className="button-primary" onClick={() => setAddModalOpen(true)}>
            <Plus size={19} /> Add pet
          </button>
        </div>

        {loading && <p role="status" className="flex items-center gap-2 text-gray-600"><LoaderCircle size={18} className="motion-safe:animate-spin" /> Loading pets...</p>}
        {error && <p role="alert" className="notice-error">{error}</p>}
        {deleteError && <p role="alert" className="notice-error mb-4">{deleteError}</p>}
        {feedback && <p className="dashboard-feedback" role="status"><CheckCircle2 size={18} /> {feedback}</p>}

        {!loading && !error && pets.length === 0 && (
          <section className="surface pet-empty">
            <div className="status-icon"><PawPrint size={24} /></div>
            <h2>Add your first pet</h2>
            <p>Create a profile to download a QR code for their collar.</p>
          </section>
        )}

        {!loading && !error && pets.length > 0 && (
          <div className="pet-grid">
            {pets.map((pet) => {
              const isLost = pet.status === "LOST";
              const updating = pendingStatusIds.has(pet.id);
              return (
                <article key={pet.id} className="surface pet-card">
                  <PetCardPhoto key={pet.photoUrl} pet={pet} />
                  <div className="pet-card-body">
                    <div className="pet-card-heading">
                      <h2>{pet.name}</h2>
                      <span role="status" className={`pet-state ${isLost ? "pet-state-lost" : "pet-state-safe"}`}>
                        <span aria-hidden="true" /> {isLost ? "Lost" : "Safe"}
                      </span>
                    </div>
                    {pet.breed && <p className="pet-card-breed">{pet.breed}</p>}
                    {pet.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{pet.description}</p>}
                    {pet.ifFoundInstructions && <p className="text-sm text-gray-600 mb-3"><strong>If found</strong> {pet.ifFoundInstructions}</p>}
                    {statusErrors[pet.id] && <p role="alert" className="notice-error text-sm mt-3">{statusErrors[pet.id]}</p>}
                    <div className="pet-card-tools">
                      <button type="button" className="button-secondary button-small" onClick={() => setViewingQrPet(pet)} aria-label="View QR code">
                        <QrCodeIcon size={16} /> QR tag
                      </button>
                      <button type="button" className={`button-small ${isLost ? "button-primary" : "button-quiet"}`} onClick={() => setViewingReportsPet(pet)} aria-label={`View reports for ${pet.name}`}>
                        <MessageSquare size={16} /> Reports
                      </button>
                      <PetActions name={pet.name}>
                        <button type="button" className="button-quiet button-small" onClick={() => setEditingPet(pet)}>
                          <Pencil size={16} /> Edit pet
                        </button>
                        <button type="button" className="button-quiet button-small" disabled={updating || deletingId === pet.id}
                          onClick={() => handleToggleStatus(pet)}>
                          <MapPin size={16} /> {isLost ? "Mark safe" : "Mark lost"}
                        </button>
                        <button type="button" className="button-quiet button-small pet-remove" disabled={updating || deletingId != null}
                          onClick={() => setRemovingPet(pet)}>
                          <Trash2 size={16} /> Remove pet
                        </button>
                      </PetActions>
                    </div>
                    {updating && <p role="status" className="pet-status-progress">Updating status...</p>}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <aside className="dashboard-tip">
          <div><BookOpen size={20} /><span>Need help printing or attaching a tag?</span></div>
          <Link to="/help#tag" className="button-quiet button-small">Read the guide <ArrowRight size={16} /></Link>
        </aside>
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

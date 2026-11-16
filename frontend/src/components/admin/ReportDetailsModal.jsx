import { useEffect, useRef } from "react";
import { MapPin, X } from "lucide-react";

export default function ReportDetailsModal({ report, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      // The dialog unmounts on close, so native focus restoration alone is unreliable.
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);

  function handleBackdropClick(event) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
  }

  return (
    <dialog ref={dialogRef} onCancel={onClose} onClick={handleBackdropClick}
      aria-labelledby="report-detail-title"
      className="m-auto w-[calc(100%_-_2rem)] max-w-2xl max-h-[85dvh] overflow-y-auto rounded-2xl bg-white p-0 shadow-xl backdrop:bg-black/50">
      <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-gray-200 bg-white px-5 py-4">
        <div className="min-w-0">
          <h2 id="report-detail-title" className="text-lg font-semibold text-gray-900 break-words">
            Report for {report.petName || "pet"}
          </h2>
          <p className="mt-1 text-xs text-gray-500">Pet ID {report.petId} · Report #{report.id}</p>
        </div>
        <button type="button" onClick={onClose} autoFocus aria-label="Close report details"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 shrink-0 cursor-pointer">
          <X size={20} />
        </button>
      </div>
      <div className="p-5 space-y-4">
        {report.createdAt && (
          <time dateTime={report.createdAt} className="block text-xs text-gray-500">
            {new Date(report.createdAt).toLocaleString()} (local time)
          </time>
        )}
        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{report.message || "No message provided."}</p>
        {report.photoUrl ? (
          <a href={report.photoUrl} target="_blank" rel="noopener noreferrer" className="block"
            aria-label="Open finder photo in a new tab">
            <img src={report.photoUrl} alt="Finder report photo" className="w-full max-h-96 object-contain rounded-lg bg-gray-50" />
            <span className="block text-xs text-blue-700 mt-2">Open full photo</span>
          </a>
        ) : <p className="text-xs text-gray-500">No photo attached.</p>}
        {report.latitude != null && report.longitude != null ? (
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${report.latitude},${report.longitude}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline">
            <MapPin size={15} /> View shared location
          </a>
        ) : <p className="text-xs text-gray-500">No location shared.</p>}
      </div>
    </dialog>
  );
}

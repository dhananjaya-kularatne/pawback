import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

// Small in-app confirmation modal — used instead of window.confirm so the
// prompt matches the rest of the UI (and doesn't show the browser's
// "localhost says" chrome). Rendered conditionally by the parent.
//
// Props: title, message, confirmLabel, cancelLabel, tone ("danger" | "default"),
// busy, onConfirm, onCancel.
function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  busy = false,
  onConfirm,
  onCancel,
}) {
  // Escape closes the dialog, matching native dialog behaviour
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && !busy) onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  const confirmClass =
    tone === "danger"
      ? "bg-red-600 hover:bg-red-700"
      : "bg-blue-700 hover:bg-blue-800";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={() => !busy && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => !busy && onCancel()}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full
                     text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer
                     disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={busy}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex gap-3">
          {tone === "danger" && (
            <div className="mt-0.5 w-9 h-9 shrink-0 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            {message && (
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            disabled={busy}
            className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200
                       text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`text-sm font-medium px-4 py-2 rounded-lg text-white transition-colors cursor-pointer
                        disabled:opacity-60 disabled:cursor-not-allowed ${confirmClass}`}
          >
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;

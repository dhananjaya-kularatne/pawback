import { PawPrint, X } from "lucide-react";

// Shared chrome for the landing-page auth modals — dark backdrop, centered
// white card, brand header, close button top-right, and an optional footer.
// Mirrors the register-modal styling that already lived in LandingPage.
export default function AuthModalShell({ title, subtitle, onClose, children, footer }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full
                     text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center">
              <PawPrint size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">PawBack</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>

        {children}

        {footer && (
          <p className="mt-4 text-center text-xs text-gray-500">{footer}</p>
        )}
      </div>
    </div>
  );
}

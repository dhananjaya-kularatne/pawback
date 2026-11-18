import Modal from "../Modal";
import BrandMark from "../BrandMark";
import { X } from "lucide-react";

export default function AuthModalShell({ title, subtitle, onClose, children, footer, busy = false, showRequiredNote = true }) {
  return <Modal onClose={onClose} busy={busy} titleId="auth-modal-title" className="max-w-lg">
    <div className="auth-modal-content bg-white p-8">
      <div className="auth-brand-row flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2"><BrandMark className="w-8 h-8" /><span className="font-bold text-gray-900">PawBack</span></div>
        <button type="button" onClick={onClose} disabled={busy} aria-label="Close"
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-pointer disabled:opacity-50"><X size={20} /></button>
      </div>
      <div className="auth-heading mb-6"><h2 id="auth-modal-title" className="text-xl font-bold text-gray-900">{title}</h2>{subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}</div>
      {showRequiredNote && <p className="required-note">Fields marked <span>*</span> are required.</p>}
      {children}
      {footer && <p className="mt-4 text-center text-xs text-gray-500">{footer}</p>}
    </div>
  </Modal>;
}

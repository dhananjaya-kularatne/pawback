import Modal from "../Modal";
import BrandMark from "../BrandMark";
import { X } from "lucide-react";

export default function AuthModalShell({ title, subtitle, onClose, children, footer, busy = false, showRequiredNote = true }) {
  return <Modal onClose={onClose} busy={busy} titleId="auth-modal-title" className="max-w-lg">
    <div className="auth-intro">
      <div className="auth-brand-row">
        <div className="brand"><BrandMark className="w-8 h-8" /><span>PawBack</span></div>
        <button type="button" onClick={onClose} disabled={busy} aria-label="Close"
          className="icon-button disabled:opacity-50"><X size={20} /></button>
      </div>
      <div className="auth-heading"><h2 id="auth-modal-title">{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
    </div>
    <div className="auth-modal-content">
      {showRequiredNote && <p className="required-note">Fields marked <span>*</span> are required.</p>}
      {children}
      {footer && <p className="auth-footer">{footer}</p>}
    </div>
  </Modal>;
}

import { useEffect, useRef } from "react";

export default function Modal({ children, onClose, titleId, initialFocus, busy = false, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const opener = document.activeElement;
    dialog.showModal();
    initialFocus?.current?.focus();
    return () => {
      dialog.close();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, [initialFocus]);
  return (
    <dialog ref={ref} aria-labelledby={titleId} aria-busy={busy}
      onKeyDown={(event) => {
        if (event.key !== "Tab" || event.defaultPrevented || event.target.closest("dialog") !== event.currentTarget) return;
        const controls = [...event.currentTarget.querySelectorAll("button:not([disabled]), input:not([disabled]):not([type=hidden]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])")]
          .filter((element) => element.getClientRects().length > 0);
        const first = controls[0], last = controls.at(-1);
        if (!first) { event.preventDefault(); return; }
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }}
      onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
      onClick={(event) => {
        if (busy || event.target !== event.currentTarget) return;
        const box = event.currentTarget.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onClose();
      }}
      className={`app-dialog m-auto w-[calc(100%_-_2rem)] max-h-[90dvh] overflow-hidden bg-white p-0 ${className}`}>
      <div className="modal-scroll">{children}</div>
    </dialog>
  );
}

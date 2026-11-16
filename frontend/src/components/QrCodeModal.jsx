import Modal from "./Modal";
import { X, Download } from "lucide-react";
import { useRef, useState } from "react";

// Modal showing a pet's QR code with a download option
function QrCodeModal({ pet, onClose }) {
  const downloadLock = useRef(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [previewFailed, setPreviewFailed] = useState(false);

  // Fetches the image as a blob first — a plain <a download> often fails for cross-origin URLs like Cloudinary, so this forces a real download
  async function handleDownload() {
    if (!pet.qrCodeUrl || downloadLock.current) return;
    downloadLock.current = true;
    setDownloading(true);
    setError("");
    let url;
    let link;
    try {
      const response = await fetch(pet.qrCodeUrl);
      if (!response.ok) throw new Error("Could not download the QR code. Please try again.");
      const blob = await response.blob();
      if (!blob.size || !blob.type.startsWith("image/")) {
        throw new Error("The QR code image is unavailable. Please try again later.");
      }
      url = window.URL.createObjectURL(blob);

      link = document.createElement("a");
      link.href = url;
      link.download = `${pet.name}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      setError(err instanceof TypeError
        ? "Could not download the QR code. Check your connection and try again."
        : err.message || "Could not download the QR code. Please try again.");
    } finally {
      link?.remove();
      if (url) window.URL.revokeObjectURL(url);
      downloadLock.current = false;
      setDownloading(false);
    }
  }

  return (
    <Modal onClose={onClose} titleId="pet-qr-title" className="max-w-xs p-6 text-center">
        <div className="flex justify-between items-center mb-4">
          <h2 id="pet-qr-title" className="text-base font-medium text-gray-900 break-words">
            {pet.name}'s QR code
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close QR code"
            autoFocus
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100
                       p-1 rounded-md cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
          {pet.qrCodeUrl && !previewFailed ? <img
            src={pet.qrCodeUrl}
            alt={`QR code for ${pet.name}`}
            className="w-full h-auto"
            onError={() => setPreviewFailed(true)}
          /> : <p className="text-sm text-gray-600">
            {pet.qrCodeUrl ? "QR preview could not load. You can try downloading it below." : "A QR code is not available for this pet yet."}
          </p>}
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Attach this to {pet.name}'s collar so finders can scan it.
        </p>

        {error && <p role="alert" className="text-sm text-red-700 mb-3">{error}</p>}
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading || !pet.qrCodeUrl}
          aria-busy={downloading}
          className="w-full flex items-center justify-center gap-2 bg-blue-700
                     hover:bg-blue-800 text-white text-sm font-medium py-2
                     rounded-lg cursor-pointer transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={16} />
          {downloading ? "Downloading..." : "Download QR code"}
        </button>
    </Modal>
  );
}

export default QrCodeModal;

import { X, Download } from "lucide-react";

// Modal showing a pet's QR code with a download option
function QrCodeModal({ pet, onClose }) {
  // Fetches the image as a blob first — a plain <a download> often fails for cross-origin URLs like Cloudinary, so this forces a real download
  async function handleDownload() {
    const response = await fetch(pet.qrCodeUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${pet.name}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-xs shadow-lg text-center">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-medium text-gray-900">
            {pet.name}'s QR code
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100
                       p-1 rounded-md cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
          <img
            src={pet.qrCodeUrl}
            alt={`QR code for ${pet.name}`}
            className="w-full h-auto"
          />
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Attach this to {pet.name}'s collar so finders can scan it.
        </p>

        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 bg-blue-700
                     hover:bg-blue-800 text-white text-sm font-medium py-2
                     rounded-lg cursor-pointer transition-colors shadow-sm hover:shadow"
        >
          <Download size={16} />
          Download QR code
        </button>
      </div>
    </div>
  );
}

export default QrCodeModal;
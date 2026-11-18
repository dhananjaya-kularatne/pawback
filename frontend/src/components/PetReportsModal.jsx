import Modal from "./Modal";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, RefreshCw, X } from "lucide-react";
import { getPetReports } from "../api/petApi";

export default function PetReportsModal({ pet, onClose }) {
  const [request, setRequest] = useState({ page: 0 });
  const [result, setResult] = useState(null);
  const loading = result?.request !== request;
  const data = loading ? null : result?.data;
  const error = loading ? "" : result?.error;

  useEffect(() => {
    const controller = new AbortController();
    async function loadReports() {
      try {
        const data = await getPetReports(pet.id, request.page, 20, controller.signal);
        if (!controller.signal.aborted) {
          // A moderator may have deleted the last report on the current page.
          if (request.page > 0 && request.page >= data.totalPages) {
            setRequest({ page: Math.max(0, data.totalPages - 1) });
          } else {
            setResult({ request, data });
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) setResult({ request, error: err.message });
      }
    }
    loadReports();
    return () => controller.abort();
  }, [pet.id, request]);

  return (
    <Modal onClose={onClose} titleId="pet-reports-title" className="max-w-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-5 py-4">
        <div className="min-w-0">
          <h2 id="pet-reports-title" className="text-lg font-semibold text-gray-900 break-words">
            Reports for {pet.name}
          </h2>
          <p className="text-xs text-gray-500 mt-1">Your pet's finder updates, newest first.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close reports" autoFocus
          className="shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-100 cursor-pointer">
          <X size={20} />
        </button>
      </div>

      <div className="p-5" aria-busy={loading}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="text-sm text-gray-500" aria-live="polite">
            {loading ? "Loading reports..." : data ? `${data.totalElements} report${data.totalElements === 1 ? "" : "s"}` : "Reports unavailable"}
          </p>
          <button type="button" onClick={() => setRequest({ page: request.page })} disabled={loading}
            className="inline-flex items-center gap-1.5 text-sm text-blue-700 rounded-lg px-2 py-1 hover:bg-blue-50 disabled:opacity-50 cursor-pointer">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error} Use Refresh to try again.</p>}
        {data?.totalElements === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
            <p className="text-sm font-medium text-gray-700">No reports yet</p>
            <p className="text-xs text-gray-500 mt-2">When someone submits a finder report, it will appear here.</p>
          </div>
        )}

        <div className="space-y-4">
          {data?.content.map((report) => (
            <article key={report.id} className="rounded-xl border border-gray-200 p-4">
              <time dateTime={report.createdAt} className="text-xs text-gray-500">
                {report.createdAt ? new Date(report.createdAt).toLocaleString() : "Time unavailable"}
              </time>
              <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap break-words">{report.message}</p>
        {report.finderPhone && <p className="mt-3 text-sm"><span className="font-semibold">Finder contact: </span><a className="text-blue-700 underline" href={`tel:${report.finderPhone.replace(/[^+0-9]/g, "")}`}>{report.finderPhone}</a></p>}
              {report.photoUrl && (
                <a href={report.photoUrl} target="_blank" rel="noopener noreferrer" className="block mt-3"
                  aria-label="Open finder photo in a new tab">
                  <img src={report.photoUrl} alt={`Finder photo of ${pet.name}`} loading="lazy"
                    className="max-h-72 w-full rounded-lg bg-gray-50 object-contain" />
                  <span className="block mt-1 text-xs text-blue-700">Open full photo</span>
                </a>
              )}
              {report.latitude != null && report.longitude != null && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${report.latitude},${report.longitude}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline">
                  <MapPin size={15} /> View shared location
                </a>
              )}
            </article>
          ))}
        </div>

        {data && data.totalPages > 1 && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
            <span className="text-xs text-gray-500">Page {data.page + 1} of {data.totalPages}</span>
            <div className="flex gap-2">
              <button type="button" disabled={data.page === 0}
                onClick={() => setRequest({ page: data.page - 1 })}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-xs disabled:opacity-40 cursor-pointer">
                <ChevronLeft size={14} /> Previous
              </button>
              <button type="button" disabled={data.last}
                onClick={() => setRequest({ page: data.page + 1 })}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-xs disabled:opacity-40 cursor-pointer">
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

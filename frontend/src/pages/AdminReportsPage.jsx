import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Trash2, X } from "lucide-react";
import AdminLayout from "../components/admin/AdminLayout";
import ConfirmDialog from "../components/ConfirmDialog";
import { deleteReport, listReports } from "../api/adminApi";

const PAGE_SIZE = 20;

// Admin moderation view over every scan report platform-wide, paginated and
// filterable by pet id and a from/to date range. The route is gated to admins
// by AdminRoute, and every request here also hits the ADMIN-only backend.
// Deletion is permanent: reports have no soft-delete flag, so a removed row is
// gone from this view and the owning pet's report history alike.
function AdminReportsPage() {
  const [page, setPage] = useState(0);
  // Bumped to force a refetch of the current page after a delete
  const [reloadKey, setReloadKey] = useState(0);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Applied filters (drive the fetch) vs. the draft values in the inputs
  const [filters, setFilters] = useState({ petId: "", from: "", to: "" });
  const [draft, setDraft] = useState({ petId: "", from: "", to: "" });

  const [pendingId, setPendingId] = useState(null);
  // The report queued for a delete confirmation, or null
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchReports() {
      try {
        const data = await listReports(page, PAGE_SIZE, filters);
        if (!cancelled) {
          setPageData(data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchReports();
    return () => {
      cancelled = true;
    };
  }, [page, filters, reloadKey]);

  function goToPage(targetPage) {
    setLoading(true);
    setPage(targetPage);
  }

  function refetch() {
    setLoading(true);
    setReloadKey((k) => k + 1);
  }

  function applyFilters(e) {
    e.preventDefault();
    setLoading(true);
    setPage(0);
    setFilters(draft);
  }

  function clearFilters() {
    const cleared = { petId: "", from: "", to: "" };
    setDraft(cleared);
    setLoading(true);
    setPage(0);
    setFilters(cleared);
  }

  async function handleDelete(report) {
    setPendingId(report.id);
    setError("");
    try {
      await deleteReport(report.id);
      setToDelete(null);
      refetch();
    } catch (err) {
      setError(err.message);
      setToDelete(null);
    } finally {
      setPendingId(null);
    }
  }

  const reports = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;
  const totalElements = pageData?.totalElements ?? 0;
  const isLast = pageData?.last ?? true;
  const hasFilters = filters.petId || filters.from || filters.to;

  return (
    <AdminLayout title="Reports">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">All scan reports</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {totalElements === 1 ? "1 report" : `${totalElements} reports`} across every
          pet. Deleting a report removes it permanently, it cannot be undone.
        </p>
      </div>

      {/* Filters */}
      <form
        onSubmit={applyFilters}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5
                   flex flex-wrap items-end gap-3"
      >
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Pet ID</label>
          <input
            type="number"
            min="1"
            value={draft.petId}
            onChange={(e) => setDraft((d) => ({ ...d, petId: e.target.value }))}
            placeholder="Any pet"
            className="w-28 text-sm border border-gray-300 rounded-lg px-2.5 py-1.5
                       focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input
            type="date"
            value={draft.from}
            onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
            className="text-sm border border-gray-300 rounded-lg px-2.5 py-1.5
                       focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input
            type="date"
            value={draft.to}
            onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
            className="text-sm border border-gray-300 rounded-lg px-2.5 py-1.5
                       focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="text-sm font-medium px-4 py-1.5 rounded-lg bg-blue-600 text-white
                     hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Filter
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg
                       border border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </form>

      {error && (
        <p className="text-sm text-red-700 mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 border-b border-gray-200">
                <th className="px-5 py-3">Pet</th>
                <th className="px-5 py-3">Message</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Reported</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                    Loading reports...
                  </td>
                </tr>
              )}

              {!loading && reports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                    {hasFilters ? "No reports match these filters." : "No reports to show."}
                  </td>
                </tr>
              )}

              {!loading &&
                reports.map((report) => {
                  const isPending = pendingId === report.id;
                  return (
                    <tr
                      key={report.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="font-medium text-gray-900">{report.petName || "—"}</div>
                        <div className="text-gray-400 text-xs truncate max-w-[10rem]">
                          {report.petUuid}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-700 max-w-xs truncate" title={report.message}>
                        {report.message || "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {report.latitude != null && report.longitude != null ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={13} className="text-gray-400" />
                            {report.latitude.toFixed(3)}, {report.longitude.toFixed(3)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {report.createdAt ? new Date(report.createdAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => setToDelete(report)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg
                                     border border-rose-200 text-rose-700 bg-white hover:bg-rose-50
                                     transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50/60">
          <span className="text-xs text-gray-500">
            Page {page + 1} of {Math.max(totalPages, 1)}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(Math.max(page - 1, 0))}
              disabled={page === 0 || loading}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg
                         border border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-pointer
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
              Previous
            </button>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={isLast || loading}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg
                         border border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-pointer
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {toDelete && (
        <ConfirmDialog
          tone="danger"
          title={`Delete this report on ${toDelete.petName || "this pet"}?`}
          message="This permanently removes the report. It will no longer appear here or in the pet's report history, and this cannot be undone."
          confirmLabel="Delete report"
          busy={pendingId === toDelete.id}
          onConfirm={() => handleDelete(toDelete)}
          onCancel={() => setToDelete(null)}
        />
      )}
    </AdminLayout>
  );
}

export default AdminReportsPage;

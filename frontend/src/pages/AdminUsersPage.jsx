import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import AdminLayout from "../components/admin/AdminLayout";
import ConfirmDialog from "../components/ConfirmDialog";
import { listUsers, setUserEnabled } from "../api/adminApi";
import { getCurrentUser } from "../utils/auth";

const PAGE_SIZE = 20;

// Admin moderation view — every registered user, paginated, with a per-row
// enable/disable toggle. The route is gated to admins by AdminRoute; every
// request here also hits the ADMIN-only backend, and the self-disable rule is
// enforced server-side regardless of what this page shows.
function AdminUsersPage() {
  const currentUser = getCurrentUser();

  const [page, setPage] = useState(0);
  // Bumped to force a refetch of the current page after a toggle
  const [reloadKey, setReloadKey] = useState(0);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState(null);
  // The user queued for a disable confirmation, or null
  const [toDisable, setToDisable] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchUsers() {
      try {
        const data = await listUsers(page, PAGE_SIZE);
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

    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, [page, reloadKey]);

  function goToPage(targetPage) {
    setLoading(true);
    setPage(targetPage);
  }

  function refetch() {
    setLoading(true);
    setReloadKey((k) => k + 1);
  }

  async function toggleEnabled(user, enabled) {
    setPendingId(user.id);
    setError("");
    try {
      await setUserEnabled(user.id, enabled);
      setToDisable(null);
      refetch();
    } catch (err) {
      setError(err.message);
      setToDisable(null);
    } finally {
      setPendingId(null);
    }
  }

  const totalPages = pageData?.totalPages ?? 0;
  const totalElements = pageData?.totalElements ?? 0;
  const isLast = pageData?.last ?? true;

  // Client-side filter over the current page — quick lookup by name or email
  const users = useMemo(() => {
    const list = pageData?.content ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
    );
  }, [pageData, query]);

  return (
    <AdminLayout title="Users">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">All users</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalElements === 1
              ? "1 registered account"
              : `${totalElements} registered accounts`}
            . Disabling an account blocks sign-in until it is re-enabled.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search this page"
            className="w-full text-sm border border-gray-300 rounded-lg pl-8 pr-3 py-2 bg-white
                       focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
      </div>

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
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                    Loading users...
                  </td>
                </tr>
              )}

              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                    {query ? "No users match your search." : "No users to show."}
                  </td>
                </tr>
              )}

              {!loading &&
                users.map((user) => {
                  const isSelf = currentUser?.id === user.id;
                  const isPending = pendingId === user.id;
                  return (
                    <tr
                      key={user.id}
                      className={`border-b border-gray-100 last:border-0 transition-colors ${
                        user.enabled ? "hover:bg-blue-50/40" : "bg-rose-50/40 hover:bg-rose-50/70"
                      }`}
                    >
                      <td className="px-5 py-3">
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {user.name || "—"}
                            {isSelf && (
                              <span className="ml-2 text-[11px] font-normal text-gray-400">
                                you
                              </span>
                            )}
                          </div>
                          <div className="text-gray-500 truncate">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{user.phone || "—"}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded ${
                            user.role === "ADMIN"
                              ? "bg-violet-50 text-violet-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${
                            user.enabled
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                              : "bg-rose-50 text-rose-700 ring-rose-600/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.enabled ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {user.enabled ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {user.enabled ? (
                          <button
                            onClick={() => setToDisable(user)}
                            disabled={isSelf || isPending}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-rose-200
                                       text-rose-700 bg-white hover:bg-rose-50 transition-colors cursor-pointer
                                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                            title={
                              isSelf
                                ? "You cannot disable your own account"
                                : "Disable this account"
                            }
                          >
                            Disable
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleEnabled(user, true)}
                            disabled={isPending}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-600 text-white
                                       hover:bg-emerald-700 transition-colors cursor-pointer
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isPending ? "Enabling..." : "Enable"}
                          </button>
                        )}
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

      {toDisable && (
        <ConfirmDialog
          tone="danger"
          title={`Disable ${toDisable.name || toDisable.email}?`}
          message="They will be signed out and won't be able to log in until an admin re-enables the account."
          confirmLabel="Disable account"
          busy={pendingId === toDisable.id}
          onConfirm={() => toggleEnabled(toDisable, false)}
          onCancel={() => setToDisable(null)}
        />
      )}
    </AdminLayout>
  );
}

export default AdminUsersPage;

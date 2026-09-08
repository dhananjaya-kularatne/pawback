import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ban, ChevronLeft, ChevronRight, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import { listUsers, disableUser } from "../api/adminApi";
import { getCurrentUser } from "../utils/auth";

const PAGE_SIZE = 20;

// Admin moderation view — every registered user, paginated, with a per-row
// disable action. The route is already gated to admins by AdminRoute; every
// request here also hits the ADMIN-only backend, and the self-disable rule is
// enforced server-side regardless of what this page shows.
function AdminUsersPage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [page, setPage] = useState(0);
  // Bumped to force a refetch of the current page after a disable action
  const [reloadKey, setReloadKey] = useState(0);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState(null);

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

  async function handleDisable(user) {
    const confirmed = window.confirm(
      `Disable ${user.name || user.email}? They will be signed out and can no longer log in.`
    );
    if (!confirmed) return;

    setPendingId(user.id);
    try {
      await disableUser(user.id);
      // Refetch the current page so the row reflects the new status
      setLoading(true);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingId(null);
    }
  }

  const users = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;
  const totalElements = pageData?.totalElements ?? 0;
  const isLast = pageData?.last ?? true;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Admin banner — its own blue band beneath the shared header */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="admin-users-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#admin-users-pattern)" />
          </svg>
        </div>

        <div className="relative w-full px-6 md:px-10 lg:px-16 py-8">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-100 hover:text-white mb-3 cursor-pointer transition-colors"
          >
            <ArrowLeft size={14} />
            Back to admin console
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-blue-100 mb-3 ml-3">
            <Users size={14} />
            User management
          </div>
          <h1 className="text-2xl font-semibold text-white mb-1">Registered users</h1>
          <p className="text-blue-100 text-sm">
            {totalElements === 1 ? "1 account" : `${totalElements} accounts`} on the platform.
          </p>
        </div>
      </div>

      <div className="w-full px-6 md:px-10 lg:px-16 py-6">
        {error && (
          <p className="text-sm text-red-700 mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {loading && <p className="text-sm text-gray-600">Loading users...</p>}

        {!loading && users.length === 0 && !error && (
          <p className="text-sm text-gray-600">No users to show.</p>
        )}

        {!loading && users.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => {
                    const isSelf = currentUser?.id === user.id;
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {user.name || "—"}
                          {isSelf && (
                            <span className="ml-2 text-[11px] font-normal text-gray-400">(you)</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{user.email}</td>
                        <td className="px-4 py-3 text-gray-600">{user.phone || "—"}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-gray-700">{user.role}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                              user.enabled
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {user.enabled ? "Enabled" : "Disabled"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDisable(user)}
                            disabled={!user.enabled || isSelf || pendingId === user.id}
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
                                       text-red-700 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer
                                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-50"
                            title={
                              isSelf
                                ? "You cannot disable your own account"
                                : !user.enabled
                                ? "Account is already disabled"
                                : "Disable this account"
                            }
                          >
                            <Ban size={13} />
                            {pendingId === user.id ? "Disabling..." : "Disable"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-slate-50/60">
              <span className="text-xs text-gray-500">
                Page {page + 1} of {Math.max(totalPages, 1)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(Math.max(page - 1, 0))}
                  disabled={page === 0 || loading}
                  className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg
                             border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={13} />
                  Previous
                </button>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={isLast || loading}
                  className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg
                             border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsersPage;

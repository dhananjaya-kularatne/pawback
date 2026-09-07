import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import Navbar from "../components/Navbar";
import { getAdminProfile } from "../api/adminApi";

// Admin-only area. AdminRoute already gates the route on an ADMIN role, but we
// also call the protected /admin/me endpoint on mount so a token that isn't
// really an admin — or has gone stale — is caught server-side and bounced.
function AdminPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      try {
        const data = await getAdminProfile();
        if (!cancelled) setAdmin(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          navigate("/dashboard", { replace: true });
        }
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // Placeholders for the admin capabilities that land in their own stories
  // (user management, platform stats, scan-report moderation).
  const tools = [
    { title: "Users", body: "View and disable user accounts." },
    { title: "Platform stats", body: "Registrations, pets, and scan activity at a glance." },
    { title: "Scan reports", body: "Review and remove scan reports." },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Admin banner — its own blue band beneath the shared header */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="admin-paw-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#admin-paw-pattern)" />
          </svg>
        </div>

        <div className="relative w-full px-6 md:px-10 lg:px-16 py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-blue-100 mb-3">
            <Shield size={14} />
            Admin area
          </div>
          <h1 className="text-2xl font-semibold text-white mb-1">
            {admin?.name ? `Signed in as ${admin.name}` : "Admin console"}
          </h1>
          <p className="text-blue-100 text-sm">
            {admin?.email || "Elevated access — restricted to administrators."}
          </p>
        </div>
      </div>

      <div className="w-full px-6 md:px-10 lg:px-16 py-6">
        {error && <p className="text-sm text-red-700 mb-4">{error}</p>}

        <h2 className="text-lg font-medium text-gray-900 mb-4">Admin tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map(({ title, body }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 border-l-4 border-l-blue-700"
            >
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">{body}</p>
              <span className="inline-block text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                Coming soon
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  PawPrint,
  FileWarning,
  MapPin,
  ArrowRight,
} from "lucide-react";
import AdminLayout from "../components/admin/AdminLayout";
import { getAdminProfile, getAdminStats } from "../api/adminApi";

// A single summary tile. `value` is undefined until the stats request resolves,
// so it falls back to a dash rather than rendering "undefined".
function StatTile({ label, value, icon: Icon, accent }) {
  return (
    <div
      className="surface admin-stat"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon size={20} />
      </div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-3">
        {label}
      </p>
      <p className="text-3xl font-bold text-gray-900 tabular-nums mt-0.5">
        {value ?? "-"}
      </p>
    </div>
  );
}

// Admin console home. AdminRoute already gates the route on an ADMIN role, but we
// also call the protected /admin endpoints on mount so a token that isn't really
// an admin , or has gone stale , is caught server-side and bounced.
function AdminPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [, statsData] = await Promise.all([
          getAdminProfile(),
          getAdminStats(),
        ]);
        if (!cancelled) setStats(statsData);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          navigate("/dashboard", { replace: true });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const userTiles = [
    { label: "Total users", value: stats?.totalUsers, icon: Users, accent: "bg-blue-50 text-blue-600" },
    { label: "Active", value: stats?.activeUsers, icon: UserCheck, accent: "bg-emerald-50 text-emerald-600" },
    { label: "Disabled", value: stats?.disabledUsers, icon: UserX, accent: "bg-rose-50 text-rose-600" },
    { label: "Admins", value: stats?.admins, icon: ShieldCheck, accent: "bg-blue-50 text-blue-700" },
  ];

  const platformTiles = [
    { label: "Total pets", value: stats?.totalPets, icon: PawPrint, accent: "bg-blue-50 text-blue-700" },
    { label: "Total reports", value: stats?.totalReports, icon: FileWarning, accent: "bg-blue-50 text-blue-700" },
    { label: "Pets lost", value: stats?.lostPets, icon: MapPin, accent: "bg-rose-50 text-rose-600" },
  ];

  return (
    <AdminLayout title="Platform overview">
      {error && (
        <p className="text-sm text-red-700 mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <p className="admin-intro">Live counts across users, pets, and reports.</p>

      {/* People */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        People
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {userTiles.map((tile) => (
          <StatTile key={tile.label} {...tile} />
        ))}
      </div>

      {/* Pets & reports */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Pets &amp; reports
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {platformTiles.map((tile) => (
          <StatTile key={tile.label} {...tile} />
        ))}
      </div>

      {/* Primary action */}
      <div className="surface p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <Users size={20} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-gray-900">User management</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            View every registered account, and enable or disable who can sign in.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/users")}
          className="button-primary shrink-0"
        >
          Manage users
          <ArrowRight size={16} />
        </button>
      </div>
    </AdminLayout>
  );
}

export default AdminPage;

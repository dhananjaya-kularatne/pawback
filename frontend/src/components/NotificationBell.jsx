import { Bell } from "lucide-react";

// The header notification bell — shown on every signed-in view (the app pages
// and the landing page when logged in), so the header stays consistent.
export default function NotificationBell() {
  return (
    <button
      className="w-9 h-9 flex items-center justify-center rounded-full
                 hover:bg-white/10 text-white cursor-pointer transition-colors"
      aria-label="Notifications"
    >
      <Bell size={18} />
    </button>
  );
}

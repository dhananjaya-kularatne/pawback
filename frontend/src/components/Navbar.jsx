import AppHeader from "./AppHeader";
import AccountMenu from "./AccountMenu";
import NotificationBell from "./NotificationBell";

// Header for the authenticated pages — the shared AppHeader bar with a
// notification bell and the account menu in the right-hand slot.
function Navbar() {
  return (
    <AppHeader>
      <NotificationBell />
      <AccountMenu />
    </AppHeader>
  );
}

export default Navbar;

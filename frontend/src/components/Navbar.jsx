import AppHeader from "./AppHeader";
import AccountMenu from "./AccountMenu";

// Header for the authenticated pages — the shared AppHeader bar with a
// notification bell and the account menu in the right-hand slot.
function Navbar() {
  return (
    <AppHeader>
      <AccountMenu />
    </AppHeader>
  );
}

export default Navbar;

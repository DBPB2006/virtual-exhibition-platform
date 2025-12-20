import { ExhibitorNavbar } from "./navbars/ExhibitorNavbar";
import { VisitorNavbar } from "./navbars/VisitorNavbar";
import { PublicNavbar } from "./navbars/PublicNavbar";
import { AdminNavbar } from "./navbars/AdminNavbar";
import { useSelector } from 'react-redux';

// Determines and renders the appropriate navigation bar based on the user's authentication state and role
export function Navbar({ forceDark = false }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const userRole = user?.role;

  if (isAuthenticated && userRole === 'admin') {
    return <AdminNavbar forceDark={forceDark} />;
  }

  if (isAuthenticated && userRole === 'exhibitor') {
    return <ExhibitorNavbar forceDark={forceDark} />;
  }

  if (isAuthenticated) {
    return <VisitorNavbar forceDark={forceDark} />;
  }

  return <PublicNavbar forceDark={forceDark} />;
}

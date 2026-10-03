import { Outlet, useLocation } from "react-router-dom";

import TopNav from "./TopNav";
import BusinessSubNav from "./BusinessSubNav";
import { useTheme } from "../../hooks/useTheme";
import { getStoredUser } from "../../services/api";

/* Bu yollarda TopNav göstərilmir — hələ giriş/rol yoxdur */
const AUTH_PATHS = ["/", "/account-type", "/login", "/register"];

/*
 * "Rezerv et" qrupuna aid yollar — biznes hesabı bunlardan birində
 * olanda BusinessSubNav görünür. Dinamik /provider/:id və
 * /booking/:id yolları prefiksə görə yoxlanılır.
 */
const EXPLORE_GROUP_EXACT = ["/explore", "/search", "/saved", "/bookings"];
const EXPLORE_GROUP_PREFIXES = ["/provider/", "/booking"];

const isInExploreGroup = (pathname: string) =>
  EXPLORE_GROUP_EXACT.includes(pathname) ||
  EXPLORE_GROUP_PREFIXES.some((prefix) => pathname.startsWith(prefix));

function AppLayout() {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const hideNav = AUTH_PATHS.includes(location.pathname);

  const user = getStoredUser();
  const isBusiness = user?.role === "BUSINESS";
  const showBusinessSubNav =
    !hideNav && isBusiness && isInExploreGroup(location.pathname);

  return (
    <div className="app-shell">
      {!hideNav && (
        <TopNav isDark={isDark} toggleTheme={toggleTheme} />
      )}

      {showBusinessSubNav && <BusinessSubNav />}

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
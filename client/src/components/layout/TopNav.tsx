import { NavLink } from "react-router-dom";
import {
  Bookmark,
  CalendarDays,
  Compass,
  Home,
  Moon,
  Store,
  Sun,
  UserRound,
} from "lucide-react";

import { useTheme } from "../../hooks/useTheme";
import { getStoredUser } from "../../services/api";

function TopNav() {
  const { isDark, toggleTheme } = useTheme();

  const user = getStoredUser();
  const isBusiness = user?.role === "BUSINESS";

  /*
   * Business hesabı: Biznesim, Kəşf et, Rezervlər, Seçilmişlər, Profil.
   * User hesabı: Ana səhifə, Kəşf et, Rezervlər, Seçilmişlər, Profil.
   * Biznesim birinci gəlir, çünki business sahibinin əsas işi odur.
   */
  const navItems = [
    isBusiness
      ? { to: "/business", label: "Biznesim", icon: Store, end: false }
      : { to: "/", label: "Ana səhifə", icon: Home, end: true },
    { to: "/explore", label: "Kəşf et", icon: Compass, end: false },
    { to: "/bookings", label: "Rezervlər", icon: CalendarDays, end: false },
    { to: "/saved", label: "Seçilmişlər", icon: Bookmark, end: false },
    { to: "/profile", label: "Profil", icon: UserRound, end: false },
  ];

  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        <NavLink
          to={isBusiness ? "/business" : "/"}
          className="top-nav__brand"
        >
          AzLink
        </NavLink>

        <nav className="top-nav__links" aria-label="Əsas menyu">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `top-nav__link ${isActive ? "is-active" : ""}`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="top-nav__theme"
          onClick={toggleTheme}
          aria-label={isDark ? "Ağ moda keç" : "Qaranlıq moda keç"}
          title={isDark ? "Ağ moda keç" : "Qaranlıq moda keç"}
        >
          {isDark ? (
            <Sun size={18} strokeWidth={1.8} />
          ) : (
            <Moon size={18} strokeWidth={1.8} />
          )}
        </button>
      </div>
    </header>
  );
}

export default TopNav;
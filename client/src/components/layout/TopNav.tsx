import { NavLink } from "react-router-dom";
import {
  Bookmark,
  CalendarDays,
  Compass,
  Home,
  LayoutDashboard,
  Moon,
  Sun,
  UserRound,
} from "lucide-react";

import { getStoredUser } from "../../services/api";

interface TopNavProps {
  isDark: boolean;
  toggleTheme: () => void;
}

function TopNav({ isDark, toggleTheme }: TopNavProps) {
  const user = getStoredUser();
  const isBusiness = user?.role === "BUSINESS";

  const themeButton = (
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
  );

  if (isBusiness) {
    return (
      <header className="top-nav">
        <div className="top-nav__inner">
          <NavLink to="/business" className="top-nav__brand">
            AzLink
          </NavLink>

          <nav className="top-nav__links" aria-label="Əsas menyu">
            <NavLink
              to="/business"
              className={({ isActive }) =>
                `top-nav__link ${isActive ? "is-active" : ""}`
              }
            >
              <LayoutDashboard size={18} strokeWidth={1.8} />
              <span>Biznesim</span>
            </NavLink>

            <NavLink
              to="/explore"
              className={({ isActive }) =>
                `top-nav__link ${isActive ? "is-active" : ""}`
              }
            >
              <Compass size={18} strokeWidth={1.8} />
              <span>Rezerv et</span>
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `top-nav__link ${isActive ? "is-active" : ""}`
              }
            >
              <UserRound size={18} strokeWidth={1.8} />
              <span>Profil</span>
            </NavLink>
          </nav>

          {themeButton}
        </div>
      </header>
    );
  }

  const navItems = [
    { to: "/home", label: "Ana səhifə", icon: Home, end: true },
    { to: "/explore", label: "Kəşf et", icon: Compass, end: false },
    { to: "/bookings", label: "Rezervlər", icon: CalendarDays, end: false },
    { to: "/saved", label: "Seçilmişlər", icon: Bookmark, end: false },
    { to: "/profile", label: "Profil", icon: UserRound, end: false },
  ];

  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        <NavLink to="/home" className="top-nav__brand">
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

        {themeButton}
      </div>
    </header>
  );
}

export default TopNav;
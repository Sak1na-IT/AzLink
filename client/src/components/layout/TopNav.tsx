import { NavLink } from "react-router-dom";
import {
  Bookmark,
  CalendarDays,
  Compass,
  Home,
  Moon,
  Sun,
  UserRound,
} from "lucide-react";

import { useTheme } from "../../hooks/useTheme";

const navItems = [
  {
    to: "/",
    label: "Ana səhifə",
    icon: Home,
  },
  {
    to: "/explore",
    label: "Kəşf et",
    icon: Compass,
  },
  {
    to: "/bookings",
    label: "Rezervlər",
    icon: CalendarDays,
  },
  {
    to: "/saved",
    label: "Seçilmişlər",
    icon: Bookmark,
  },
  {
    to: "/profile",
    label: "Profil",
    icon: UserRound,
  },
];

function TopNav() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        <NavLink to="/" className="top-nav__brand">
          AzLink
        </NavLink>

        <nav className="top-nav__links" aria-label="Əsas menyu">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
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
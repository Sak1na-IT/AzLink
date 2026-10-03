import { NavLink } from "react-router-dom";
import { Bookmark, CalendarCheck, Compass } from "lucide-react";
import "./BusinessSubNav.css";

/*
 * Yalnız biznes hesabı "Rezerv et" qrupunda olanda görünür:
 * /explore, /search, /provider/:id, /booking*, /saved, /bookings.
 * Əsas 3 düymənin (Biznesim/Rezerv et/Profil) altında, ikinci
 * səviyyə naviqasiyadır.
 *
 * BusinessLayout-un pilyul-tab stili ilə eyniləşdirilib:
 * konturlu çip, aktiv olanda dolu yaşıl fon + ağ mətn.
 */
function BusinessSubNav() {
  return (
    <div className="business-subnav">
      <div className="business-subnav__inner">
        <span className="business-subnav__title">Rezerv et</span>

        <nav className="business-subnav__tabs" aria-label="Rezerv et menyusu">
          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `business-subnav__tab ${isActive ? "is-active" : ""}`
            }
          >
            <Compass size={16} strokeWidth={1.8} />
            <span>Kəşf et</span>
          </NavLink>

          <NavLink
            to="/saved"
            className={({ isActive }) =>
              `business-subnav__tab ${isActive ? "is-active" : ""}`
            }
          >
            <Bookmark size={16} strokeWidth={1.8} />
            <span>Seçilmişlər</span>
          </NavLink>

          <NavLink
            to="/bookings"
            className={({ isActive }) =>
              `business-subnav__tab ${isActive ? "is-active" : ""}`
            }
          >
            <CalendarCheck size={16} strokeWidth={1.8} />
            <span>Mənim rezervlərim</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
}

export default BusinessSubNav;

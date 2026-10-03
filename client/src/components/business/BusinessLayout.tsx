import { NavLink, Outlet } from "react-router-dom";

import "./BusinessLayout.css";

const tabs = [
  { to: "/business", label: "Dashboard", end: true },
  { to: "/business/profile", label: "Profil", end: false },
  { to: "/business/services", label: "Xidmətlər", end: false },
  { to: "/business/bookings", label: "Rezervlər", end: false },
  { to: "/business/portfolio", label: "Portfolio", end: false },
  { to: "/business/reviews", label: "Rəylər", end: false },
  { to: "/business/customers", label: "Müştərilər", end: false },
  { to: "/business/hours", label: "İş saatları", end: false },
];

function BusinessLayout() {
  return (
    <div className="business-layout">
      <div className="business-layout__subnav-inner">
        <span className="business-layout__title">Biznesim</span>

        <nav className="business-layout__tabs" aria-label="Biznesim menyusu">
          {tabs.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `business-layout__tab ${isActive ? "is-active" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <Outlet />
    </div>
  );
}

export default BusinessLayout;
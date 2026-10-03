import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  Store,
  CalendarDays,
  ImagePlus,
  Star,
  Users,
  Clock3,
} from "lucide-react";

import "./BusinessLayout.css";

const tabs = [
  { to: "/business", label: "Dashboard", end: true, icon: LayoutDashboard },
  { to: "/business/profile", label: "Profil", end: false, icon: Settings },
  { to: "/business/services", label: "Xidmətlər", end: false, icon: Store },
  {
    to: "/business/bookings",
    label: "Rezervlər",
    end: false,
    icon: CalendarDays,
  },
  {
    to: "/business/portfolio",
    label: "Portfolio",
    end: false,
    icon: ImagePlus,
  },
  { to: "/business/reviews", label: "Rəylər", end: false, icon: Star },
  { to: "/business/customers", label: "Müştərilər", end: false, icon: Users },
  { to: "/business/hours", label: "İş saatları", end: false, icon: Clock3 },
];

function BusinessLayout() {
  return (
    <div className="business-layout">
      <div className="business-layout__subnav-inner">
        <span className="business-layout__title">Biznesim</span>

        <nav className="business-layout__tabs" aria-label="Biznesim menyusu">
          {tabs.map(({ to, label, end, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `business-layout__tab ${isActive ? "is-active" : ""}`
              }
            >
              <Icon size={16} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <Outlet />
    </div>
  );
}

export default BusinessLayout;
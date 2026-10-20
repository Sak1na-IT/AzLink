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
import "./BusinessTheme.css";
import { t } from "../../i18n";

const tabs = [
  { to: "/business", label: t("Dashboard"), end: true, icon: LayoutDashboard },
  { to: "/business/profile", label: t("Profil"), end: false, icon: Settings },
  { to: "/business/services", label: t("Xidmətlər"), end: false, icon: Store },
  {
    to: "/business/bookings",
    label: t("Rezervlər"),
    end: false,
    icon: CalendarDays,
  },
  {
    to: "/business/portfolio",
    label: t("Portfolio"),
    end: false,
    icon: ImagePlus,
  },
  { to: "/business/reviews", label: t("Rəylər"), end: false, icon: Star },
  { to: "/business/customers", label: t("Müştərilər"), end: false, icon: Users },
  { to: "/business/hours", label: t("İş saatları"), end: false, icon: Clock3 },
];

function BusinessLayout() {
  return (
    <div className="business-layout">
      <div className="business-layout__subnav-inner">
        <span className="business-layout__title">{t("Biznesim")}</span>

        <nav className="business-layout__tabs" aria-label={t("Biznesim menyusu")}>
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
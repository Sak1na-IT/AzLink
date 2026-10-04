import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";

import { isLoggedIn, getStoredUser } from "../services/api";

interface ProtectedRouteProps {
  children: ReactElement;
  /*
   * Verilməzsə, yalnız giriş tələb olunur (hər iki rol üçün açıqdır).
   * Bunu /explore, /provider/:id, /booking*, /bookings, /saved kimi
   * səhifələrdə istifadə et — biznes hesabı da başqa ustaya rezerv
   * edə bilməlidir, ona görə bu səhifələr rola görə bloklanmır.
   *
   * role="BUSINESS" verilsə, yalnız biznes hesabı keçə bilər —
   * bunu yalnız /business/* səhifələrində istifadə et.
   */
  role?: "USER" | "BUSINESS";
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  if (!isLoggedIn()) {
    return <Navigate to="/account-type" replace />;
  }

  const user = getStoredUser();

  if (role && user?.role !== role) {
    /*
     * Yalnız bu istiqamətdə (istifadəçi hesabı biznes panelinə
     * girməyə cəhd edəndə) görünən xəbərdarlıq göstəririk —
     * əks istiqamətdə (biznes hesabı gəzinti/rezerv səhifələrinə
     * girəndə) bu keçid artıq bloklanmır, ona görə bura heç düşmür.
     */
    if (role === "BUSINESS" && user?.role === "USER") {
      alert(
        "Bu hesab istifadəçi hesabı kimi qeydiyyatdan keçib. Biznes panelinə daxil olmaq üçün biznes hesabı ilə daxil olun."
      );
    }

    return (
      <Navigate
        to={user?.role === "BUSINESS" ? "/business" : "/home"}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;

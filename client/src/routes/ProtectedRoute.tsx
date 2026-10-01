import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";

import { isLoggedIn, getStoredUser } from "../services/api";

interface ProtectedRouteProps {
  children: ReactElement;
  /*
   * Verilməzsə, yalnız giriş tələb olunur (hər iki rol üçün açıqdır).
   * Verilsə, yalnız həmin rol icazəlidir — digər rol öz əsas
   * səhifəsinə yönləndirilir.
   */
  role?: "USER" | "BUSINESS";
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  if (!isLoggedIn()) {
    return <Navigate to="/account-type" replace />;
  }

  const user = getStoredUser();

  if (role && user?.role !== role) {
    return (
      <Navigate to={user?.role === "BUSINESS" ? "/business" : "/"} replace />
    );
  }

  return children;
};

export default ProtectedRoute;
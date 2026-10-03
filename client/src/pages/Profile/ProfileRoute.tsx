import { getStoredUser } from "../../services/api";
import BusinessAccountProfile from "./BusinessAccountProfile";
import Profile from "./Profile";

/*
 * /profile: business hesabı yeni şəxsi profil səhifəsini görür,
 * user hesabı isə əvvəlki Profile səhifəsini (dəyişməyib).
 */
function ProfileRoute() {
  const isBusiness = getStoredUser()?.role === "BUSINESS";

  return isBusiness ? <BusinessAccountProfile /> : <Profile />;
}

export default ProfileRoute;
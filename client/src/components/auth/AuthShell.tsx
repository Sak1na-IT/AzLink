import type { ReactNode } from "react";

import { t } from "../../i18n";
import "./AuthShell.css";

/*
 * Giriş və qeydiyyat səhifələrinin ortaq görünüşü: arxada ana
 * səhifənin şəkli (qaranlıq rejimdə gecə Bakısı və Alov qüllələri,
 * ağ rejimdə ağ şüşə xəritə), ortada şüşə kart, altında qısa faydalar.
 * Müştəri və biznes üçün eynidir.
 */
function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell">
      <div className="auth-shell__backdrop" aria-hidden="true" />

      <div className="auth-shell__content">
        {children}

        <ul className="auth-shell__perks">
          <li>{t("Pulsuz qeydiyyat")}</li>
          <li>{t("Real rəylər")}</li>
          <li>{t("Onlayn rezerv")}</li>
        </ul>
      </div>
    </div>
  );
}

export default AuthShell;

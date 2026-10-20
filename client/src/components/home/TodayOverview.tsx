import { t } from "../../i18n";

interface TodayOverviewProps {
  verifiedProfiles: number;
  totalProfiles: number;
  highlyRated: number;
}

function TodayOverview({
  verifiedProfiles,
  totalProfiles,
  highlyRated,
}: TodayOverviewProps) {
  return (
    <section className="home-section">
      <div className="home-section__header">
        <h2>{t("Platforma")}</h2>
      </div>

      <div className="today-overview">
        <div className="today-overview__text">
          <strong>
            {t("Platformada hazırda xidmət göstərən profillər")}
          </strong>
        </div>

        <div className="today-overview__stats">
          <div>
            <strong>{totalProfiles}</strong>
            <span>{t("Aktiv profil")}</span>
          </div>

          <div>
            <strong>{verifiedProfiles}</strong>
            <span>{t("Təsdiqlənmiş profil")}</span>
          </div>

          <div>
            <strong>{highlyRated}</strong>
            <span>{t("4.5+ reytinqli profil")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TodayOverview;
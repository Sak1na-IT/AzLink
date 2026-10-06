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
        <h2>Platforma</h2>
      </div>

      <div className="today-overview">
        <div className="today-overview__text">
          <strong>
            Platformada hazırda xidmət göstərən profillər
          </strong>
        </div>

        <div className="today-overview__stats">
          <div>
            <strong>{totalProfiles}</strong>
            <span>Aktiv profil</span>
          </div>

          <div>
            <strong>{verifiedProfiles}</strong>
            <span>Təsdiqlənmiş profil</span>
          </div>

          <div>
            <strong>{highlyRated}</strong>
            <span>4.5+ reytinqli profil</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TodayOverview;
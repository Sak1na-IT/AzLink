interface TodayOverviewProps {
  verifiedProfiles: number;
  availableToday: number;
  highlyReviewed: number;
}

function TodayOverview({
  verifiedProfiles,
  availableToday,
  highlyReviewed,
}: TodayOverviewProps) {
  return (
    <section className="home-section">
      <div className="home-section__header">
        <h2>Bu gün</h2>
      </div>

      <div className="today-overview">
        <div className="today-overview__text">
          <strong>
            Platformada hazırda xidmət göstərən
            profillər və boş vaxtlar
          </strong>
        </div>

        <div className="today-overview__stats">
          <div>
            <strong>{verifiedProfiles}</strong>
            <span>Təsdiqlənmiş profil</span>
          </div>

          <div>
            <strong>{availableToday}</strong>
            <span>Bu gün boş vaxt</span>
          </div>

          <div>
            <strong>{highlyReviewed}</strong>
            <span>100+ rəyli profil</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TodayOverview;
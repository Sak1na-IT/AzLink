interface OverviewStripProps {
  serviceAreas: number;
  profiles: number;
  upcomingBookings: number;
}

function OverviewStrip({
  serviceAreas,
  profiles,
  upcomingBookings,
}: OverviewStripProps) {
  return (
    <section className="overview-strip">
      <div className="overview-strip__item">
        <strong>{serviceAreas}</strong>
        <span>Xidmət sahəsi</span>
      </div>

      <div className="overview-strip__item">
        <strong>{profiles}</strong>
        <span>Profil</span>
      </div>

      <div className="overview-strip__item">
        <strong>{upcomingBookings}</strong>
        <span>Gələcək rezerv</span>
      </div>
    </section>
  );
}

export default OverviewStrip;
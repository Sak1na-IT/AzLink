import { CalendarCheck, Search, Users } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Xidmət və ərazini müəyyən edin",
    description: "Axtarışdan və ya Kəşf et bölməsindən başlayın.",
  },
  {
    icon: Users,
    title: "Uyğun profillərə baxın",
    description: "Qiymət, reytinq, rəylər və xidmət məlumatlarını nəzərdən keçirin.",
  },
  {
    icon: CalendarCheck,
    title: "Uyğun vaxtı seçin",
    description: "Boş tarix və saatlardan birini seçərək rezervinizi tamamlayın.",
  },
];

function HowItWorks() {
  return (
    <section className="home-section">
      <div className="home-section__header">
        <h2>Necə işləyir?</h2>
      </div>

      <div className="how-it-works">
        {steps.map(({ icon: Icon, title, description }, index) => (
          <div className="how-it-works__item" key={title}>
            <div className="how-it-works__head">
              <div className="how-it-works__number">{index + 1}</div>
              <Icon
                className="how-it-works__icon"
                size={20}
                strokeWidth={1.7}
              />
            </div>

            <div>
              <strong>{title}</strong>
              <p>{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;
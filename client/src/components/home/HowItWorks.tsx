const steps = [
  {
    title: "Xidmət və ərazini müəyyən edin",
    description: "Axtarışdan və ya Kəşf et bölməsindən başlayın.",
  },
  {
    title: "Uyğun profillərə baxın",
    description: "Qiymət, reytinq, rəylər və xidmət məlumatlarını nəzərdən keçirin.",
  },
  {
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
        {steps.map((step, index) => (
          <div className="how-it-works__item" key={step.title}>
            <div className="how-it-works__number">{index + 1}</div>

            <div>
              <strong>{step.title}</strong>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;
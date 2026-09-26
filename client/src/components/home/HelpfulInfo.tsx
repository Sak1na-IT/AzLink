import { useState } from "react";
import { ArrowRight, X } from "lucide-react";

interface HelpItem {
  title: string;
  description: string;
  content: string;
}

const items: HelpItem[] = [
  {
    title: "Profilə baxarkən nələrə diqqət etməli?",
    description:
      "Reytinq, rəylər, xidmətlər və qiymət məlumatlarını necə oxumaq olar.",
    content: `Bir profilə baxarkən ilk növbədə reytinqə və rəylərin sayına diqqət edin — yüksək reytinq az sayda rəylə hələ etibarlılığı təsdiqləmir.

Profildəki xidmətlər siyahısını nəzərdən keçirin: hər xidmətin qiyməti, müddəti və təsviri aydın göstərilməlidir.

"Təsdiqlənib" nişanı olan profillər platforma tərəfindən yoxlanılıb. Bu, əlavə etibarlılıq göstəricisidir, amma yenə də rəyləri oxumaq tövsiyə olunur.

Ərazi və məsafə məlumatına da baxın — profilin sizə nə qədər yaxın olduğunu göstərir.`,
  },
  {
    title: "Xidmət qiymətləri necə göstərilir?",
    description:
      "Başlayan qiymət və xidmət üzrə dəqiq məbləğ arasındakı fərq.",
    content: `Provider kartlarında gördüyünüz qiymət (məsələn "20 ₼-dən") ən ucuz xidmətin başlanğıc qiymətidir.

Dəqiq məbləğ profil səhifəsindəki xidmətlər siyahısında göstərilir — hər xidmətin öz qiyməti və müddəti ayrıca qeyd olunur.

Son qiymət seçdiyiniz konkret xidmətdən, əlavə tələblərdən və bəzən ərazidən asılı olaraq dəyişə bilər. Rezerv etməzdən əvvəl provider ilə dəqiqləşdirməyiniz tövsiyə olunur.`,
  },
  {
    title: "Rezervdən əvvəl nəyi yoxlamaq olar?",
    description:
      "Tarix, saat, xidmət müddəti və əlavə ödənişləri əvvəlcədən nəzərdən keçirin.",
    content: `Rezerv etməzdən əvvəl bu məqamları yoxlayın:

- Tarix və saatın sizə uyğun olduğundan əmin olun.
- Xidmətin təxmini müddətini nəzərə alın ki, planınıza uyğun gəlsin.
- Əlavə ödəniş tələb edən xidmətlər (məsələn material, nəqliyyat haqqı) varsa, əvvəlcədən öyrənin.
- Ləğvetmə şərtlərini yoxlayın — bəzi providerlər son anda ləğv üçün qaydalar qoyur.

Bu detalları əvvəlcədən aydınlaşdırmaq narahatlığın qarşısını alır.`,
  },
];

function HelpfulInfo() {
  const [activeItem, setActiveItem] = useState<HelpItem | null>(null);

  return (
    <section className="home-section">
      <div className="home-section__header">
        <h2>Faydalı məlumatlar</h2>
      </div>

      <div className="helpful-info">
        {items.map((item) => (
          <div className="helpful-info__card" key={item.title}>
            <strong>{item.title}</strong>
            <p>{item.description}</p>

            <button
              type="button"
              className="helpful-info__link"
              onClick={() => setActiveItem(item)}
            >
              Oxumağa bax
              <ArrowRight size={14} strokeWidth={1.8} />
            </button>
          </div>
        ))}
      </div>

      {activeItem && (
        <div
          className="helpful-modal-overlay"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="helpful-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="helpful-modal__header">
              <strong>{activeItem.title}</strong>
              <button
                type="button"
                className="helpful-modal__close"
                onClick={() => setActiveItem(null)}
                aria-label="Bağla"
              >
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>

            <div className="helpful-modal__body">
              {activeItem.content
                .split("\n\n")
                .map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default HelpfulInfo;
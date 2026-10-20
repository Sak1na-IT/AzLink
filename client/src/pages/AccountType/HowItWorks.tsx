import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check, MapPin, Search, Star } from "lucide-react";

import { t } from "../../i18n";
import type { Provider } from "../../types/provider";
import { formatDayMonth, weekdayShort } from "../../utils/formatDate";

/*
 * "Rezerv 4 addımda": solda addımlar, sağda sabit qalan telefon
 * ekranı. Aşağı sürüşdürdükcə ekran həmin addımı canlı göstərir:
 * axtarış yazılır, kartlar çıxır, saat seçilir, təsdiq gəlir.
 */

const STEPS = [
  {
    title: t("Xidməti axtarın"),
    text: t(
      "Nə lazım olduğunu və ərazinizi yazın: manikür Nərimanovda, kran təmiri Yasamalda, riyaziyyat dərsi Nəsimidə."
    ),
  },
  {
    title: t("Ustaları müqayisə edin"),
    text: t(
      "Hər profildə qiymətlər, xidmətlər, iş nümunələri və müştəri rəyləri açıq görünür. Zəng edib soruşmağa ehtiyac qalmır."
    ),
  },
  {
    title: t("Boş saatı seçin"),
    text: t(
      "Ustanın iş qrafiki və dolu saatları görünür. Sizə uyğun günü və saatı seçib rezerv edirsiniz."
    ),
  },
  {
    title: t("Təsdiq alın"),
    text: t(
      "Usta rezervi təsdiqləyəndə bildiriş gəlir. Xidmətdən sonra rəy yazırsınız və növbəti müştərilərə kömək edirsiniz."
    ),
  },
];

const SLOTS = ["10:00", "11:30", "13:00", "15:30", "17:00", "18:30"];

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/* Sabahdan başlayaraq Bazar günü olmayan 5 gün */
const nextWorkdays = () => {
  const days: Date[] = [];
  const cursor = new Date();

  while (days.length < 5) {
    cursor.setDate(cursor.getDate() + 1);
    if (cursor.getDay() !== 0) days.push(new Date(cursor));
  }

  return days;
};

const toKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

interface HowItWorksProps {
  providers: Provider[];
}

function HowItWorks({ providers }: HowItWorksProps) {
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [local, setLocal] = useState(0);

  const reduceMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      let current = 0;
      let currentLocal = 0;
      let closest = Infinity;

      stepRefs.current.forEach((element, index) => {
        if (!element) return;

        const box = element.getBoundingClientRect();
        const center = box.top + box.height / 2;
        const distance = Math.abs(center - viewport / 2);

        if (distance < closest) {
          closest = distance;
          current = index;
          currentLocal = clamp((viewport * 0.85 - center) / (viewport * 0.55));
        }
      });

      setActive(current);
      setLocal((previous) =>
        Math.abs(previous - currentLocal) > 0.02 || currentLocal === 0 || currentLocal === 1
          ? currentLocal
          : previous
      );
    };

    const handleScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const step = reduceMotion ? 1 : local;

  /* Real bizneslər: əvvəl Nail by Aysel, sonra reytinqə görə */
  const featured = useMemo(() => {
    const sorted = [...providers].sort(
      (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount
    );
    const aysel = sorted.find((provider) => provider.name === "Nail by Aysel");
    const rest = sorted.filter((provider) => provider !== aysel);

    return (aysel ? [aysel, ...rest] : rest).slice(0, 3);
  }, [providers]);

  const hero = featured[0];
  const days = useMemo(nextWorkdays, []);
  const serviceName = hero?.services[0]?.name ?? t("Xidmət");

  /* Addım ekranın ortasına çatanda (step ≈ 0.6) nümayiş tamamlanır */
  const query = t("gel lak Nərimanov");
  const typed = query.slice(0, Math.round(clamp(step * 2) * query.length));
  const selectedSlot = Math.min(SLOTS.length - 1, Math.floor(step * 1.75 * SLOTS.length));

  return (
    <div className="how">
      <ol className="how__steps">
        {STEPS.map((item, index) => (
          <li
            key={item.title}
            ref={(element) => {
              stepRefs.current[index] = element;
            }}
            className={index === active ? "how__step is-active" : "how__step"}
          >
            <span className="how__number">{index + 1}</span>
            <div className="landing-glass how__card">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="how__device-wrap">
        <div className="how-device" aria-hidden="true">
          <div className="how-device__bar">
            <span>AzLink</span>
            <span className="how-device__bell">
              <Bell size={15} strokeWidth={1.8} />
              {active >= 3 && <i>1</i>}
            </span>
          </div>

          {/* 1. Axtarış */}
          <div className={active === 0 ? "how-screen is-shown" : "how-screen"}>
            <div className="how-search">
              <Search size={16} strokeWidth={1.8} />
              <span>
                {typed}
                <b className="how-caret" />
              </span>
            </div>

            <ul className="how-results">
              {featured.map((provider, index) => (
                <li
                  key={provider.id}
                  style={{ opacity: step > 0.42 + index * 0.08 ? 1 : 0 }}
                >
                  <strong>{provider.name}</strong>
                  <span>
                    <MapPin size={12} strokeWidth={1.8} />
                    {provider.area}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. Müqayisə */}
          <div className={active === 1 ? "how-screen is-shown" : "how-screen"}>
            {featured.map((provider, index) => (
              <div key={provider.id} className={index === 0 ? "how-card is-best" : "how-card"}>
                <div>
                  <strong>{provider.name}</strong>
                  <span>{t(provider.service)}</span>
                </div>

                <div className="how-card__meta">
                  <span className="how-card__rating">
                    <Star size={12} strokeWidth={1.8} fill="currentColor" />
                    {provider.rating}
                  </span>
                  <span>{t("{count} rəy", { count: provider.reviewCount })}</span>
                  <b>{t("{price} ₼-dən", { price: provider.priceFrom })}</b>
                </div>
              </div>
            ))}
          </div>

          {/* 3. Saat seçimi */}
          <div className={active === 2 ? "how-screen is-shown" : "how-screen"}>
            <p className="how-screen__title">{serviceName}</p>

            <div className="how-days">
              {days.map((day, index) => (
                <span key={toKey(day)} className={index === 1 ? "is-picked" : ""}>
                  <small>{weekdayShort(day)}</small>
                  {day.getDate()}
                </span>
              ))}
            </div>

            <div className="how-slots">
              {SLOTS.map((slot, index) => (
                <span key={slot} className={index === selectedSlot ? "is-picked" : ""}>
                  {slot}
                </span>
              ))}
            </div>

            <span
              className={
                selectedSlot === SLOTS.length - 1 ? "how-confirm is-ready" : "how-confirm"
              }
            >
              {t("Rezervi təsdiqlə")}
            </span>
          </div>

          {/* 4. Təsdiq */}
          <div className={active === 3 ? "how-screen is-shown" : "how-screen"}>
            <div className="how-notice">
              <span className="how-notice__icon">
                <Check size={16} strokeWidth={2.2} />
              </span>
              <p>
                {t("{name} rezervinizi təsdiqlədi: {service} · {date}, 18:30.", {
                  name: hero?.name ?? "Nail by Aysel",
                  service: serviceName,
                  date: formatDayMonth(toKey(days[1])),
                })}
              </p>
            </div>

            <div className="how-review">
              <span className="how-review__stars">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star key={value} size={15} strokeWidth={1.6} fill="currentColor" />
                ))}
              </span>
              <span>{t("Xidmətdən sonra rəy yazın")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;

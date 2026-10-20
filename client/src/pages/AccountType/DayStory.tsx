import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CalendarCheck,
  Check,
  MapPin,
  Search,
  Star,
} from "lucide-react";

import GoldDust from "../../components/brand/GoldDust";
import { t } from "../../i18n";
import type { Provider } from "../../types/provider";
import { formatDayMonth, weekdayShort } from "../../utils/formatDate";
import "./DayStory.css";

/*
 * "Bakıda bir gün": aşağı sürüşdürdükcə arxada işıqlı bir gün keçir
 * (səhər → günorta → qızıl saat → çəhrayı axşam → alaqaranlıq),
 * günəş Xəzərin üfüqü üzərində qövslə hərəkət edib batır. Solda
 * hekayə, sağda həmin addımın canlı nümayişi.
 */

type Scene = "dawn" | "noon" | "golden" | "rose" | "twilight";

interface Chapter {
  time: string;
  scene: Scene;
  title: string;
  text: string;
}

const CHAPTERS: Chapter[] = [
  {
    time: "09:12",
    scene: "dawn",
    title: t("Ehtiyacınızı yazın"),
    text: t(
      "Səhər qəhvəsi ilə ağlınıza gəldi: dırnaqlar, kran, uşağın riyaziyyatı. Xidməti və ərazini yazın, AzLink Bakıda bu işi görən ustaları göstərir."
    ),
  },
  {
    time: "12:40",
    scene: "noon",
    title: t("Müqayisə edin"),
    text: t(
      "Nahar fasiləsində profillərə baxın: qiymətlər, xidmətlər, iş nümunələri və real müştərilərin rəyləri bir yerdədir. Zəng edib soruşmağa ehtiyac yoxdur."
    ),
  },
  {
    time: "18:30",
    scene: "golden",
    title: t("Boş saatı seçin"),
    text: t(
      "Ustanın iş qrafiki və dolu saatları görünür. Sizə uyğun vaxtı seçin, bir toxunuşla rezerv edin."
    ),
  },
  {
    time: "19:40",
    scene: "rose",
    title: t("Usta təsdiqləyir"),
    text: t(
      "Usta rezervi təsdiqləyəndə bildiriş gəlir. Xidmətdən sonra rəy yazırsınız, növbəti müştərilər də sizin təcrübənizdən öyrənir."
    ),
  },
  {
    time: "21:00",
    scene: "twilight",
    title: t("Ustalar üçün də"),
    text: t(
      "Biznes sahibi sabahın rezervlərini bir paneldə görür: yeni sorğuları təsdiqləyir, xidmətlərini və iş saatlarını idarə edir, müştərilərini tanıyır."
    ),
  },
];

/* Nümayişdə rezerv olunan saatlar: seçim 18:30-da dayanır */
const SLOTS = ["10:00", "11:30", "13:00", "15:30", "17:00", "18:30"];

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

/* Bu gündən başlayaraq Bazar günü olmayan 5 gün */
const nextWorkdays = () => {
  const days: Date[] = [];
  const cursor = new Date();

  while (days.length < 5) {
    cursor.setDate(cursor.getDate() + 1);

    if (cursor.getDay() !== 0) {
      days.push(new Date(cursor));
    }
  }

  return days;
};

const toKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

interface DayStoryProps {
  providers: Provider[];
}

function DayStory({ providers }: DayStoryProps) {
  const rootRef = useRef<HTMLElement>(null);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);

  const [active, setActive] = useState(0);
  /* Aktiv fəslin içində irəliləmə (0–1): yazı, saat seçimi üçün */
  const [local, setLocal] = useState(0);

  const reduceMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    const root = rootRef.current;

    if (!root) return;

    let frame = 0;

    const update = () => {
      frame = 0;

      const rect = root.getBoundingClientRect();
      const viewport = window.innerHeight;
      const total = Math.max(1, rect.height - viewport);
      const progress = clamp(-rect.top / total);

      /* Günəş: soldan sağa qövs, sonda üfüqdə batır */
      const dayProgress = clamp(progress / 0.8);
      const sunX = 8 + dayProgress * 84;
      const sunY = 72 - Math.sin(dayProgress * Math.PI) * 52;

      /* Ay: alaqaranlıqda soldan yuxarı qalxır */
      const nightProgress = clamp((progress - 0.75) / 0.25);
      const moonX = 22 + nightProgress * 50;
      const moonY = 58 - nightProgress * 34;

      root.style.setProperty("--sun-x", `${sunX}%`);
      root.style.setProperty("--sun-y", `${sunY}%`);
      root.style.setProperty("--moon-x", `${moonX}%`);
      root.style.setProperty("--moon-y", `${moonY}%`);

      /*
       * Mərkəzi ekranın ortasına ən yaxın olan fəsil aktivdir.
       * Fəslin içində irəliləmə: mərkəzi ekranın 85%-dən 30%-nə
       * qalxdıqca 0-dan 1-ə artır.
       */
      let current = 0;
      let currentLocal = 0;
      let closest = Infinity;

      chapterRefs.current.forEach((element, index) => {
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
      /* Hər kadrda yox, yalnız nəzərəçarpan dəyişiklikdə yenilə */
      setLocal((previous) =>
        Math.abs(previous - currentLocal) > 0.02 || currentLocal === 1 || currentLocal === 0
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

  const scene = CHAPTERS[active].scene;
  const step = reduceMotion ? 1 : local;

  /* Nümayiş üçün real bizneslər: əvvəl Nail by Aysel, sonra reytinqə görə */
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

  const query = t("gel lak Nərimanov");
  /* Fəsil ekranın ortasına çatanda (step ≈ 0.6) nümayiş tamamlanır */
  const typed = query.slice(0, Math.round(clamp(step * 2) * query.length));
  const selectedSlot = Math.min(SLOTS.length - 1, Math.floor(step * 1.75 * SLOTS.length));

  return (
    <section
      ref={rootRef}
      className="day-story"
      data-scene={scene}
      aria-label={t("AzLink necə işləyir")}
    >
      {/* ---------- Arxa fon: göy, günəş/ay, dəniz ---------- */}
      <div className="day-story__sky" aria-hidden="true">
        <div className="day-sky day-sky--dawn" />
        <div className="day-sky day-sky--noon" />
        <div className="day-sky day-sky--golden" />
        <div className="day-sky day-sky--rose" />
        <div className="day-sky day-sky--twilight" />

        <div className="day-sun" />
        <div className="day-moon" />

        <div className="day-sea">
          <div className="day-sea__glint" />
        </div>

        <div className="day-story__dust">
          <GoldDust count={28} />
        </div>
      </div>

      <div className="day-story__grid">
        {/* ---------- Hekayə ---------- */}
        <div className="day-story__chapters">
          {CHAPTERS.map((chapter, index) => (
            <article
              key={chapter.time}
              ref={(element) => {
                chapterRefs.current[index] = element;
              }}
              className={
                index === active ? "day-chapter is-active" : "day-chapter"
              }
            >
              <time className="day-chapter__time">{chapter.time}</time>
              <h2>{chapter.title}</h2>
              <p>{chapter.text}</p>
            </article>
          ))}
        </div>

        {/* ---------- Canlı nümayiş (illüstrasiya) ---------- */}
        <div className="day-story__device-wrap">
          <div className="day-device" aria-hidden="true">
            <div className="day-device__bar">
              <span>AzLink</span>
              <span className="day-device__bell">
                <Bell size={15} strokeWidth={1.8} />
                {active >= 3 && <i>1</i>}
              </span>
            </div>

            {/* 1. Axtarış */}
            <div className={active === 0 ? "day-screen is-shown" : "day-screen"}>
              <div className="day-search">
                <Search size={16} strokeWidth={1.8} />
                <span>
                  {typed}
                  <b className="day-caret" />
                </span>
              </div>

              <ul className="day-results">
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
            <div className={active === 1 ? "day-screen is-shown" : "day-screen"}>
              {featured.map((provider, index) => (
                <div
                  key={provider.id}
                  className={index === 0 ? "day-card is-best" : "day-card"}
                >
                  <div>
                    <strong>{provider.name}</strong>
                    <span>{t(provider.service)}</span>
                  </div>

                  <div className="day-card__meta">
                    <span className="day-card__rating">
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
            <div className={active === 2 ? "day-screen is-shown" : "day-screen"}>
              <p className="day-screen__title">{hero?.services[0]?.name ?? t("Xidmət")}</p>

              <div className="day-days">
                {days.map((day, index) => (
                  <span key={toKey(day)} className={index === 1 ? "is-picked" : ""}>
                    <small>{weekdayShort(day)}</small>
                    {day.getDate()}
                  </span>
                ))}
              </div>

              <div className="day-slots">
                {SLOTS.map((slot, index) => (
                  <span
                    key={slot}
                    className={index === selectedSlot ? "is-picked" : ""}
                  >
                    {slot}
                  </span>
                ))}
              </div>

              <span
                className={
                  selectedSlot === SLOTS.length - 1
                    ? "day-confirm is-ready"
                    : "day-confirm"
                }
              >
                {t("Rezervi təsdiqlə")}
              </span>
            </div>

            {/* 4. Təsdiq bildirişi */}
            <div className={active === 3 ? "day-screen is-shown" : "day-screen"}>
              <div className="day-notice">
                <span className="day-notice__icon">
                  <Check size={16} strokeWidth={2.2} />
                </span>
                <p>
                  {t("{name} rezervinizi təsdiqlədi: {service} · {date}, 18:30.", {
                    name: hero?.name ?? "Nail by Aysel",
                    service: hero?.services[0]?.name ?? t("Xidmət"),
                    date: formatDayMonth(toKey(days[1])),
                  })}
                </p>
              </div>

              <div className="day-review">
                <span className="day-review__stars">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star key={value} size={15} strokeWidth={1.6} fill="currentColor" />
                  ))}
                </span>
                <span>{t("Xidmətdən sonra rəy yazın")}</span>
              </div>
            </div>

            {/* 5. Biznes paneli */}
            <div className={active === 4 ? "day-screen is-shown" : "day-screen"}>
              <p className="day-screen__title">
                <CalendarCheck size={15} strokeWidth={1.8} />
                {t("Sabahın rezervləri")}
              </p>

              <ul className="day-agenda">
                {[
                  { time: "11:00", name: "Leyla H.", service: t("Pedikür") },
                  { time: "15:00", name: "Nigar Ə.", service: t("Manikür") },
                  { time: "18:30", name: "Elay P.", service: t("Gel lak") },
                ].map((item, index) => (
                  <li key={item.time}>
                    <time>{item.time}</time>
                    <span>
                      <strong>{item.name}</strong>
                      {item.service}
                    </span>
                    <em className={index === 1 ? "is-pending" : ""}>
                      {index === 1 ? t("Təsdiqlə") : t("Təsdiqlənib")}
                    </em>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DayStory;

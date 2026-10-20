import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDown,
  BadgeCheck,
  Briefcase,
  CalendarCheck,
  CalendarClock,
  ChevronDown,
  Images,
  LayoutGrid,
  MapPin,
  Moon,
  Search,
  Star,
  Sun,
  UserRound,
  Users,
} from "lucide-react";

import { categories } from "../../data/categories";
import { useTheme } from "../../hooks/useTheme";
import { t } from "../../i18n";
import LanguageSwitch from "../../i18n/LanguageSwitch";
import { isLoggedIn } from "../../services/api";
import { getProviders } from "../../services/providersService";
import { getReviewsByProvider, type Review } from "../../services/reviewsService";
import { areas } from "../../types/area";
import type { Provider } from "../../types/provider";
import BakuScene, { LANDMARKS, PANORAMA_WIDTH } from "./BakuScene";
import HowItWorks from "./HowItWorks";
import "./AccountType.css";

/*
 * Ana səhifə. Arxada Bakı sahilinin panoraması var: aşağı
 * sürüşdürdükcə "kamera" sahil boyunca hərəkət edir (Alov qüllələri →
 * bulvar və Bakı Gözü → İçərişəhər → Heydər Əliyev Mərkəzi), göyün
 * rəngi bölməyə görə dəyişir. Açıq rejimdə gündüz, qaranlıqda gecə.
 */

type Scene = "morning" | "day" | "afternoon" | "golden";

const DISTRICTS = areas.filter((area) => area.type === "district");

const FAQ = [
  {
    question: t("AzLink-dən istifadə pulsuzdur?"),
    answer: t(
      "Bəli. Müştərilər üçün qeydiyyat və rezerv pulsuzdur. Xidmətin haqqını ustaya birbaşa, xidmət zamanı ödəyirsiniz."
    ),
  },
  {
    question: t("Rezervim nə vaxt təsdiqlənir?"),
    answer: t(
      "Usta sorğunuzu görüb təsdiqləyəndə sizə bildiriş gəlir. Təsdiqə qədər rezerv \"Təsdiq gözlənilir\" statusunda olur."
    ),
  },
  {
    question: t("Rezervi ləğv edə bilərəm?"),
    answer: t(
      "Bəli. \"Rezervlərim\" bölməsindən istənilən aktiv rezervi ləğv edə bilərsiniz, usta da bu barədə bildiriş alır."
    ),
  },
  {
    question: t("Rəylər həqiqidir?"),
    answer: t(
      "Rəyi yalnız rezervi tamamlanmış müştəri yaza bilər və hər rezerv üçün yalnız bir rəy. Ona görə ulduzlar real təcrübəni göstərir."
    ),
  },
  {
    question: t("Biznesimi necə əlavə edim?"),
    answer: t(
      "Biznes hesabı yaradın, xidmətlərinizi, qiymətləri və iş saatlarını əlavə edin. Profiliniz dərhal axtarışda görünəcək."
    ),
  },
];

const BUSINESS_POINTS = [
  { icon: CalendarClock, text: t("Müştərilər gecə-gündüz onlayn rezerv edir") },
  { icon: CalendarCheck, text: t("İş saatlarınız və dolu saatlar avtomatik nəzərə alınır") },
  { icon: Users, text: t("Müştəri siyahısı, rezerv tarixçəsi və rəylər bir paneldə") },
  { icon: Images, text: t("İş nümunələriniz profil səhifənizdə görünür") },
];

const WHY = [
  {
    icon: LayoutGrid,
    title: t("Hamısı bir yerdə"),
    text: t(
      "Gözəllikdən təmirə, təhsildən avtomobilə qədər 8 sahə. Tanışlardan nömrə soruşmağa və zəng-zəng axtarmağa ehtiyac yoxdur."
    ),
  },
  {
    icon: BadgeCheck,
    title: t("Real rəylər"),
    text: t(
      "Rəyi yalnız xidməti həqiqətən almış müştəri yaza bilər. Seçimi başqalarının təcrübəsinə görə edirsiniz."
    ),
  },
  {
    icon: CalendarCheck,
    title: t("Onlayn rezerv"),
    text: t(
      "Ustanın boş saatlarını görür və bir neçə toxunuşla rezerv edirsiniz. Təsdiq bildirişlə gəlir."
    ),
  },
];

/* Hər bölmə arxa fonda öz "vaxtını" seçir */
const SECTION_SCENES: Scene[] = ["morning", "day", "day", "afternoon", "afternoon", "golden", "golden", "golden"];

function AccountType() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const pageRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const [providers, setProviders] = useState<Provider[]>([]);
  const [reviews, setReviews] = useState<(Review & { providerName: string })[]>([]);
  const [scene, setScene] = useState<Scene>("morning");
  const [query, setQuery] = useState("");

  /* ---------- Məlumat: bizneslər və bir neçə real rəy ---------- */

  useEffect(() => {
    let cancelled = false;

    getProviders()
      .then(async (result) => {
        if (cancelled) return;
        setProviders(result);

        const top = [...result]
          .sort((a, b) => b.reviewCount - a.reviewCount)
          .slice(0, 4);

        const lists = await Promise.all(
          top.map((provider) =>
            getReviewsByProvider(provider.id)
              .then((items) => items.map((item) => ({ ...item, providerName: provider.name })))
              .catch(() => [])
          )
        );

        if (cancelled) return;

        /* Hər biznesdən ən yaxşı, mətni olan bir rəy */
        const picked = lists
          .map((items) =>
            items
              .filter((item) => item.comment.trim().length > 20)
              .sort((a, b) => b.rating - a.rating)[0]
          )
          .filter(Boolean)
          .slice(0, 3);

        setReviews(picked);
      })
      .catch(() => {
        /* Məlumat gəlməsə də səhifə işləyir, sadəcə rəqəmlər görünmür */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- Sürüşdürmə: kamera və bölmənin "vaxtı" ---------- */

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / total));

      page.style.setProperty("--cam", progress.toFixed(4));
      page.style.setProperty("--sun", progress.toFixed(4));

      const middle = window.innerHeight * 0.5;
      let current = 0;

      sectionRefs.current.forEach((element, index) => {
        if (element && element.getBoundingClientRect().top <= middle) current = index;
      });

      setScene(SECTION_SCENES[current] ?? "golden");

      /* Ekranın ortasına ən yaxın görməli yerin adı göstərilir */
      const layer = page.querySelector<SVGElement>(".baku-layer--main");
      const width = layer?.getBoundingClientRect().width ?? 0;

      if (width > 0) {
        const viewport = window.innerWidth;
        const offset = (viewport - width) * progress;
        let nearest = "";
        let distance = viewport * 0.32;

        LANDMARKS.forEach((landmark) => {
          const x = offset + (landmark.x / PANORAMA_WIDTH) * width;
          const gap = Math.abs(x - viewport * 0.5);

          if (gap < distance) {
            distance = gap;
            nearest = landmark.id;
          }
        });

        if (page.dataset.landmark !== nearest) page.dataset.landmark = nearest;
      }
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

  /* ---------- Rəqəmlər ---------- */

  const stats = useMemo(() => {
    const rated = providers.filter((provider) => provider.reviewCount > 0);
    const reviewTotal = providers.reduce((sum, provider) => sum + provider.reviewCount, 0);
    const average = rated.length
      ? rated.reduce((sum, provider) => sum + provider.rating * provider.reviewCount, 0) /
        Math.max(1, reviewTotal)
      : 0;

    return {
      businesses: providers.length,
      reviews: reviewTotal,
      average: average ? average.toFixed(1) : null,
    };
  }, [providers]);

  const categoryInfo = useMemo(
    () =>
      categories.map((category) => {
        const inCategory = providers.filter((provider) =>
          provider.categories?.includes(category.name)
        );
        const prices = inCategory.map((provider) => provider.priceFrom).filter((price) => price > 0);

        return {
          category,
          count: inCategory.length,
          priceFrom: prices.length ? Math.min(...prices) : null,
        };
      }),
    [providers]
  );

  const areaCounts = useMemo(() => {
    const counts = new Map<string, number>();
    providers.forEach((provider) => counts.set(provider.area, (counts.get(provider.area) ?? 0) + 1));
    return counts;
  }, [providers]);

  /* ---------- Hərəkətlər ---------- */

  /* Girişlidirsə birbaşa axtarışa, deyilsə qeydiyyata */
  const goSearch = (params: string) =>
    navigate(isLoggedIn() ? `/search?${params}` : "/register?role=user");

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const clean = query.trim();
    goSearch(clean ? `q=${encodeURIComponent(clean)}` : "");
  };

  const setSection = (index: number) => (element: HTMLElement | null) => {
    sectionRefs.current[index] = element;
  };

  return (
    <div ref={pageRef} className="landing" data-scene={scene} data-dark={isDark || undefined}>
      {/* ================= ARXA FON: BAKI ================= */}
      <div className="landing__backdrop" aria-hidden="true">
        <div className="landing-sky landing-sky--morning" />
        <div className="landing-sky landing-sky--day" />
        <div className="landing-sky landing-sky--afternoon" />
        <div className="landing-sky landing-sky--golden" />
        <div className="landing-stars" />
        <div className="landing-sun" />
        <div className="landing-sea" />
        <BakuScene />
        <div className="landing__veil" />
      </div>

      {/* ================= YUXARI ZOLAQ ================= */}
      <header className="landing-bar">
        <span className="landing-bar__brand">AzLink</span>

        <div className="landing-bar__actions">
          <button
            type="button"
            className="landing-bar__icon"
            onClick={toggleTheme}
            aria-label={isDark ? t("Ağ moda keç") : t("Qaranlıq moda keç")}
            title={isDark ? t("Ağ moda keç") : t("Qaranlıq moda keç")}
          >
            {isDark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
          </button>

          <LanguageSwitch />

          <Link to="/login" className="landing-bar__login">
            {t("Daxil olun")}
          </Link>
        </div>
      </header>

      <main className="landing__content">
        {/* ================= 1. GİRİŞ ================= */}
        <section ref={setSection(0)} className="landing-hero">
          <h1>{t("Bakıda usta axtarmağın ən rahat yolu")}</h1>

          <p className="landing-hero__lead">
            {t(
              "Manikürdən santexnikə, repetitordan avtoyumaya — Bakının yerli ustaları bir yerdə. Qiymətləri və real rəyləri müqayisə edin, boş saatı seçin, onlayn rezerv edin."
            )}
          </p>

          <form className="landing-search" onSubmit={handleSearch} role="search">
            <Search size={19} strokeWidth={1.8} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("Hansı xidmət lazımdır? Məsələn, manikür")}
              aria-label={t("Xidmət axtar")}
            />
            <button type="submit">{t("Usta tap")}</button>
          </form>

          <div className="landing-hero__chips">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <button
                  key={category.id}
                  type="button"
                  className="landing-chip"
                  onClick={() => goSearch(`category=${category.id}`)}
                >
                  <Icon size={15} strokeWidth={1.8} />
                  {t(category.name)}
                </button>
              );
            })}
          </div>

          <dl className="landing-hero__stats">
            {stats.businesses > 0 && (
              <div>
                <dt>{stats.businesses}</dt>
                <dd>{t("usta və biznes")}</dd>
              </div>
            )}
            <div>
              <dt>{categories.length}</dt>
              <dd>{t("xidmət sahəsi")}</dd>
            </div>
            <div>
              <dt>{DISTRICTS.length}</dt>
              <dd>{t("rayon")}</dd>
            </div>
            {stats.average && (
              <div>
                <dt>{stats.average}</dt>
                <dd>{t("orta reytinq")}</dd>
              </div>
            )}
          </dl>

          <a href="#niye" className="landing-hero__more">
            {t("Ətraflı tanış olun")}
            <ArrowDown size={16} strokeWidth={1.8} />
          </a>
        </section>

        {/* ================= 2. NİYƏ AZLINK ================= */}
        <section ref={setSection(1)} id="niye" className="landing-section">
          <div className="landing-glass landing-section__head">
            <h2>{t("Zəng-zəng usta axtarmağa son")}</h2>
            <p>
              {t(
                "AzLink yerli xidmət göstərənləri və müştəriləri bir platformada birləşdirir. Kimin hansı işi gördüyünü, neçəyə və nə vaxt boş olduğunu dərhal görürsünüz."
              )}
            </p>
          </div>

          <div className="landing-why">
            {WHY.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.title} className="landing-glass landing-why__item">
                  <span className="landing-icon">
                    <Icon size={20} strokeWidth={1.7} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ================= 3. NECƏ İŞLƏYİR ================= */}
        <section ref={setSection(2)} className="landing-section">
          <div className="landing-glass landing-section__head">
            <h2>{t("Rezerv 4 addımda")}</h2>
            <p>{t("Axtarışdan təsdiqə qədər hər şey bir neçə dəqiqə çəkir.")}</p>
          </div>

          <HowItWorks providers={providers} />
        </section>

        {/* ================= 4. XİDMƏT SAHƏLƏRİ ================= */}
        <section ref={setSection(3)} className="landing-section">
          <div className="landing-glass landing-section__head">
            <h2>{t("Hansı xidmətləri tapa bilərsiniz?")}</h2>
            <p>{t("Sahəni seçin və o sahədəki bütün ustaları qiymət və reytinqləri ilə görün.")}</p>
          </div>

          <div className="landing-categories">
            {categoryInfo.map(({ category, count, priceFrom }) => {
              const Icon = category.icon;

              return (
                <button
                  key={category.id}
                  type="button"
                  className="landing-glass landing-category"
                  onClick={() => goSearch(`category=${category.id}`)}
                >
                  <span className="landing-icon">
                    <Icon size={20} strokeWidth={1.7} />
                  </span>
                  <strong>{t(category.name)}</strong>
                  <span className="landing-category__services">
                    {category.services.map((name) => t(name)).join(", ")}
                  </span>
                  <span className="landing-category__meta">
                    {count > 0
                      ? priceFrom !== null
                        ? `${t("{count} usta", { count })} · ${t("{price} ₼-dən", { price: priceFrom })}`
                        : t("{count} usta", { count })
                      : t("Tezliklə ustalar qoşulacaq")}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ================= 5. RƏYLƏR ================= */}
        {reviews.length > 0 && (
          <section ref={setSection(4)} className="landing-section">
            <div className="landing-glass landing-section__head">
              <h2>{t("Müştərilər nə deyir")}</h2>
              <p>
                {stats.reviews > 0
                  ? t("Platformada {count} rəy var. Hamısı tamamlanmış rezervlərdən sonra yazılıb.", {
                      count: stats.reviews,
                    })
                  : null}
              </p>
            </div>

            <div className="landing-reviews">
              {reviews.map((review) => (
                <figure key={review.id} className="landing-glass landing-review">
                  <span className="landing-review__stars" aria-label={t("{count} ulduz", { count: review.rating })}>
                    {Array.from({ length: review.rating }, (_, index) => (
                      <Star key={index} size={15} strokeWidth={1.6} fill="currentColor" />
                    ))}
                  </span>
                  <blockquote>{review.comment}</blockquote>
                  <figcaption>
                    <strong>{review.customerName}</strong>
                    {review.providerName}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* ================= 6. USTALAR ÜÇÜN ================= */}
        <section ref={setSection(5)} className="landing-section landing-business">
          <div className="landing-glass landing-business__text">
            <h2>{t("Ustasınız? Müştəriləriniz sizi burada tapsın")}</h2>
            <p>
              {t(
                "Pulsuz biznes profili yaradın, xidmətlərinizi və qiymətlərinizi əlavə edin, rezervləri bir paneldən idarə edin."
              )}
            </p>

            <ul>
              {BUSINESS_POINTS.map((point) => {
                const Icon = point.icon;

                return (
                  <li key={point.text}>
                    <Icon size={18} strokeWidth={1.7} />
                    {point.text}
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              className="landing-button landing-button--primary"
              onClick={() => navigate("/register?role=business")}
            >
              {t("Biznesimi əlavə et")}
            </button>
          </div>

          <div className="landing-glass landing-agenda" aria-hidden="true">
            <p className="landing-agenda__title">
              <CalendarCheck size={16} strokeWidth={1.8} />
              {t("Sabahın rezervləri")}
            </p>

            {[
              { time: "11:00", name: "Leyla H.", service: t("Pedikür"), done: true },
              { time: "15:00", name: "Nigar Ə.", service: t("Manikür"), done: false },
              { time: "18:30", name: "Elay P.", service: t("Gel lak"), done: true },
            ].map((item) => (
              <div key={item.time} className="landing-agenda__row">
                <time>{item.time}</time>
                <span>
                  <strong>{item.name}</strong>
                  {item.service}
                </span>
                <em className={item.done ? "" : "is-pending"}>
                  {item.done ? t("Təsdiqlənib") : t("Təsdiqlə")}
                </em>
              </div>
            ))}
          </div>
        </section>

        {/* ================= 7. RAYONLAR ================= */}
        <section ref={setSection(6)} className="landing-section">
          <div className="landing-glass landing-section__head">
            <h2>{t("Bakının 12 rayonunda")}</h2>
            <p>{t("Rayonunuzu seçin və yaxınlıqdakı ustaları görün.")}</p>
          </div>

          <div className="landing-districts">
            {DISTRICTS.map((district) => {
              const count = areaCounts.get(district.name) ?? 0;

              return (
                <button
                  key={district.id}
                  type="button"
                  className="landing-district"
                  onClick={() => goSearch(`area=${encodeURIComponent(district.name)}`)}
                >
                  <MapPin size={15} strokeWidth={1.8} />
                  {district.name}
                  {count > 0 && <b>{count}</b>}
                </button>
              );
            })}
          </div>
        </section>

        {/* ================= 8. SUALLAR VƏ SON ================= */}
        <section ref={setSection(7)} className="landing-section">
          <div className="landing-glass landing-faq">
            <h2>{t("Tez-tez verilən suallar")}</h2>

            {FAQ.map((item) => (
              <details key={item.question}>
                <summary>
                  {item.question}
                  <ChevronDown size={18} strokeWidth={1.8} />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>

          <div className="landing-final">
            <h2>{t("Hansı tərəfdəsiniz?")}</h2>

            <div className="landing-final__doors">
              <button
                type="button"
                className="landing-glass landing-door"
                onClick={() => navigate("/register?role=user")}
              >
                <UserRound size={26} strokeWidth={1.5} />
                <strong>{t("Xidmət axtarıram")}</strong>
                <span>{t("Usta tapın, müqayisə edin və rezerv edin. Qeydiyyat pulsuzdur.")}</span>
                <em>{t("Müştəri kimi başla")}</em>
              </button>

              <button
                type="button"
                className="landing-glass landing-door"
                onClick={() => navigate("/register?role=business")}
              >
                <Briefcase size={26} strokeWidth={1.5} />
                <strong>{t("Xidmət göstərirəm")}</strong>
                <span>{t("Profilinizi qurun, xidmətlərinizi əlavə edin və onlayn rezerv qəbul edin.")}</span>
                <em>{t("Biznesimi əlavə et")}</em>
              </button>
            </div>

            <p className="landing-final__login">
              {t("Artıq hesabınız var?")} <Link to="/login">{t("Daxil olun")}</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AccountType;

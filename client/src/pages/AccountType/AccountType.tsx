import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDown,
  BadgeCheck,
  Briefcase,
  CalendarCheck,
  LayoutGrid,
  Moon,
  Sun,
  UserRound,
} from "lucide-react";

import { useTheme } from "../../hooks/useTheme";
import { t } from "../../i18n";
import LanguageSwitch from "../../i18n/LanguageSwitch";
import NetworkBackground from "./network/NetworkBackground";
import "./AccountType.css";

/*
 * Ana səhifə. Açılan kimi əsas seçim görünür: müştəri və ya biznes.
 * Aşağıda qısa izah: necə işləyir və niyə AzLink.
 *
 * Arxada canlı AzLink şəbəkəsi (network/NetworkScene.ts). Üç bölmə
 * şəbəkənin üç mərhələsidir: ayrı kürələr → Azərbaycan xəritəsi →
 * vahid şəbəkə və Bakı siluetı. Mərhələ sürüşdürməyə bağlıdır və
 * geri sürüşdürəndə eyni yolla geri qayıdır.
 */

const CUSTOMER_STEPS = [
  {
    title: t("Xidməti seçin"),
    text: t("Nə lazım olduğunu və rayonunuzu yazın: manikür, santexnik, repetitor və s."),
  },
  {
    title: t("Ustanı müqayisə edin"),
    text: t("Qiymətlərə, iş nümunələrinə və real müştəri rəylərinə baxın."),
  },
  {
    title: t("Onlayn rezerv edin"),
    text: t("Boş saatı seçin. Usta təsdiqləyəndə bildiriş alırsınız."),
  },
];

const BUSINESS_STEPS = [
  {
    title: t("Profilinizi yaradın"),
    text: t("Biznesinizin adını, ünvanını və iş nümunələrinizi əlavə edin."),
  },
  {
    title: t("Xidmət və qiymətləri yazın"),
    text: t("İş saatlarınızı qeyd edin, boş saatlar avtomatik hesablanır."),
  },
  {
    title: t("Rezervləri qəbul edin"),
    text: t("Gələn sorğuları bir paneldən təsdiqləyin, müştərilərinizi izləyin."),
  },
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

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function AccountType() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  /* Şəbəkənin mərhələsi: 0 (giriş) → 1 (necə işləyir) → 2 (niyə AzLink) */
  const stageRef = useRef(0);
  const railRef = useRef<HTMLElement>(null);

  /* ---------- Sürüşdürməyə bağlı keçid ---------- */

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      let stage = 0;

      sectionRefs.current.forEach((section, index) => {
        if (!section) return;

        /* Bölmə ekranın aşağısından ortasına çatana qədər 0 → 1 */
        const top = section.getBoundingClientRect().top;
        const value = index === 0 ? 1 : clamp((viewport * 0.95 - top) / (viewport * 0.6));

        section.style.setProperty("--in", value.toFixed(3));

        if (index > 0) stage += value;
      });

      stageRef.current = stage;
      railRef.current?.style.setProperty("--stage", stage.toFixed(3));
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

  const setSection = (index: number) => (element: HTMLElement | null) => {
    sectionRefs.current[index] = element;
  };

  const scrollToSection = (index: number) =>
    sectionRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });

  const startAs = (role: "user" | "business") => navigate(`/register?role=${role}`);

  return (
    <div className="landing" data-dark={isDark || undefined}>
      {/* ================= ARXA FON: AZLINK ŞƏBƏKƏSİ ================= */}
      <div className="landing__backdrop" aria-hidden="true">
        <NetworkBackground progress={stageRef} dark={isDark} />
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

      {/* Sol kənarda üç mərhələnin göstəricisi: hara qədər gəldiyinizi göstərir */}
      <nav ref={railRef} className="landing-rail" aria-label={t("Bölmələr")}>
        {[t("Seçim"), t("Necə işləyir?"), t("Niyə AzLink?")].map((label, index) => (
          <button
            key={label}
            type="button"
            style={{ ["--i" as string]: index }}
            onClick={() => scrollToSection(index)}
          >
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <main className="landing__content">
        {/* ================= 1. SEÇİM ================= */}
        <section ref={setSection(0)} className="landing-hero">
          <h1>{t("Bakının ustaları və müştəriləri bir yerdə")}</h1>

          <p className="landing-hero__lead">
            {t("Xidmət axtarırsınız, yoxsa xidmət göstərirsiniz? Seçin və bir dəqiqəyə hesab yaradın.")}
          </p>

          <div className="landing-doors">
            <button
              type="button"
              className="landing-glass landing-door"
              onClick={() => startAs("user")}
            >
              <span className="landing-icon">
                <UserRound size={22} strokeWidth={1.6} />
              </span>
              <strong>{t("Xidmət axtarıram")}</strong>
              <span>{t("Usta tapın, müqayisə edin və rezerv edin. Qeydiyyat pulsuzdur.")}</span>
              <em>{t("Müştəri kimi başla")}</em>
            </button>

            <button
              type="button"
              className="landing-glass landing-door"
              onClick={() => startAs("business")}
            >
              <span className="landing-icon">
                <Briefcase size={22} strokeWidth={1.6} />
              </span>
              <strong>{t("Xidmət göstərirəm")}</strong>
              <span>{t("Profilinizi qurun, xidmətlərinizi əlavə edin və onlayn rezerv qəbul edin.")}</span>
              <em>{t("Biznesimi əlavə et")}</em>
            </button>
          </div>

          <a href="#necə" className="landing-hero__more">
            {t("Necə işləyir?")}
            <ArrowDown size={16} strokeWidth={1.8} />
          </a>
        </section>

        {/* ================= 2. NECƏ İŞLƏYİR ================= */}
        <section ref={setSection(1)} id="necə" className="landing-section">
          <h2 className="landing-section__title">{t("Necə işləyir?")}</h2>

          <div className="landing-paths">
            {[
              { title: t("Müştərilər üçün"), icon: UserRound, steps: CUSTOMER_STEPS },
              { title: t("Bizneslər üçün"), icon: Briefcase, steps: BUSINESS_STEPS },
            ].map((path) => {
              const Icon = path.icon;

              return (
                <article key={path.title} className="landing-glass landing-path">
                  <h3>
                    <Icon size={20} strokeWidth={1.7} />
                    {path.title}
                  </h3>

                  <ol>
                    {path.steps.map((step) => (
                      <li key={step.title}>
                        <strong>{step.title}</strong>
                        <span>{step.text}</span>
                      </li>
                    ))}
                  </ol>
                </article>
              );
            })}
          </div>
        </section>

        {/* ================= 3. NİYƏ AZLINK ================= */}
        <section ref={setSection(2)} className="landing-section landing-section--last">
          <h2 className="landing-section__title">{t("Niyə AzLink?")}</h2>

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

          <div className="landing-glass landing-cta">
            <p>{t("Hazırsınız? Bir dəqiqəyə başlayın.")}</p>
            <div>
              <button type="button" className="landing-button" onClick={() => startAs("user")}>
                {t("Müştəri kimi başla")}
              </button>
              <button
                type="button"
                className="landing-button landing-button--primary"
                onClick={() => startAs("business")}
              >
                {t("Biznesimi əlavə et")}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <span>AzLink</span>
            <p>
              {t("Bakıda xidmət axtaranları ustalar və salonlarla birləşdirən onlayn rezerv platforması.")}
            </p>
          </div>

          <nav className="landing-footer__links" aria-label={t("Müştərilər üçün")}>
            <h4>{t("Müştərilər üçün")}</h4>
            <button type="button" onClick={() => startAs("user")}>{t("Xidmət tap")}</button>
            <Link to="/login?role=user">{t("Daxil olun")}</Link>
          </nav>

          <nav className="landing-footer__links" aria-label={t("Bizneslər üçün")}>
            <h4>{t("Bizneslər üçün")}</h4>
            <button type="button" onClick={() => startAs("business")}>{t("Biznesimi əlavə et")}</button>
            <Link to="/login?role=business">{t("Biznes girişi")}</Link>
          </nav>

          <nav className="landing-footer__links" aria-label="AzLink">
            <h4>AzLink</h4>
            <button type="button" onClick={() => scrollToSection(1)}>{t("Necə işləyir?")}</button>
            <button type="button" onClick={() => scrollToSection(2)}>{t("Niyə AzLink?")}</button>
          </nav>
        </div>

        <p className="landing-footer__bottom">
          © {new Date().getFullYear()} AzLink. {t("Bakı, Azərbaycan")}
        </p>
      </footer>
    </div>
  );
}

export default AccountType;

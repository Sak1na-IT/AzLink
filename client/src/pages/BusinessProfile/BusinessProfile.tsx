import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, PointerEvent } from "react";
import {
  ArrowRight,
  Camera,
  Check,
  Clock3,
  MapPin,
  Move,
  Phone,
  Save,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import "./BusinessProfile.css";
import { getAreas } from "../../services/areasService";
import {
  getCategories,
  type CategoryOption,
} from "../../services/categoriesService";
import {
  getBusinessProfile,
  saveBranding,
  saveBusinessProfile,
  type BrandingInput,
  type BusinessProfile as BusinessProfileData,
} from "../../services/businessService";
import {
  getPortfolio,
  type PortfolioImage,
} from "../../services/businessPortfolioService";
import { compressImage } from "../../utils/compressImage";
import { weekDays, weekDayLabels } from "../../types/schedule";

type AreaOption = Awaited<ReturnType<typeof getAreas>>[number];

/* Backend profilə id əlavə edəndə "Profilə bax" düyməsi avtomatik görünəcək */
type ProfileWithId = BusinessProfileData & { id?: string };

const DESCRIPTION_LIMIT = 500;

function BusinessProfile() {
  const [profile, setProfile] = useState<ProfileWithId | null>(null);
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  /* Portfolio şəkilləri: üz qabığı seçimi üçün */
  const [portfolio, setPortfolio] = useState<PortfolioImage[]>([]);

  /* Profil şəkli və üz qabığı */
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [draftPosition, setDraftPosition] = useState(50);
  const [brandingBusy, setBrandingBusy] = useState(false);
  const [brandingNote, setBrandingNote] = useState("");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ y: number; start: number } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  useEffect(() => {
    const load = async () => {
      try {
        const [profileResult, areasResult, categoriesResult] =
          await Promise.all([
            getBusinessProfile(),
            getAreas(),
            getCategories(),
          ]);

        setProfile(profileResult);
        setAreas(areasResult);
        /* yalnız əsas kateqoriyalar (alt-kateqoriyalar yox) */
        setCategories(categoriesResult.filter((item) => !item.parentId));
      } catch {
        setLoadError("Biznes profilini yükləmək mümkün olmadı.");
      } finally {
        setIsLoading(false);
      }
    };

    load();

    getPortfolio()
      .then(setPortfolio)
      .catch(() => {
        /* şəkil yoxdursa zümrüd fon qalır */
      });
  }, []);

  const update = <K extends keyof BusinessProfileData>(
    key: K,
    value: BusinessProfileData[K]
  ) => {
    setStatus("idle");
    setProfile((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;

    try {
      setIsSaving(true);
      setStatus("idle");
      await saveBusinessProfile(profile);
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  /* ========================================================
     PROFİL ŞƏKLİ VƏ ÜZ QABIĞI
     ======================================================== */

  const applyBranding = async (input: BrandingInput, note: string) => {
    try {
      setBrandingBusy(true);
      setBrandingNote("");

      const saved = await saveBranding(input);

      setProfile((current) =>
        current
          ? {
              ...current,
              logoUrl: saved.logoUrl ?? null,
              coverUrl: saved.coverUrl ?? null,
              coverPosition: saved.coverPosition ?? 50,
            }
          : current
      );
      setBrandingNote(note);
      return true;
    } catch {
      setBrandingNote("Şəkli yadda saxlamaq mümkün olmadı. Yenidən cəhd edin.");
      return false;
    } finally {
      setBrandingBusy(false);
    }
  };

  /* Faylı kiçildib göndəririk (loqo kiçik, üz qabığı enli) */
  const readImage = async (
    event: ChangeEvent<HTMLInputElement>,
    maxSide: number
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return null;

    if (!file.type.startsWith("image/")) {
      setBrandingNote("Yalnız şəkil faylı seçin.");
      return null;
    }

    try {
      return await compressImage(file, maxSide);
    } catch {
      setBrandingNote("Şəkli oxumaq mümkün olmadı.");
      return null;
    }
  };

  const handleLogoFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const dataUrl = await readImage(event, 480);
    if (dataUrl) {
      await applyBranding({ logoUrl: dataUrl }, "Profil şəkli yeniləndi.");
    }
  };

  const handleCoverFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const dataUrl = await readImage(event, 1800);
    if (dataUrl) {
      const ok = await applyBranding(
        { coverUrl: dataUrl, coverPosition: 50 },
        "Üz qabığı yeniləndi. İstəsəniz yerini düzəldin."
      );
      if (ok) setIsCoverPickerOpen(false);
    }
  };

  const chooseFromPortfolio = async (image: PortfolioImage) => {
    const ok = await applyBranding(
      { coverUrl: image.dataUrl, coverPosition: 50 },
      "Üz qabığı seçildi."
    );
    if (ok) setIsCoverPickerOpen(false);
  };

  /* Yerini düzəlt: şəkli yuxarı-aşağı sürüşdürmək */
  const startAdjusting = () => {
    setDraftPosition(profile?.coverPosition ?? 50);
    setIsCoverPickerOpen(false);
    setIsAdjusting(true);
  };

  const handleCoverPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!isAdjusting) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { y: event.clientY, start: draftPosition };
  };

  const handleCoverPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!isAdjusting || !drag) return;

    const height = event.currentTarget.clientHeight || 1;
    /* Aşağı çəkəndə şəklin yuxarı hissəsi görünür */
    const next = drag.start - ((event.clientY - drag.y) / height) * 100;
    setDraftPosition(Math.round(Math.max(0, Math.min(100, next))));
  };

  const handleCoverPointerUp = () => {
    dragRef.current = null;
  };

  const saveAdjusting = async () => {
    const ok = await applyBranding(
      { coverPosition: draftPosition },
      "Üz qabığının yeri yadda saxlanıldı."
    );
    if (ok) setIsAdjusting(false);
  };

  if (isLoading) {
    return (
      <main className="business-profile">
        <p className="business-profile__message">Yüklənir...</p>
      </main>
    );
  }

  if (loadError || !profile) {
    return (
      <main className="business-profile">
        <p className="business-profile__message">
          {loadError || "Məlumat tapılmadı."}
        </p>
      </main>
    );
  }

  const description = profile.description ?? "";
  const areaName =
    areas.find((area) => area.id === profile.areaId)?.name ?? "";
  const initial = profile.businessName.trim().charAt(0).toUpperCase() || "B";

  /* Üz qabığı: seçilmiş şəkil, yoxdursa portfoliodakı ilk şəkil */
  const coverImage = profile.coverUrl ?? portfolio[0]?.dataUrl ?? null;
  const coverPosition = isAdjusting ? draftPosition : profile.coverPosition ?? 50;

  return (
    <main className="business-profile">
      <section className="business-profile__header">
        <div>
          <span className="biz-eyebrow">Profil</span>
          <h1>Biznes profili</h1>
          <p>Müştərilərin sizin haqqınızda gördüyü məlumatlar.</p>
        </div>

        {profile.id && (
          <Link
            to={`/provider/${profile.id}`}
            className="business-profile__view"
          >
            Profilə bax
            <ArrowRight size={15} strokeWidth={1.8} />
          </Link>
        )}
      </section>

      {/* ===== CANLI ÖNBAXIŞ ===== */}
      <section
        className="business-profile__preview"
        aria-label="Müştərilər sizi belə görür"
      >
        <div
          className={
            isAdjusting
              ? "business-profile__cover is-adjusting"
              : "business-profile__cover"
          }
          onPointerDown={handleCoverPointerDown}
          onPointerMove={handleCoverPointerMove}
          onPointerUp={handleCoverPointerUp}
          onPointerCancel={handleCoverPointerUp}
        >
          {coverImage && (
            <img
              src={coverImage}
              alt=""
              draggable={false}
              style={{ objectPosition: `50% ${coverPosition}%` }}
            />
          )}

          {/* Üz qabığı düymələri */}
          {isAdjusting ? (
            <>
              <span className="business-profile__drag-hint">
                <Move size={16} strokeWidth={1.8} />
                Şəkli yuxarı və ya aşağı sürüşdürün
              </span>

              <div className="business-profile__cover-tools">
                <button
                  type="button"
                  className="business-profile__cover-button business-profile__cover-button--gold"
                  onClick={saveAdjusting}
                  disabled={brandingBusy}
                >
                  <Check size={15} strokeWidth={2} />
                  Yadda saxla
                </button>

                <button
                  type="button"
                  className="business-profile__cover-button"
                  onClick={() => setIsAdjusting(false)}
                  disabled={brandingBusy}
                >
                  <X size={15} strokeWidth={2} />
                  Ləğv et
                </button>
              </div>
            </>
          ) : (
            <div className="business-profile__cover-tools">
              <button
                type="button"
                className="business-profile__cover-button"
                onClick={() => setIsCoverPickerOpen((open) => !open)}
                disabled={brandingBusy}
              >
                <Camera size={15} strokeWidth={1.8} />
                Üz qabığını dəyiş
              </button>

              {coverImage && (
                <button
                  type="button"
                  className="business-profile__cover-button"
                  onClick={startAdjusting}
                  disabled={brandingBusy}
                >
                  <Move size={15} strokeWidth={1.8} />
                  Yerini düzəlt
                </button>
              )}
            </div>
          )}

          {!isAdjusting && <span>Müştərilər sizi belə görür</span>}
        </div>

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleCoverFile}
        />

        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleLogoFile}
        />

        <div className="business-profile__preview-body">
          {/* Profil şəkli: üzərinə basanda dəyişir */}
          <div className="business-profile__avatar-wrap">
            <button
              type="button"
              className="business-profile__avatar"
              onClick={() => logoInputRef.current?.click()}
              disabled={brandingBusy}
              aria-label="Profil şəklini dəyiş"
              title="Profil şəklini dəyiş"
            >
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt="" />
              ) : (
                initial
              )}

              <span className="business-profile__avatar-overlay">
                <Camera size={20} strokeWidth={1.8} />
                {profile.logoUrl ? "Dəyiş" : "Şəkil"}
              </span>
            </button>

            {profile.logoUrl && (
              <button
                type="button"
                className="business-profile__avatar-remove"
                onClick={() =>
                  applyBranding({ logoUrl: null }, "Profil şəkli silindi.")
                }
                disabled={brandingBusy}
                aria-label="Profil şəklini sil"
                title="Profil şəklini sil"
              >
                <X size={14} strokeWidth={2} />
              </button>
            )}
          </div>

        <div className="business-profile__preview-info">
            <h2>{profile.businessName.trim() || "Biznes adı"}</h2>

            <div className="business-profile__chips">
              {profile.category && (
                <span className="business-profile__chip">
                  <Tag size={13} strokeWidth={1.8} />
                  {profile.category}
                </span>
              )}

              {areaName && (
                <span className="business-profile__chip">
                  <MapPin size={13} strokeWidth={1.8} />
                  {areaName}
                </span>
              )}

              {profile.phone && (
                <span className="business-profile__chip">
                  <Phone size={13} strokeWidth={1.8} />
                  {profile.phone}
                </span>
              )}
            </div>

            {description.trim() && (
              <p className="business-profile__preview-text">{description}</p>
            )}

            {(brandingBusy || brandingNote) && (
              <p className="business-profile__branding-note">
                {brandingBusy ? "Yadda saxlanılır..." : brandingNote}
              </p>
            )}

            {!profile.logoUrl && !brandingNote && (
              <p className="business-profile__branding-tip">
                <Camera size={14} strokeWidth={1.8} />
                Profil şəkli əlavə etmək üçün dairəyə basın.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Üz qabığı seçimi: yeni şəkil və ya portfoliodan */}
      {isCoverPickerOpen && (
        <div className="business-profile__cover-picker">
          <div className="business-profile__cover-picker-head">
            <strong>Üz qabığı seçin</strong>
            <span>Enli (üfüqi) şəkil daha yaxşı görünür.</span>
          </div>

          <div className="business-profile__cover-options">
            <button
              type="button"
              className="business-profile__cover-upload"
              onClick={() => coverInputRef.current?.click()}
              disabled={brandingBusy}
            >
              <Upload size={20} strokeWidth={1.8} />
              Kompüterdən yüklə
            </button>

            {portfolio.map((image) => (
              <button
                key={image.id}
                type="button"
                className={
                  image.dataUrl === profile.coverUrl
                    ? "business-profile__cover-option is-selected"
                    : "business-profile__cover-option"
                }
                onClick={() => chooseFromPortfolio(image)}
                disabled={brandingBusy}
                aria-label={image.caption || "Portfolio şəkli"}
              >
                <img src={image.dataUrl} alt="" />
              </button>
            ))}
          </div>

          {profile.coverUrl && (
            <button
              type="button"
              className="business-profile__text-button"
              onClick={() =>
                applyBranding(
                  { coverUrl: null, coverPosition: 50 },
                  "Seçilmiş üz qabığı silindi."
                )
              }
              disabled={brandingBusy}
            >
              <Trash2 size={14} strokeWidth={1.8} />
              Seçimi sil (portfoliodakı ilk şəkil göstərilsin)
            </button>
          )}
        </div>
      )}

      <form className="business-profile__form" onSubmit={handleSubmit}>
        {/* ===== ƏSAS MƏLUMATLAR ===== */}
        <section className="business-profile__card">
          <div className="business-profile__card-header">
            <h2>Əsas məlumatlar</h2>
          </div>

          <div className="business-profile__fields">
            <label className="business-profile__field">
              <span>Biznes adı</span>

              <input
                type="text"
                placeholder="Məsələn, Bakı Beauty Studio"
                value={profile.businessName}
                onChange={(event) =>
                  update("businessName", event.target.value)
                }
                required
              />
            </label>

            <label className="business-profile__field">
              <span>Kateqoriya</span>

              <select
                value={profile.category}
                onChange={(event) => update("category", event.target.value)}
                required
              >
                <option value="">Kateqoriya seçin</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {/* ===== ƏLAQƏ ===== */}
        <section className="business-profile__card">
          <div className="business-profile__card-header">
            <h2>Əlaqə və ərazi</h2>
          </div>

          <div className="business-profile__fields">
            <label className="business-profile__field">
              <span>Telefon</span>

              <input
                type="tel"
                placeholder="+994 50 000 00 00"
                value={profile.phone}
                onChange={(event) => update("phone", event.target.value)}
                required
              />
            </label>

            <label className="business-profile__field">
              <span>Ərazi</span>

              <select
                value={profile.areaId}
                onChange={(event) => update("areaId", event.target.value)}
                required
              >
                <option value="">Ərazi seçin</option>

                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {/* ===== HAQQINDA ===== */}
        <section className="business-profile__card">
          <div className="business-profile__card-header">
            <h2>Haqqında</h2>
          </div>

          <label className="business-profile__field">
            <textarea
              placeholder="Biznesiniz və göstərdiyiniz xidmətlər haqqında qısa məlumat yazın..."
              value={description}
              maxLength={DESCRIPTION_LIMIT}
              onChange={(event) => update("description", event.target.value)}
              rows={5}
            />

            <small className="business-profile__counter">
              {description.length} / {DESCRIPTION_LIMIT}
            </small>
          </label>
        </section>

        {/* ===== İŞ SAATLARI XÜLASƏSİ ===== */}
        <section className="business-profile__card">
          <div className="business-profile__card-header">
            <h2>İş saatları</h2>

            <Link to="/business/hours" className="business-profile__link">
              <Clock3 size={15} strokeWidth={1.8} />
              Dəyiş
            </Link>
          </div>

          <ul className="business-profile__hours">
            {weekDays.map((day) => {
              const item = profile.schedule[day];

              return (
                <li key={day}>
                  <span>{weekDayLabels[day]}</span>

                  {item.isOpen ? (
                    <strong>
                      {item.start} – {item.end}
                    </strong>
                  ) : (
                    <em>Bağlı</em>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <div className="business-profile__footer">
          {status === "saved" && (
            <span className="business-profile__status business-profile__status--ok">
              Dəyişikliklər yadda saxlanıldı.
            </span>
          )}

          {status === "error" && (
            <span className="business-profile__status business-profile__status--error">
              Yadda saxlamaq mümkün olmadı.
            </span>
          )}

          <button
            type="submit"
            className="business-profile__save"
            disabled={isSaving}
          >
            <Save size={18} strokeWidth={1.9} />
            {isSaving ? "Saxlanılır..." : "Dəyişiklikləri yadda saxla"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default BusinessProfile;
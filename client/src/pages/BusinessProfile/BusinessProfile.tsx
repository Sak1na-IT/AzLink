import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Clock3, MapPin, Phone, Save, Tag } from "lucide-react";
import { Link } from "react-router-dom";

import "./BusinessProfile.css";
import { getAreas } from "../../services/areasService";
import {
  getCategories,
  type CategoryOption,
} from "../../services/categoriesService";
import {
  getBusinessProfile,
  saveBusinessProfile,
  type BusinessProfile as BusinessProfileData,
} from "../../services/businessService";
import { weekDays, weekDayLabels } from "../../types/schedule";

type AreaOption = Awaited<ReturnType<typeof getAreas>>[number];

/* Backend profilə id əlavə edəndə "Profilə bax" düyməsi avtomatik görünəcək */
type ProfileWithId = BusinessProfileData & { id?: string };

const DESCRIPTION_LIMIT = 500;

function BusinessProfile() {
  const [profile, setProfile] = useState<ProfileWithId | null>(null);
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

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

  return (
    <main className="business-profile">
      <section className="business-profile__header">
        <div>
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
        <div className="business-profile__cover">
          <span>Müştərilər sizi belə görür</span>
        </div>

        <div className="business-profile__preview-body">
          <div className="business-profile__avatar">{initial}</div>

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
          </div>
        </div>
      </section>

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
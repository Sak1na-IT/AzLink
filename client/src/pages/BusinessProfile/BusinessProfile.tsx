import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Building2, Phone, Save } from "lucide-react";
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

type AreaOption = Awaited<ReturnType<typeof getAreas>>[number];

function BusinessProfile() {
  const [profile, setProfile] = useState<BusinessProfileData | null>(null);
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

  return (
    <main className="business-profile">
      <section className="business-profile__header">
        <h1>Biznes profili</h1>
        <p>
          Müştərilərin gördüyü biznes məlumatlarını buradan idarə edin.
        </p>
      </section>

      <form className="business-profile__form" onSubmit={handleSubmit}>
        <section className="business-profile__card">
          <div className="business-profile__card-header">
            <div>
              <span>Əsas məlumatlar</span>
              <h2>Biznesiniz haqqında</h2>
            </div>

            <Building2 size={20} strokeWidth={1.8} />
          </div>

          <div className="business-profile__fields">
            <label className="business-profile__field">
              <span>Biznes adı</span>

              <div className="business-profile__input-wrapper">
                <Building2 size={18} strokeWidth={1.8} />
                <input
                  type="text"
                  placeholder="Məsələn, Bakı Beauty Studio"
                  value={profile.businessName}
                  onChange={(event) =>
                    update("businessName", event.target.value)
                  }
                  required
                />
              </div>
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

            <label className="business-profile__field">
              <span>Telefon</span>

              <div className="business-profile__input-wrapper">
                <Phone size={18} strokeWidth={1.8} />
                <input
                  type="tel"
                  placeholder="+994 50 000 00 00"
                  value={profile.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  required
                />
              </div>
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

        <section className="business-profile__card">
          <div className="business-profile__card-header">
            <div>
              <span>Təsvir</span>
              <h2>Biznes haqqında</h2>
            </div>
          </div>

          <label className="business-profile__field business-profile__field--full">
            <textarea
              placeholder="Biznesiniz və göstərdiyiniz xidmətlər haqqında qısa məlumat yazın..."
              value={profile.description}
              onChange={(event) => update("description", event.target.value)}
              rows={5}
            />
          </label>

          <Link to="/business/hours" className="business-profile__link">
            İş saatlarını dəyiş
            <ArrowRight size={15} strokeWidth={1.8} />
          </Link>
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
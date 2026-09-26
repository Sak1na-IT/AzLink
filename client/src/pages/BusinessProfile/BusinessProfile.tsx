import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  Clock3,
  Phone,
  Save,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  areaOptions,
  categoryOptions,
  getBusinessProfile,
  saveBusinessProfile,
} from "../../services/businessProfileStorage";
import { CURRENT_PROVIDER_ID } from "../../services/demoBusiness";
import {
  weekDays,
  weekDayLabels,
  type WeekDay,
  type DaySchedule,
} from "../../types/schedule";
import "./BusinessProfile.css";

function BusinessProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(() =>
    getBusinessProfile(CURRENT_PROVIDER_ID)
  );

  const updateDaySchedule = (
    day: WeekDay,
    changes: Partial<DaySchedule>
  ) => {
    setProfile((current) => ({
      ...current,
      schedule: {
        ...current.schedule,
        [day]: { ...current.schedule[day], ...changes },
      },
    }));
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    saveBusinessProfile(CURRENT_PROVIDER_ID, profile);

    navigate("/business");
  };

  return (
    <main className="business-profile">
      <div className="business-profile__top">
        <button
          type="button"
          className="business-profile__back"
          onClick={() => navigate("/business")}
        >
          <ArrowLeft size={18} strokeWidth={1.8} />
          Biznes panelinə qayıt
        </button>
      </div>

      <section className="business-profile__header">
        <div className="business-profile__header-icon">
          <Building2 size={24} strokeWidth={1.8} />
        </div>

        <div>
          <span className="business-profile__eyebrow">
            Biznes profili
          </span>

          <h1>Biznes məlumatlarını tamamlayın</h1>

          <p>
            Müştərilərin sizi daha asan tapması üçün
            biznesiniz haqqında əsas məlumatları əlavə
            edin.
          </p>
        </div>
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
                    setProfile((current) => ({
                      ...current,
                      businessName: event.target.value,
                    }))
                  }
                  required
                />
              </div>
            </label>

            <label className="business-profile__field">
              <span>Kateqoriya</span>

              <select
                value={profile.category}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
                required
              >
                <option value="">Kateqoriya seçin</option>

                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
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
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  required
                />
              </div>
            </label>

            <label className="business-profile__field">
              <span>Ərazi</span>

              <select
                value={profile.areaId}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    areaId: event.target.value,
                  }))
                }
                required
              >
                <option value="">Ərazi seçin</option>

                {areaOptions.map((area) => (
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
              <span>İş qrafiki</span>
              <h2>Hansı günlər açıqsınız</h2>
            </div>

            <Clock3 size={20} strokeWidth={1.8} />
          </div>

          <div className="business-profile__schedule">
            {weekDays.map((day) => {
              const daySchedule = profile.schedule[day];

              return (
                <div className="business-profile__schedule-row" key={day}>
                  <label className="business-profile__schedule-day">
                    <input
                      type="checkbox"
                      checked={daySchedule.isOpen}
                      onChange={(event) =>
                        updateDaySchedule(day, {
                          isOpen: event.target.checked,
                        })
                      }
                    />

                    <span>{weekDayLabels[day]}</span>
                  </label>

                  <div className="business-profile__schedule-times">
                    <input
                      type="time"
                      value={daySchedule.start}
                      disabled={!daySchedule.isOpen}
                      onChange={(event) =>
                        updateDaySchedule(day, {
                          start: event.target.value,
                        })
                      }
                    />

                    <span>—</span>

                    <input
                      type="time"
                      value={daySchedule.end}
                      disabled={!daySchedule.isOpen}
                      onChange={(event) =>
                        updateDaySchedule(day, {
                          end: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <label className="business-profile__field business-profile__field--full">
            <span>Biznes haqqında</span>

            <textarea
              placeholder="Biznesiniz və göstərdiyiniz xidmətlər haqqında qısa məlumat yazın..."
              value={profile.description}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={5}
            />
          </label>
        </section>

        <div className="business-profile__footer">
          <button
            type="button"
            className="business-profile__cancel"
            onClick={() => navigate("/business")}
          >
            Ləğv et
          </button>

          <button type="submit" className="business-profile__save">
            <Save size={18} strokeWidth={1.9} />
            Məlumatları yadda saxla
          </button>
        </div>
      </form>
    </main>
  );
}

export default BusinessProfile;
import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import "./BusinessHours.css";
import {
  getBusinessProfile,
  saveBusinessProfile,
  type BusinessProfile,
} from "../../services/businessService";
import {
  weekDays,
  weekDayLabels,
  type DaySchedule,
  type WeekDay,
  type WeeklySchedule,
} from "../../types/schedule";

/* 00:00, 00:30, ... 23:30 */
const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hours = String(Math.floor(index / 2)).padStart(2, "0");
  const minutes = index % 2 === 0 ? "00" : "30";
  return `${hours}:${minutes}`;
});

interface TimeSelectProps {
  value: string;
  label: string;
  onChange: (value: string) => void;
}

function TimeSelect({ value, label, onChange }: TimeSelectProps) {
  /* bazadakı dəyər siyahıda yoxdursa (məs. 09:15), itməsin */
  const options = TIME_OPTIONS.includes(value)
    ? TIME_OPTIONS
    : [...TIME_OPTIONS, value].sort();

  return (
    <select
      className="business-hours__select"
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((time) => (
        <option key={time} value={time}>
          {time}
        </option>
      ))}
    </select>
  );
}

function BusinessHours() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getBusinessProfile();
        setProfile(result);
        setSchedule(result.schedule);
      } catch {
        setLoadError("İş saatlarını yükləmək mümkün olmadı.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const updateDay = (day: WeekDay, changes: Partial<DaySchedule>) => {
    setMessage(null);
    setSchedule((current) =>
      current
        ? { ...current, [day]: { ...current[day], ...changes } }
        : current
    );
  };

  const handleSave = async () => {
    if (!profile || !schedule) return;

    const invalidDay = weekDays.find((day) => {
      const item = schedule[day];
      return item.isOpen && item.start >= item.end;
    });

    if (invalidDay) {
      setMessage({
        type: "error",
        text: `${weekDayLabels[invalidDay]}: bağlanış saatı açılış saatından sonra olmalıdır.`,
      });
      return;
    }

    try {
      setIsSaving(true);
      setMessage(null);
      await saveBusinessProfile({ ...profile, schedule });
      setMessage({ type: "ok", text: "İş saatları yadda saxlanıldı." });
    } catch {
      setMessage({ type: "error", text: "Yadda saxlamaq mümkün olmadı." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="business-hours">
        <p className="business-hours__loading">Yüklənir...</p>
      </main>
    );
  }

  if (loadError || !schedule) {
    return (
      <main className="business-hours">
        <p className="business-hours__loading">
          {loadError || "Məlumat tapılmadı."}
        </p>
      </main>
    );
  }

  return (
    <main className="business-hours">
      <section className="business-hours__header">
        <h1>İş saatları</h1>
        <p>Müştərilərin hansı gün və saatlarda rezerv edə biləcəyini seçin.</p>
      </section>

      <section className="business-hours__card">
        {weekDays.map((day) => {
          const item = schedule[day];

          return (
            <div className="business-hours__row" key={day}>
              <label className="business-hours__day">
                <input
                  type="checkbox"
                  checked={item.isOpen}
                  onChange={(event) =>
                    updateDay(day, { isOpen: event.target.checked })
                  }
                />
                <span>{weekDayLabels[day]}</span>
              </label>

              {item.isOpen ? (
                <div className="business-hours__times">
                  <TimeSelect
                    value={item.start}
                    label={`${weekDayLabels[day]} açılış saatı`}
                    onChange={(value) => updateDay(day, { start: value })}
                  />
                  <span className="business-hours__dash">–</span>
                  <TimeSelect
                    value={item.end}
                    label={`${weekDayLabels[day]} bağlanış saatı`}
                    onChange={(value) => updateDay(day, { end: value })}
                  />
                </div>
              ) : (
                <span className="business-hours__closed">Bağlı</span>
              )}
            </div>
          );
        })}
      </section>

      <div className="business-hours__footer">
        {message && (
          <span
            className={`business-hours__status business-hours__status--${message.type}`}
          >
            {message.text}
          </span>
        )}

        <button
          type="button"
          className="business-hours__save"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save size={18} strokeWidth={1.9} />
          {isSaving ? "Saxlanılır..." : "Dəyişiklikləri yadda saxla"}
        </button>
      </div>
    </main>
  );
}

export default BusinessHours;
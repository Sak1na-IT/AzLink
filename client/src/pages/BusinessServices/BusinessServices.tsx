import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Clock3, Pencil, Plus, Store, Trash2 } from "lucide-react";

import "./BusinessServices.css";
import {
  createService,
  deleteService,
  listServices,
  updateService,
} from "../../services/businessServicesService";
import type { ProviderService } from "../../types/provider";
import { formatDuration } from "../../utils/formatDuration";
import { t } from "../../i18n";

type FormState = {
  name: string;
  description: string;
  price: string;
  duration: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  duration: "60",
};

const messageStyle = {
  padding: "60px 0",
  textAlign: "center" as const,
  color: "var(--color-text-muted)",
  fontSize: "var(--font-size-sm)",
};

const formErrorStyle = {
  color: "var(--color-danger)",
  fontSize: "var(--font-size-sm)",
};

/* Frontend yoxlaması rahatlıq üçündür, backend-də də təkrar yoxlanmalıdır */
const validate = (
  form: FormState,
  services: ProviderService[],
  editingId: string | null
): FormErrors => {
  const errors: FormErrors = {};

  const name = form.name.trim();
  const price = Number(form.price);
  const duration = Number(form.duration);

  if (name.length < 2 || name.length > 60) {
    errors.name = t("Ad 2-60 simvol arasında olmalıdır.");
  } else {
    const isDuplicate = services.some(
      (s) =>
        s.id !== editingId &&
        s.name.trim().toLowerCase() === name.toLowerCase()
    );

    if (isDuplicate) {
      errors.name = t("Bu adda xidmət artıq mövcuddur.");
    }
  }

  if (form.description.trim().length > 120) {
    errors.description = t("Təsvir ən çox 120 simvol ola bilər.");
  }

  if (form.price.trim() === "" || !Number.isFinite(price) || price <= 0) {
    errors.price = t("Qiyməti 0-dan böyük rəqəm kimi yazın.");
  } else if (price > 10000) {
    errors.price = t("Qiymət 10 000 ₼-dən çox ola bilməz.");
  }

  if (
    form.duration.trim() === "" ||
    !Number.isInteger(duration) ||
    duration < 5 ||
    duration > 480
  ) {
    errors.duration = t("Müddət 5-480 dəqiqə arasında tam ədəd olmalıdır.");
  }

  return errors;
};

function BusinessServices() {
  const [services, setServices] = useState<ProviderService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoadError("");
      const result = await listServices();
      setServices(result);
      return result;
    } catch {
      setLoadError(t("Xidmətləri yükləmək mümkün olmadı."));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setFormError("");
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (service: ProviderService) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description,
      price: String(service.price),
      duration: String(service.duration),
    });
    setErrors({});
    setFormError("");
    setFormOpen(true);
  };

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(form, services, editingId);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const input = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      duration: Number(form.duration),
    };

    try {
      setIsSaving(true);
      setFormError("");

      if (editingId) {
        await updateService(editingId, input);
      } else {
        await createService(input);
      }

      await reload();
      closeForm();
    } catch {
      setFormError(
        editingId
          ? t("Dəyişikliyi yadda saxlamaq mümkün olmadı.")
          : t("Xidməti əlavə etmək mümkün olmadı. Biznes profilində kateqoriyanın seçildiyinə əmin olun.")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (service: ProviderService) => {
    if (
      !window.confirm(t("\"{name}\" xidmətini silmək istəyirsiniz?", { name: service.name }))
    ) {
      return;
    }

    try {
      setBusyId(service.id);

      try {
        await deleteService(service.id);
      } catch {
        /* Boş (204) cavab bəzən xəta kimi görünür: nəticəni siyahıdan yoxlayırıq */
      }

      const fresh = await reload();

      if (fresh && fresh.some((item) => item.id === service.id)) {
        alert(
          t("Xidməti silmək mümkün olmadı. Bu xidmət üzrə rezerv olduğu üçün silinməyə bilər.")
        );
        return;
      }

      if (editingId === service.id) {
        closeForm();
      }
    } finally {
      setBusyId(null);
    }
  };

  const previewDuration = Number(form.duration);

  if (isLoading) {
    return (
      <main className="business-services">
        <p style={messageStyle}>{t("Yüklənir...")}</p>
      </main>
    );
  }

  if (loadError && services.length === 0) {
    return (
      <main className="business-services">
        <p style={messageStyle}>{loadError}</p>
      </main>
    );
  }

  return (
    <main className="business-services">
      <section className="business-services__header">
        <div>
          <span className="biz-eyebrow">{t("Xidmətlər")}</span>
          <h1>{t("Xidmət menyusu")}</h1>

          <p>
            {t("Müştərilər rezerv edərkən bu xidmətlərdən birini seçir. Dəyişikliklər dərhal rezerv səhifəsində görünür.")}
          </p>
        </div>

        {!formOpen && (
          <button
            type="button"
            className="business-services__primary"
            onClick={openAdd}
          >
            <Plus size={18} strokeWidth={2} />
            {t("Yeni xidmət")}
          </button>
        )}
      </section>

      {formOpen && (
        <form
          className="business-services__form"
          onSubmit={handleSubmit}
          noValidate
        >
          <h2>{editingId ? t("Xidməti redaktə et") : t("Yeni xidmət")}</h2>

          <div className="business-services__field">
            <label htmlFor="service-name">{t("Ad")}</label>

            <input
              id="service-name"
              type="text"
              value={form.name}
              maxLength={60}
              placeholder={t("Məsələn: Manikür")}
              onChange={(event) => updateField("name", event.target.value)}
            />

            {errors.name && <small>{errors.name}</small>}
          </div>

          <div className="business-services__field">
            <label htmlFor="service-description">{t("Təsvir")}</label>

            <input
              id="service-description"
              type="text"
              value={form.description}
              maxLength={120}
              placeholder={t("Qısa izah (vacib deyil)")}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
            />

            {errors.description && <small>{errors.description}</small>}
          </div>

          <div className="business-services__row">
            <div className="business-services__field">
              <label htmlFor="service-price">Qiymət (₼)</label>

              <input
                id="service-price"
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={form.price}
                placeholder="20"
                onChange={(event) =>
                  updateField("price", event.target.value)
                }
              />

              {errors.price && <small>{errors.price}</small>}
            </div>

            <div className="business-services__field">
              <label htmlFor="service-duration">Müddət (dəqiqə)</label>

              <input
                id="service-duration"
                type="number"
                inputMode="numeric"
                min="5"
                max="480"
                step="5"
                value={form.duration}
                onChange={(event) =>
                  updateField("duration", event.target.value)
                }
              />

              {errors.duration ? (
                <small>{errors.duration}</small>
              ) : (
                Number.isInteger(previewDuration) &&
                previewDuration >= 5 && (
                  <span className="business-services__hint">
                    {formatDuration(previewDuration)}
                  </span>
                )
              )}
            </div>
          </div>

          {formError && <p style={formErrorStyle}>{formError}</p>}

          <div className="business-services__form-actions">
            <button
              type="button"
              className="business-services__secondary"
              onClick={closeForm}
              disabled={isSaving}
            >
              {t("Ləğv et")}
            </button>

            <button
              type="submit"
              className="business-services__primary"
              disabled={isSaving}
            >
              {isSaving
                ? t("Saxlanılır...")
                : editingId
                  ? t("Yadda saxla")
                  : t("Xidməti əlavə et")}
            </button>
          </div>
        </form>
      )}

      {services.length === 0 ? (
        <section className="business-services__empty">
          <div className="business-services__empty-icon">
            <Store size={24} strokeWidth={1.8} />
          </div>

          <h2>{t("Hələ xidmət yoxdur")}</h2>

          <p>
            {t("Xidmət əlavə edin ki, müştərilər sizdən rezerv edə bilsin.")}
          </p>
        </section>
      ) : (
        <section className="business-services__list">
          {services.map((service) => (
            <article key={service.id} className="business-service-card">
              <div className="business-service-card__info">
                <h3>{service.name}</h3>

                {service.description && <p>{service.description}</p>}

                <span className="business-service-card__duration">
                  <Clock3 size={14} strokeWidth={1.8} />
                  {formatDuration(service.duration)}
                </span>
              </div>

              <strong className="business-service-card__price">
                {service.price}
                <small className="manat">₼</small>
              </strong>

              <div className="business-service-card__actions">
                <button
                  type="button"
                  className="business-service-card__button"
                  onClick={() => openEdit(service)}
                  disabled={busyId === service.id}
                  aria-label={t("{name} xidmətini redaktə et", { name: service.name })}
                >
                  <Pencil size={16} strokeWidth={1.8} />
                  {t("Redaktə et")}
                </button>

                <button
                  type="button"
                  className="business-service-card__button business-service-card__button--danger"
                  onClick={() => handleDelete(service)}
                  disabled={busyId === service.id}
                  aria-label={t("{name} xidmətini sil", { name: service.name })}
                >
                  <Trash2 size={16} strokeWidth={1.8} />
                  {t("Sil")}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default BusinessServices;
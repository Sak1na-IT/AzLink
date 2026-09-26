import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock3,
  Pencil,
  Plus,
  Store,
  Trash2,
} from "lucide-react";

import "./BusinessServices.css";
import {
  addService,
  deleteService,
  getServicesByProvider,
  updateService,
} from "../../services/serviceStorage";
import { CURRENT_PROVIDER_ID } from "../../services/demoBusiness";
import type { ProviderService } from "../../types/provider";
import { formatDuration } from "../../utils/formatDuration";

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

/* Frontend yoxlaması rahatlıq üçündür, backend-də də təkrar yoxlanacaq */
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
    errors.name = "Ad 2-60 simvol arasında olmalıdır.";
  } else {
    const isDuplicate = services.some(
      (s) =>
        s.id !== editingId &&
        s.name.trim().toLowerCase() === name.toLowerCase()
    );

    if (isDuplicate) {
      errors.name = "Bu adda xidmət artıq mövcuddur.";
    }
  }

  if (form.description.trim().length > 120) {
    errors.description = "Təsvir ən çox 120 simvol ola bilər.";
  }

  if (form.price.trim() === "" || !Number.isFinite(price) || price <= 0) {
    errors.price = "Qiyməti 0-dan böyük rəqəm kimi yazın.";
  } else if (price > 10000) {
    errors.price = "Qiymət 10 000 ₼-dən çox ola bilməz.";
  }

  if (
    form.duration.trim() === "" ||
    !Number.isInteger(duration) ||
    duration < 5 ||
    duration > 480
  ) {
    errors.duration = "Müddət 5-480 dəqiqə arasında tam ədəd olmalıdır.";
  }

  return errors;
};

function BusinessServices() {
  const navigate = useNavigate();

  const [services, setServices] = useState<ProviderService[]>(() =>
    getServicesByProvider(CURRENT_PROVIDER_ID)
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const reload = () => {
    setServices(getServicesByProvider(CURRENT_PROVIDER_ID));
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
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
    setFormOpen(true);
  };

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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

    if (editingId) {
      updateService(CURRENT_PROVIDER_ID, editingId, input);
    } else {
      addService(CURRENT_PROVIDER_ID, input);
    }

    reload();
    closeForm();
  };

  const handleDelete = (service: ProviderService) => {
    if (
      !window.confirm(
        `"${service.name}" xidmətini silmək istəyirsiniz? Keçmiş rezervlər dəyişməyəcək.`
      )
    ) {
      return;
    }

    deleteService(CURRENT_PROVIDER_ID, service.id);

    if (editingId === service.id) {
      closeForm();
    }

    reload();
  };

  const previewDuration = Number(form.duration);

  return (
    <main className="business-services">
      <div className="business-services__top">
        <button
          type="button"
          className="business-services__back"
          onClick={() => navigate("/business")}
        >
          <ArrowLeft size={18} strokeWidth={1.8} />
          Biznes panelinə qayıt
        </button>
      </div>

      <section className="business-services__header">
        <div>
          <h1>Xidmətlər</h1>

          <p>
            Müştərilər rezerv edərkən bu xidmətlərdən birini seçir.
            Dəyişikliklər dərhal rezerv səhifəsində görünür.
          </p>
        </div>

        {!formOpen && (
          <button
            type="button"
            className="business-services__primary"
            onClick={openAdd}
          >
            <Plus size={18} strokeWidth={2} />
            Yeni xidmət
          </button>
        )}
      </section>

      {formOpen && (
        <form
          className="business-services__form"
          onSubmit={handleSubmit}
          noValidate
        >
          <h2>{editingId ? "Xidməti redaktə et" : "Yeni xidmət"}</h2>

          <div className="business-services__field">
            <label htmlFor="service-name">Ad</label>

            <input
              id="service-name"
              type="text"
              value={form.name}
              maxLength={60}
              placeholder="Məsələn: Manikür"
              onChange={(event) => updateField("name", event.target.value)}
            />

            {errors.name && <small>{errors.name}</small>}
          </div>

          <div className="business-services__field">
            <label htmlFor="service-description">Təsvir</label>

            <input
              id="service-description"
              type="text"
              value={form.description}
              maxLength={120}
              placeholder="Qısa izah (vacib deyil)"
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

          <div className="business-services__form-actions">
            <button
              type="button"
              className="business-services__secondary"
              onClick={closeForm}
            >
              Ləğv et
            </button>

            <button type="submit" className="business-services__primary">
              {editingId ? "Yadda saxla" : "Xidməti əlavə et"}
            </button>
          </div>
        </form>
      )}

      {services.length === 0 ? (
        <section className="business-services__empty">
          <div className="business-services__empty-icon">
            <Store size={24} strokeWidth={1.8} />
          </div>

          <h2>Hələ xidmət yoxdur</h2>

          <p>
            Xidmət əlavə edin ki, müştərilər sizdən rezerv edə bilsin.
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
                {service.price} ₼
              </strong>

              <div className="business-service-card__actions">
                <button
                  type="button"
                  className="business-service-card__button"
                  onClick={() => openEdit(service)}
                  aria-label={`${service.name} xidmətini redaktə et`}
                >
                  <Pencil size={16} strokeWidth={1.8} />
                  Redaktə et
                </button>

                <button
                  type="button"
                  className="business-service-card__button business-service-card__button--danger"
                  onClick={() => handleDelete(service)}
                  aria-label={`${service.name} xidmətini sil`}
                >
                  <Trash2 size={16} strokeWidth={1.8} />
                  Sil
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

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Images, Trash2, Upload } from "lucide-react";

import {
  getPortfolio,
  addPortfolioImage,
  deletePortfolioImage,
  type PortfolioImage,
} from "../../services/businessPortfolioService";
import { compressImage } from "../../utils/compressImage";
import "./BusinessPortfolio.css";
import { t } from "../../i18n";

/* Şəkil yüklənməzdən əvvəl kiçildilir, ona görə böyük fayllar da olar */
const MAX_FILE_SIZE_MB = 20;

function BusinessPortfolio() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const reload = async () => {
    try {
      const result = await getPortfolio();
      setImages(result);
    } catch {
      setError(t("Portfolio yüklənmədi. Yenidən cəhd edin."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(t("Yalnız şəkil faylı yükləyə bilərsiniz."));
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(t("Şəkil {MAX_FILE_SIZE_MB}MB-dan böyük ola bilməz.", { MAX_FILE_SIZE_MB }));
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const dataUrl = await compressImage(file);

      await addPortfolioImage({
        dataUrl,
        caption: caption.trim(),
      });

      setCaption("");
      await reload();
    } catch {
      setError(t("Şəkli yükləmək mümkün olmadı. Yenidən sınayın."));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (image: PortfolioImage) => {
    if (
      !window.confirm(
        t("Bu şəkli silmək istəyirsiniz? Bu əməliyyat geri qaytarıla bilməz.")
      )
    ) {
      return;
    }

    try {
      await deletePortfolioImage(image.id);
      await reload();
    } catch {
      setError(t("Şəkli silmək mümkün olmadı."));
    }
  };

  if (isLoading) {
    return (
      <main className="business-portfolio">
        <p className="business-portfolio__hint">{t("Yüklənir...")}</p>
      </main>
    );
  }

  return (
    <main className="business-portfolio">
      <section className="business-portfolio__header">
        <div>
          <span className="biz-eyebrow">{t("Portfolio")}</span>
          <h1>{t("İş nümunələri")}</h1>

          <p>
            {t("İş nümunələrinizi əlavə edin. Müştərilər bunları profil səhifənizdə görəcək.")}
          </p>
        </div>
      </section>

      <section className="business-portfolio__upload">
        <input
          type="text"
          placeholder={t("Şəkil üçün qısa izah (vacib deyil)")}
          value={caption}
          maxLength={80}
          onChange={(event) => setCaption(event.target.value)}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          hidden
        />

        <button
          type="button"
          className="business-portfolio__upload-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload size={18} strokeWidth={1.9} />
          {isUploading ? t("Yüklənir...") : t("Şəkil yüklə")}
        </button>

        {error && <small className="business-portfolio__error">{error}</small>}

        <small className="business-portfolio__hint">
          {t("Ən çox {size}MB. Şəkillər serverdə saxlanılır və profilinizdə hər kəsə görünür.", { size: MAX_FILE_SIZE_MB })}
        </small>
      </section>

      {images.length === 0 ? (
        <section className="business-portfolio__empty">
          <div className="business-portfolio__empty-icon">
            <Images size={24} strokeWidth={1.8} />
          </div>

          <h2>{t("Hələ şəkil yoxdur")}</h2>

          <p>{t("İlk iş nümunənizi yükləyin.")}</p>
        </section>
      ) : (
        <section className="business-portfolio__grid">
          {images.map((image) => (
            <article key={image.id} className="business-portfolio-item">
              <img src={image.dataUrl} alt={image.caption || t("Portfolio")} />

              {image.caption && (
                <span className="business-portfolio-item__caption">
                  {image.caption}
                </span>
              )}

              <button
                type="button"
                className="business-portfolio-item__delete"
                onClick={() => handleDelete(image)}
                aria-label={t("Şəkli sil")}
              >
                <Trash2 size={16} strokeWidth={1.8} />
              </button>
            </article>
          ))}
        </section>
      )}

      {images.length === 0 && (
        <button
          type="button"
          className="business-portfolio__empty-cta"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus size={18} strokeWidth={1.8} />
          {t("İlk şəkli yüklə")}
        </button>
      )}
    </main>
  );
}

export default BusinessPortfolio;
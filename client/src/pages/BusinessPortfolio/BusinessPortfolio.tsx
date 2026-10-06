import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ImagePlus, Images, Trash2, Upload } from "lucide-react";

import {
  getPortfolio,
  addPortfolioImage,
  deletePortfolioImage,
  type PortfolioImage,
} from "../../services/businessPortfolioService";
import "./BusinessPortfolio.css";

/* Backend ~10MB-a qədər base64 şəkli qəbul edir, bir az ehtiyatla 5MB saxlayırıq */
const MAX_FILE_SIZE_MB = 5;

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);

    reader.readAsDataURL(file);
  });

function BusinessPortfolio() {
  const navigate = useNavigate();
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
      setError("Portfolio yüklənmədi. Yenidən cəhd edin.");
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
      setError("Yalnız şəkil faylı yükləyə bilərsiniz.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Şəkil ${MAX_FILE_SIZE_MB}MB-dan böyük ola bilməz.`);
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const dataUrl = await readFileAsDataUrl(file);

      await addPortfolioImage({
        dataUrl,
        caption: caption.trim(),
      });

      setCaption("");
      await reload();
    } catch {
      setError("Şəkli yükləmək mümkün olmadı. Yenidən sınayın.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (image: PortfolioImage) => {
    if (
      !window.confirm(
        "Bu şəkli silmək istəyirsiniz? Bu əməliyyat geri qaytarıla bilməz."
      )
    ) {
      return;
    }

    try {
      await deletePortfolioImage(image.id);
      await reload();
    } catch {
      setError("Şəkli silmək mümkün olmadı.");
    }
  };

  if (isLoading) {
    return (
      <main className="business-portfolio">
        <p className="business-portfolio__hint">Yüklənir...</p>
      </main>
    );
  }

  return (
    <main className="business-portfolio">
      <div className="business-portfolio__top">
        <button
          type="button"
          className="business-portfolio__back"
          onClick={() => navigate("/business")}
        >
          <ArrowLeft size={18} strokeWidth={1.8} />
          Biznes panelinə qayıt
        </button>
      </div>

      <section className="business-portfolio__header">
        <div>
          <h1>Portfolio</h1>

          <p>
            İş nümunələrinizi əlavə edin. Müştərilər bunları profil
            səhifənizdə görəcək.
          </p>
        </div>
      </section>

      <section className="business-portfolio__upload">
        <input
          type="text"
          placeholder="Şəkil üçün qısa izah (vacib deyil)"
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
          {isUploading ? "Yüklənir..." : "Şəkil yüklə"}
        </button>

        {error && <small className="business-portfolio__error">{error}</small>}

        <small className="business-portfolio__hint">
          Ən çox {MAX_FILE_SIZE_MB}MB. Şəkillər serverdə saxlanılır və
          profilinizdə hər kəsə görünür.
        </small>
      </section>

      {images.length === 0 ? (
        <section className="business-portfolio__empty">
          <div className="business-portfolio__empty-icon">
            <Images size={24} strokeWidth={1.8} />
          </div>

          <h2>Hələ şəkil yoxdur</h2>

          <p>İlk iş nümunənizi yükləyin.</p>
        </section>
      ) : (
        <section className="business-portfolio__grid">
          {images.map((image) => (
            <article key={image.id} className="business-portfolio-item">
              <img src={image.dataUrl} alt={image.caption || "Portfolio"} />

              {image.caption && (
                <span className="business-portfolio-item__caption">
                  {image.caption}
                </span>
              )}

              <button
                type="button"
                className="business-portfolio-item__delete"
                onClick={() => handleDelete(image)}
                aria-label="Şəkli sil"
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
          İlk şəkli yüklə
        </button>
      )}
    </main>
  );
}

export default BusinessPortfolio;
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import "./Interactions.css";

/*
 * Saytın mövcud dizaynına toxunmadan interaktivlik əlavə edir.
 * AppLayout-da bir dəfə qoşulur və bütün səhifələrdə işləyir:
 *
 *  1. Kartlar siçana tərəf azca əyilir, üzərində yumşaq işıq gəzir.
 *  2. Bölmələr və kartlar aşağı sürüşdürdükcə yumşaqca üzə çıxır
 *     (bir dəfə, növbə ilə).
 *  3. "Bu gün" statistikasındakı rəqəmlər görünəndə 0-dan sayılır.
 *
 * Komponentlərin özləri dəyişmir: hamısı CSS sinifləri ilə tapılır.
 * "Azaldılmış hərəkət" seçilibsə heç biri işləmir.
 */

/* Klikləyən kartlar: əyilmə və işıq */
const TILT_SELECTOR = [
  ".popular-card",
  ".search-provider-card",
  ".saved-card",
  ".explore-category-card",
  ".provider-service-item",
  ".business-stat-card",
  ".helpful-info__card",
  ".how-it-works__item",
  ".upcoming-bookings__item",
  ".booking-card",
  ".business-service-card",
].join(", ");

/* Sürüşdürəndə üzə çıxan elementlər */
const REVEAL_SELECTOR = [
  ".home-section",
  ".popular-card",
  ".how-it-works__item",
  ".helpful-info__card",
  ".search-provider-card",
  ".saved-card",
  ".explore-category-card",
  ".booking-card",
  ".business-stat-card",
  ".business-service-card",
].join(", ");

/* Görünəndə sayılan rəqəmlər */
const COUNT_SELECTOR = ".today-overview__stats strong";

const MAX_TILT = 5;

function Interactions() {
  const location = useLocation();

  /* ---------- 1. Kartların əyilməsi və işıq ---------- */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let current: HTMLElement | null = null;
    let frame = 0;
    let lastEvent: PointerEvent | null = null;

    const release = () => {
      if (current) {
        current.classList.remove("is-tilting");
        current.style.removeProperty("--tilt-x");
        current.style.removeProperty("--tilt-y");
        current = null;
      }
    };

    const update = () => {
      frame = 0;

      if (!lastEvent) {
        return;
      }

      const target = (lastEvent.target as Element | null)?.closest?.(
        TILT_SELECTOR
      ) as HTMLElement | null;

      if (target !== current) {
        release();
        current = target;
      }

      if (!current) {
        return;
      }

      const rect = current.getBoundingClientRect();
      const x = (lastEvent.clientX - rect.left) / rect.width;
      const y = (lastEvent.clientY - rect.top) / rect.height;

      current.classList.add("is-tilting");
      current.style.setProperty("--tilt-x", `${(0.5 - y) * MAX_TILT}deg`);
      current.style.setProperty("--tilt-y", `${(x - 0.5) * MAX_TILT}deg`);
      current.style.setProperty("--light-x", `${x * 100}%`);
      current.style.setProperty("--light-y", `${y * 100}%`);
    };

    const handleMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        return;
      }

      lastEvent = event;

      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };

    document.addEventListener("pointermove", handleMove, { passive: true });
    document.addEventListener("pointerleave", release);

    return () => {
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerleave", release);
      cancelAnimationFrame(frame);
      release();
    };
  }, []);

  /* ---------- 2–3. Üzə çıxma və rəqəm sayma ---------- */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const countUp = (element: HTMLElement) => {
      const text = element.textContent?.trim() ?? "";

      if (!/^\d+$/.test(text) || element.dataset.counted) {
        return;
      }

      element.dataset.counted = "true";
      const target = Number(text);
      const start = performance.now();
      const duration = 900;

      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = String(Math.round(target * eased));

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          element.textContent = text;
        }
      };

      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          const element = entry.target as HTMLElement;
          element.classList.add("is-revealed");
          observer.unobserve(element);

          element
            .querySelectorAll<HTMLElement>(COUNT_SELECTOR)
            .forEach(countUp);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    const prepare = () => {
      document
        .querySelectorAll<HTMLElement>(REVEAL_SELECTOR)
        .forEach((element) => {
          if (element.dataset.reveal) {
            return;
          }

          /* Bir bölmə daxilindəki kartlar növbə ilə çıxır */
          const siblings = element.parentElement
            ? Array.from(element.parentElement.children)
            : [];
          const index = Math.max(0, siblings.indexOf(element));

          element.dataset.reveal = "true";
          element.style.setProperty(
            "--reveal-delay",
            `${Math.min(index, 6) * 70}ms`
          );
          element.classList.add("reveal");
          observer.observe(element);
        });
    };

    prepare();

    /* Məlumat sonradan yüklənəndə yeni kartlar da tutulsun */
    const mutations = new MutationObserver(() => prepare());
    mutations.observe(document.body, { childList: true, subtree: true });

    /* Ehtiyat: nə olursa olsun 2.5 saniyədən sonra hamısı görünür */
    const fallback = window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>(".reveal:not(.is-revealed)")
        .forEach((element) => {
          const rect = element.getBoundingClientRect();

          if (rect.top < window.innerHeight) {
            element.classList.add("is-revealed");
          }
        });
    }, 2500);

    return () => {
      observer.disconnect();
      mutations.disconnect();
      window.clearTimeout(fallback);
    };
  }, [location.pathname]);

  return null;
}

export default Interactions;

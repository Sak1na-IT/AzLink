import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

import "./Pearl.css";

interface PearlProps {
  /* Diametr, px ilə. Verilməsə, ölçünü CSS (--pearl-size) təyin edir */
  size?: number;
  className?: string;
}

/*
 * AzLink-in simvolu: mirvari ("Xəzərin incisi").
 *
 * Səhifə açılanda bir dəfə "əmələ gəlir" (dumanlı kiçik formadan
 * aydın kürəyə), ətrafında suda olduğu kimi tək bir dalğa yayılır.
 * Siçan hərəkət etdikcə işıq ləkəsi və sədəf çalarları siçana tərəf
 * dönür. Toxunma ekranında və "azaldılmış hərəkət" seçilibsə sakit qalır.
 *
 * Hesablama yalnız CSS dəyişənlərini (--px, --py) yeniləyir, React
 * yenidən render olunmur.
 */
function Pearl({ size, className = "" }: PearlProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      return;
    }

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      /* Mərkəzdən məsafə, təxminən -1 … 1 aralığında */
      const reach = Math.max(rect.width, 280) * 1.6;

      targetX = Math.max(-1, Math.min(1, (event.clientX - centerX) / reach));
      targetY = Math.max(-1, Math.min(1, (event.clientY - centerY) / reach));

      if (!frame) {
        frame = requestAnimationFrame(tick);
      }
    };

    /* Yumşaq gecikmə: işıq siçanın arxasınca "üzür" */
    const tick = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      element.style.setProperty("--px", currentX.toFixed(4));
      element.style.setProperty("--py", currentY.toFixed(4));

      const settled =
        Math.abs(targetX - currentX) < 0.001 &&
        Math.abs(targetY - currentY) < 0.001;

      frame = settled ? 0 : requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", handleMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handleMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`pearl ${className}`}
      style={
        size ? ({ "--pearl-size": `${size}px` } as CSSProperties) : undefined
      }
      aria-hidden="true"
    >
      <span className="pearl__ripple" />
      <span className="pearl__shadow" />

      <span className="pearl__orb">
        <span className="pearl__body" />
        <span className="pearl__nacre" />
        <span className="pearl__rim" />
        <span className="pearl__shine" />
      </span>
    </div>
  );
}

export default Pearl;

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import GoldDust from "./GoldDust";
import "./VelvetStage.css";

interface VelvetStageProps {
  children: ReactNode;
  className?: string;
  dust?: boolean;
}

/*
 * Zərgər vitrini: tünd zümrüd məxmər fon, üzərində yumşaq işıq
 * ləkəsi siçanın arxasınca hərəkət edir. İşıqlı və qaranlıq rejimdə
 * eyni görünür. dust={true} verilsə, arxada qızıl tozu süzülür.
 */
function VelvetStage({ children, className = "", dust = false }: VelvetStageProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    let frame = 0;

    const handleMove = (event: PointerEvent) => {
      if (frame) {
        return;
      }

      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = element.getBoundingClientRect();
        element.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        element.style.setProperty("--my", `${event.clientY - rect.top}px`);
      });
    };

    element.addEventListener("pointermove", handleMove, { passive: true });

    return () => {
      element.removeEventListener("pointermove", handleMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={ref} className={`velvet-stage ${className}`}>
      {dust && <GoldDust />}
      {children}
    </section>
  );
}

export default VelvetStage;

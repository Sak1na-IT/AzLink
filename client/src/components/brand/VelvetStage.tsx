import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import "./VelvetStage.css";

interface VelvetStageProps {
  children: ReactNode;
  className?: string;
}

/*
 * Zərgər vitrini: tünd zümrüd məxmər fon, üzərində yumşaq işıq
 * ləkəsi siçanın arxasınca hərəkət edir. Mirvari boyunbağı bunun
 * içində göstərilir. İşıqlı və qaranlıq rejimdə eyni görünür.
 */
function VelvetStage({ children, className = "" }: VelvetStageProps) {
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
      {children}
    </section>
  );
}

export default VelvetStage;

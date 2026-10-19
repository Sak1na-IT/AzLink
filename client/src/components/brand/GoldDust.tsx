import { useEffect, useRef } from "react";

/*
 * Arxa fonda yavaşca yuxarı süzülən, parıldayan qızıl tozu.
 * Valideyn elementin ölçüsünü tutur; görünmürsə dayanır.
 * "Azaldılmış hərəkət" seçilibsə heç nə çəkmir.
 */
function GoldDust({ count = 40 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");

    if (
      !canvas ||
      !context ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;

    const motes = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.5,
      speed: 0.00025 + Math.random() * 0.0006,
      phase: Math.random() * Math.PI * 2,
    }));

    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      frame = 0;

      if (!visible) {
        return;
      }

      context.clearRect(0, 0, width, height);

      for (const mote of motes) {
        mote.y -= mote.speed;

        if (mote.y < -0.05) {
          mote.y = 1.05;
          mote.x = Math.random();
        }

        const twinkle = 0.35 + Math.sin(now * 0.002 + mote.phase) * 0.3;
        context.fillStyle = `rgba(236, 210, 150, ${twinkle * 0.55})`;
        context.beginPath();
        context.arc(
          mote.x * width + Math.sin(now * 0.0004 + mote.phase) * 12,
          mote.y * height,
          mote.r,
          0,
          Math.PI * 2
        );
        context.fill();
      }

      frame = requestAnimationFrame(draw);
    };

    measure();
    frame = requestAnimationFrame(draw);

    const resize = new ResizeObserver(measure);
    resize.observe(canvas);

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;

      if (visible && !frame) {
        frame = requestAnimationFrame(draw);
      }
    });
    intersection.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
    };
  }, [count]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

export default GoldDust;

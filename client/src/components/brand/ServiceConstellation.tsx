import { useEffect, useRef, useState } from "react";

import { categories } from "../../data/categories";
import "./ServiceConstellation.css";

interface ServiceConstellationProps {
  /* Sahə kliklənəndə kateqoriya id-si ilə çağırılır */
  onSelect?: (categoryId: string) => void;
  /* Hər sahədə neçə biznes var (kateqoriya adı → say); verilsə, göstərilir */
  counts?: Record<string, number>;
  className?: string;
}

/*
 * "AzLink = bağlantı".
 *
 * Mərkəzdə AzLink, ətrafında 8 xidmət sahəsi (data/categories.ts)
 * maili orbitdə sakitcə fırlanır. Hər sahə mərkəzə incə qızılı xətlə
 * bağlıdır, xətt boyunca yavaşca işıq axır: bütün ehtiyaclar bir
 * yerdə birləşir.
 *
 *  - açılışda sahələr mərkəzdən açılıb yerinə düzülür (bir dəfə);
 *  - sistem siçana tərəf azca əyilir;
 *  - sahənin üstünə gələndə fırlanma yavaşlayıb dayanır, xətt parlayır;
 *  - sahələr adi <button>-dur: klik, klaviatura və ekran oxuyucusu işləyir.
 *
 * Mövqelər hər kadrda ref-lər vasitəsilə yenilənir, React yenidən
 * render olunmur.
 */

const TAU = Math.PI * 2;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function ServiceConstellation({
  onSelect,
  counts,
  className = "",
}: ServiceConstellationProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const sparkRefs = useRef<(SVGCircleElement | null)[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const orbitRef = useRef<SVGEllipseElement>(null);
  const orbitOuterRef = useRef<SVGEllipseElement>(null);

  const [hovered, setHovered] = useState<number | null>(null);
  const hoveredRef = useRef<number | null>(null);

  hoveredRef.current = hovered;

  useEffect(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;

    if (!wrap || !svg) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const count = categories.length;

    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let last = performance.now();
    const start = last;

    let rotation = -Math.PI / 2;
    let speed = reduceMotion ? 0 : 0.00009;

    const mouse = { x: 0, y: 0 };
    const tilt = { x: 0, y: 0 };

    /* Şüşə dairənin ölçüsü (telefonda kiçilir); hər kadrda ölçməmək üçün saxlanır */
    let iconSize = 66;

    const measure = () => {
      const icon = nodeRefs.current[0]?.firstElementChild as HTMLElement | null;
      iconSize = icon?.offsetWidth || 66;

      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    };

    const render = (now: number) => {
      frame = 0;

      if (!visible) {
        return;
      }

      const dt = Math.min(now - last, 64);
      last = now;

      /* Üzərinə gəlinəndə fırlanma yumşaqca dayanır */
      const targetSpeed =
        reduceMotion || hoveredRef.current !== null ? 0 : 0.00009;
      speed += (targetSpeed - speed) * 0.05;
      rotation += speed * dt;

      tilt.x += (mouse.x - tilt.x) * 0.05;
      tilt.y += (mouse.y - tilt.y) * 0.05;

      const intro = reduceMotion
        ? 1
        : easeOutCubic(clamp((now - start - 200) / 1600, 0, 1));

      const cx = width / 2 + tilt.x * width * 0.02;
      const cy = height / 2 + tilt.y * height * 0.02;

      /* Maili orbit: üfüqi radius böyük, şaquli kiçik */
      const radiusX = width * 0.4 * (0.35 + 0.65 * intro);
      const radiusY =
        height * (0.3 + tilt.y * 0.05) * (0.35 + 0.65 * intro);

      /* Orbitin incə xətləri (astrolyabiya kimi) */
      const orbit = orbitRef.current;
      const orbitOuter = orbitOuterRef.current;

      if (orbit && orbitOuter) {
        for (const [ellipse, factor] of [
          [orbit, 1],
          [orbitOuter, 1.22],
        ] as const) {
          ellipse.setAttribute("cx", String(cx));
          ellipse.setAttribute("cy", String(cy));
          ellipse.setAttribute("rx", String(radiusX * factor));
          ellipse.setAttribute("ry", String(radiusY * factor));
          ellipse.style.opacity = String(intro);
        }
      }

      for (let i = 0; i < count; i += 1) {
        const node = nodeRefs.current[i];
        const line = lineRefs.current[i];
        const spark = sparkRefs.current[i];

        if (!node || !line || !spark) {
          continue;
        }

        const angle = rotation + (i / count) * TAU + tilt.x * 0.25;
        /* depth: 1 = ən önde (aşağıda), -1 = ən arxada (yuxarıda) */
        const depth = Math.sin(angle);
        const front = (depth + 1) / 2;

        const x = cx + Math.cos(angle) * radiusX;
        const y = cy + depth * radiusY;

        /* Hər sahə növbə ilə görünür */
        const appear = reduceMotion
          ? 1
          : easeOutCubic(clamp((now - start - 300 - i * 90) / 700, 0, 1));

        const isHovered = hoveredRef.current === i;
        const scale = (0.74 + front * 0.3) * (isHovered ? 1.08 : 1);
        const opacity = (0.45 + front * 0.55) * appear;

        /* Şüşə dairənin mərkəzi (x, y) nöqtəsinə düşür, ad isə altında qalır */
        node.style.transformOrigin = `50% ${iconSize / 2}px`;
        node.style.transform = `translate(${x}px, ${y}px) translate(-50%, ${-iconSize / 2}px) scale(${scale})`;
        node.style.opacity = String(isHovered ? 1 : opacity);
        node.style.zIndex = String(depth > 0 || isHovered ? 3 : 1);

        /* Xətt şüşə dairənin kənarında bitir, içinə girmir */
        const iconRadius = iconSize;
        const distance = Math.hypot(x - cx, y - cy) || 1;
        const edge = Math.max(0, distance - (iconRadius / 2) * scale - 4);
        const ex = cx + ((x - cx) / distance) * edge;
        const ey = cy + ((y - cy) / distance) * edge;

        line.setAttribute("x1", String(cx));
        line.setAttribute("y1", String(cy));
        line.setAttribute("x2", String(ex));
        line.setAttribute("y2", String(ey));
        line.style.opacity = String(
          (isHovered ? 0.95 : 0.16 + front * 0.3) * appear
        );

        /* Xətt boyunca mərkəzdən sahəyə axan işıq */
        const period = 3600;
        const t = reduceMotion
          ? 0
          : ((now + i * (period / count)) % period) / period;
        const sx = cx + (ex - cx) * t;
        const sy = cy + (ey - cy) * t;

        spark.setAttribute("cx", String(sx));
        spark.setAttribute("cy", String(sy));
        spark.style.opacity = reduceMotion
          ? "0"
          : String(Math.sin(t * Math.PI) * (0.35 + front * 0.6) * appear);
      }

      frame = requestAnimationFrame(render);
    };

    const loop = () => {
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(render);
      }
    };

    const handleMove = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      mouse.x = clamp((event.clientX - rect.left) / rect.width - 0.5, -0.6, 0.6);
      mouse.y = clamp((event.clientY - rect.top) / rect.height - 0.5, -0.6, 0.6);
    };

    measure();
    loop();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(wrap);

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;

      if (visible) {
        loop();
      }
    });
    intersection.observe(wrap);

    window.addEventListener("pointermove", handleMove, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", handleMove);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`constellation ${className}`}>
      <svg ref={svgRef} className="constellation__lines" aria-hidden="true">
        <defs>
          <radialGradient id="constellation-spark">
            <stop offset="0%" stopColor="#fff6dc" />
            <stop offset="100%" stopColor="#e3c98f" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse ref={orbitRef} className="constellation__orbit" />
        <ellipse
          ref={orbitOuterRef}
          className="constellation__orbit constellation__orbit--outer"
        />

        {categories.map((category, i) => (
          <line
            key={category.id}
            ref={(element) => {
              lineRefs.current[i] = element;
            }}
            className="constellation__line"
          />
        ))}

        {categories.map((category, i) => (
          <circle
            key={category.id}
            ref={(element) => {
              sparkRefs.current[i] = element;
            }}
            r="5"
            fill="url(#constellation-spark)"
          />
        ))}
      </svg>

      <div className="constellation__core" aria-hidden="true">
        <span className="constellation__ring" />
        <span className="constellation__ring constellation__ring--outer" />
        <strong>AzLink</strong>
        <small>Bakı</small>
      </div>

      {categories.map((category, i) => {
        const Icon = category.icon;

        return (
          <button
            key={category.id}
            ref={(element) => {
              nodeRefs.current[i] = element;
            }}
            type="button"
            className={`constellation__node ${
              hovered === i ? "is-hovered" : ""
            }`}
            onClick={() => onSelect?.(category.id)}
            onPointerEnter={() => setHovered(i)}
            onPointerLeave={() => setHovered(null)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
            aria-label={`${category.name}: ${category.services.join(", ")}`}
          >
            <span className="constellation__icon">
              <Icon size={24} strokeWidth={1.6} />
            </span>

            <span className="constellation__label">{category.name}</span>

            <span className="constellation__services">
              {counts?.[category.name] ? (
                <b>{counts[category.name]} biznes</b>
              ) : null}
              {category.services.join(", ")}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default ServiceConstellation;

import { useEffect, useRef, useState } from "react";

import { categories } from "../../data/categories";
import "./ServiceBoutique.css";
import { t } from "../../i18n";

/* Bir sahə haqqında bazadan gələn real məlumat */
export interface CategoryStats {
  businessCount: number;
  /* Ən aşağı qiymət, ₼ */
  priceFrom: number | null;
  /* Ən ucuz bir neçə xidmət */
  topServices: { name: string; price: number }[];
}

interface ServiceBoutiqueProps {
  /* "Ustaları gör" basılanda kateqoriya id-si ilə çağırılır */
  onSelect?: (categoryId: string) => void;
  /* Kateqoriya adı → statistika */
  stats?: Record<string, CategoryStats>;
  className?: string;
}

/*
 * "Xidmət butiki" — giriş ekranının əsas elementi.
 *
 * 8 xidmət sahəsi qızılı haşiyəli medalyonlardır, hər biri mərkəzdəki
 * AzLink-ə qızılı sapla bağlıdır. Hamısı sadə 2D fizika ilə hərəkət edir:
 *  - açılışda kənarlardan uçub gəlir və orbitdəki yerinə oturur;
 *  - siçan yaxınlaşanda sudakı kimi yana çəkilir;
 *  - medalyonu tutub atmaq olur: uçur, digərlərinə dəyib sıçrayır,
 *    sap dartılır, sonra yellənərək yerinə qayıdır;
 *  - klikləyəndə (dartmadan) həmin sahənin kartı açılır.
 *
 * Mövqelər hər kadrda ref-lər vasitəsilə yazılır, React yenidən render
 * olunmur. Medalyonlar adi <button>-dur, klaviatura ilə də işləyir.
 */

type Body = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /* açılışda haradan uçub gəlir */
  fromX: number;
  fromY: number;
  arriveAt: number;
};

const TAU = Math.PI * 2;
const STEP = 1000 / 60;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function ServiceBoutique({
  onSelect,
  stats,
  className = "",
}: ServiceBoutiqueProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const threadRefs = useRef<(SVGPathElement | null)[]>([]);
  const sparkRefs = useRef<(SVGCircleElement | null)[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  /* Fizika döngüsü bunları ref-dən oxuyur */
  const hoveredRef = useRef<number | null>(null);
  const selectedRef = useRef<number | null>(null);
  const clickRef = useRef<(index: number) => void>(() => {});

  hoveredRef.current = hovered;
  selectedRef.current = selected;
  clickRef.current = (index: number) =>
    setSelected((current) => (current === index ? null : index));

  useEffect(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    const dust = dustRef.current;
    const dustCtx = dust?.getContext("2d");

    if (!wrap || !svg || !dust || !dustCtx) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const count = categories.length;
    const start = performance.now();

    let width = 0;
    let height = 0;
    let cx = 0;
    let cy = 0;
    let radiusX = 0;
    let radiusY = 0;
    let coreRadius = 64;
    let bodyRadius = 38;
    let rotation = -Math.PI / 2;
    let frame = 0;
    let visible = true;
    let last = start;
    let accumulator = 0;

    const pointer = { x: -9999, y: -9999, vx: 0, vy: 0, inside: false };
    let dragging: number | null = null;
    let downAt = { x: 0, y: 0, time: 0 };

    const bodies: Body[] = categories.map((_, i) => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      r: 38,
      fromX: 0,
      fromY: 0,
      arriveAt: reduceMotion ? 0 : 250 + i * 110,
    }));

    /* Qızıl tozu */
    const motes = Array.from({ length: 46 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.6,
      speed: 0.00002 + Math.random() * 0.00005,
      phase: Math.random() * TAU,
    }));

    const home = (i: number) => {
      const angle = rotation + (i / count) * TAU;
      return {
        x: cx + Math.cos(angle) * radiusX,
        y: cy + Math.sin(angle) * radiusY,
      };
    };

    const measure = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const firstLayout = width === 0;

      width = rect.width;
      height = rect.height;
      cx = width / 2;
      cy = height / 2;

      const narrow = width < 560;
      bodyRadius = narrow ? 27 : 38;
      coreRadius = narrow ? 46 : 64;
      radiusX = Math.min(width * 0.4, 330);
      radiusY = Math.min(height * 0.36, 230);

      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      dust.width = Math.round(width * dpr);
      dust.height = Math.round(height * dpr);
      dustCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      bodies.forEach((body, i) => {
        body.r = bodyRadius;

        if (firstLayout) {
          const target = home(i);
          /* Kənardan, öz yerinin istiqamətində uçub gəlir */
          const angle = Math.atan2(target.y - cy, target.x - cx);
          const far = Math.max(width, height) * 0.75;
          body.fromX = cx + Math.cos(angle + 0.6) * far;
          body.fromY = cy + Math.sin(angle + 0.6) * far;
          body.x = reduceMotion ? target.x : body.fromX;
          body.y = reduceMotion ? target.y : body.fromY;
        }
      });
    };

    /* ---------- Fizika ---------- */

    const simulate = (now: number) => {
      const paused =
        hoveredRef.current !== null ||
        selectedRef.current !== null ||
        dragging !== null;

      if (!reduceMotion && !paused) {
        rotation += 0.0016;
      }

      for (let i = 0; i < count; i += 1) {
        const body = bodies[i];

        if (now - start < body.arriveAt) {
          continue;
        }

        if (dragging === i) {
          const nx = body.x + (pointer.x - body.x) * 0.45;
          const ny = body.y + (pointer.y - body.y) * 0.45;
          body.vx = nx - body.x;
          body.vy = ny - body.y;
          body.x = nx;
          body.y = ny;
          continue;
        }

        const target = home(i);
        const bob = reduceMotion ? 0 : Math.sin(now * 0.0012 + i) * 0.04;

        /* Yay: öz yerinə doğru çəkilir */
        body.vx += (target.x - body.x) * 0.014;
        body.vy += (target.y - body.y) * 0.014 + bob;

        /* Siçan yaxınlaşanda yana çəkilir */
        if (pointer.inside && dragging === null && hoveredRef.current !== i) {
          const dx = body.x - pointer.x;
          const dy = body.y - pointer.y;
          const distance = Math.hypot(dx, dy) || 1;
          const reach = 130;

          if (distance < reach) {
            const force = ((reach - distance) / reach) * 0.9;
            body.vx += (dx / distance) * force;
            body.vy += (dy / distance) * force;
          }
        }

        body.vx *= 0.9;
        body.vy *= 0.9;
        body.x += body.vx;
        body.y += body.vy;
      }

      /* Toqquşmalar: medalyonlar bir-birinə və mərkəzə dəyir */
      for (let i = 0; i < count; i += 1) {
        const a = bodies[i];

        for (let j = i + 1; j < count; j += 1) {
          const b = bodies[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distance = Math.hypot(dx, dy) || 0.001;
          const min = a.r + b.r + 6;

          if (distance < min) {
            const nx = dx / distance;
            const ny = dy / distance;
            const overlap = (min - distance) / 2;
            const aFixed = dragging === i;
            const bFixed = dragging === j;

            if (!aFixed) {
              a.x -= nx * overlap * (bFixed ? 2 : 1);
              a.y -= ny * overlap * (bFixed ? 2 : 1);
            }

            if (!bFixed) {
              b.x += nx * overlap * (aFixed ? 2 : 1);
              b.y += ny * overlap * (aFixed ? 2 : 1);
            }

            /* Sıçrama */
            const relative = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;

            if (relative < 0) {
              const impulse = -relative * 0.8;

              if (!aFixed) {
                a.vx -= nx * impulse;
                a.vy -= ny * impulse;
              }

              if (!bFixed) {
                b.vx += nx * impulse;
                b.vy += ny * impulse;
              }
            }
          }
        }

        /* Mərkəzdəki AzLink yerindən tərpənmir */
        const dx = a.x - cx;
        const dy = a.y - cy;
        const distance = Math.hypot(dx, dy) || 0.001;
        const min = a.r + coreRadius + 10;

        if (distance < min && dragging !== i) {
          const nx = dx / distance;
          const ny = dy / distance;
          a.x = cx + nx * min;
          a.y = cy + ny * min;
          const into = a.vx * nx + a.vy * ny;

          if (into < 0) {
            a.vx -= nx * into * 1.6;
            a.vy -= ny * into * 1.6;
          }
        }

        /* Kənarlardan sıçrayır */
        if (now - start > a.arriveAt + 900) {
          if (a.x < a.r) {
            a.x = a.r;
            a.vx = Math.abs(a.vx) * 0.6;
          } else if (a.x > width - a.r) {
            a.x = width - a.r;
            a.vx = -Math.abs(a.vx) * 0.6;
          }

          if (a.y < a.r) {
            a.y = a.r;
            a.vy = Math.abs(a.vy) * 0.6;
          } else if (a.y > height - a.r) {
            a.y = height - a.r;
            a.vy = -Math.abs(a.vy) * 0.6;
          }
        }
      }
    };

    /* ---------- Çəkiliş ---------- */

    const draw = (now: number) => {
      const elapsed = now - start;

      /* Qızıl tozu: yavaşca yuxarı süzülür və parıldayır */
      dustCtx.clearRect(0, 0, width, height);

      if (!reduceMotion) {
        for (const mote of motes) {
          mote.y -= mote.speed * STEP;

          if (mote.y < -0.05) {
            mote.y = 1.05;
            mote.x = Math.random();
          }

          const twinkle = 0.35 + Math.sin(now * 0.002 + mote.phase) * 0.3;
          dustCtx.fillStyle = `rgba(236, 210, 150, ${twinkle * 0.55})`;
          dustCtx.beginPath();
          dustCtx.arc(
            mote.x * width + Math.sin(now * 0.0004 + mote.phase) * 12,
            mote.y * height,
            mote.r,
            0,
            TAU
          );
          dustCtx.fill();
        }
      }

      const core = coreRef.current;

      if (core) {
        core.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      }

      for (let i = 0; i < count; i += 1) {
        const body = bodies[i];
        const node = nodeRefs.current[i];
        const thread = threadRefs.current[i];
        const spark = sparkRefs.current[i];

        if (!node || !thread || !spark) {
          continue;
        }

        const arrived = clamp((elapsed - body.arriveAt) / 500, 0, 1);
        const isActive =
          hoveredRef.current === i ||
          selectedRef.current === i ||
          dragging === i;
        const depth = clamp((body.y - (cy - radiusY)) / (radiusY * 2), 0, 1);
        const scale = (0.88 + depth * 0.16) * (isActive ? 1.12 : 1);

        node.style.transform = `translate(${body.x}px, ${body.y}px) translate(-50%, -50%) scale(${scale})`;
        node.style.opacity = String(arrived);
        node.style.zIndex = String(isActive ? 6 : depth > 0.5 ? 4 : 2);

        /*
         * Sap: mərkəzin kənarından medalyonun kənarına əyri xətt.
         * Medalyon sürətlə hərəkət edəndə sap arxada qalıb əyilir.
         */
        const dx = body.x - cx;
        const dy = body.y - cy;
        const distance = Math.hypot(dx, dy) || 1;
        const ux = dx / distance;
        const uy = dy / distance;
        const sx = cx + ux * coreRadius;
        const sy = cy + uy * coreRadius;
        const ex = body.x - ux * body.r * scale;
        const ey = body.y - uy * body.r * scale;
        const mx = (sx + ex) / 2 - body.vx * 6;
        const my = (sy + ey) / 2 - body.vy * 6 + 10;

        thread.setAttribute("d", `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`);

        const restLength = Math.hypot(radiusX, radiusY) * 0.8;
        const stretch = clamp(distance / restLength - 1, 0, 1.5);
        thread.style.opacity = String(
          arrived * (isActive ? 1 : 0.5 + stretch * 0.4)
        );
        thread.style.strokeWidth = String(
          isActive ? 1.6 : clamp(1.3 - stretch * 0.5, 0.6, 1.3)
        );

        /* Sap boyunca mərkəzdən medalyona axan işıq */
        const period = 2800;
        const t = ((now + i * (period / count)) % period) / period;
        const inv = 1 - t;
        const px = inv * inv * sx + 2 * inv * t * mx + t * t * ex;
        const py = inv * inv * sy + 2 * inv * t * my + t * t * ey;

        spark.setAttribute("cx", String(px));
        spark.setAttribute("cy", String(py));
        spark.style.opacity = reduceMotion
          ? "0"
          : String(Math.sin(t * Math.PI) * arrived * (isActive ? 1 : 0.7));
      }
    };

    /* ---------- Döngü ---------- */

    const loop = (now: number) => {
      frame = 0;

      if (!visible) {
        return;
      }

      accumulator += Math.min(now - last, 100);
      last = now;

      while (accumulator >= STEP) {
        simulate(now);
        accumulator -= STEP;
      }

      draw(now);
      frame = requestAnimationFrame(loop);
    };

    const run = () => {
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(loop);
      }
    };

    /* ---------- Siçan / toxunma ---------- */

    const local = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const handleMove = (event: PointerEvent) => {
      const { x, y } = local(event);
      pointer.vx = x - pointer.x;
      pointer.vy = y - pointer.y;
      pointer.x = x;
      pointer.y = y;
      pointer.inside = x > -60 && y > -60 && x < width + 60 && y < height + 60;
    };

    const handleDown = (event: PointerEvent) => {
      const target = (event.target as Element).closest(
        "[data-boutique-index]"
      ) as HTMLElement | null;

      if (!target || !wrap.contains(target)) {
        return;
      }

      const index = Number(target.dataset.boutiqueIndex);
      const { x, y } = local(event);

      pointer.x = x;
      pointer.y = y;
      dragging = index;
      downAt = { x, y, time: performance.now() };
      target.setPointerCapture(event.pointerId);
      event.preventDefault();
    };

    const handleUp = (event: PointerEvent) => {
      if (dragging === null) {
        return;
      }

      const index = dragging;
      const body = bodies[index];
      const { x, y } = local(event);
      const moved = Math.hypot(x - downAt.x, y - downAt.y);
      const quick = performance.now() - downAt.time < 400;

      dragging = null;

      if (moved < 6 && quick) {
        /* Sadəcə klik: kartı aç/bağla */
        clickRef.current(index);
      } else {
        /* Atış: siçanın son sürəti medalyona keçir */
        body.vx = clamp(pointer.vx * 0.9, -40, 40);
        body.vy = clamp(pointer.vy * 0.9, -40, 40);
      }
    };

    measure();
    run();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(wrap);

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;

      if (visible) {
        run();
      }
    });
    intersection.observe(wrap);

    window.addEventListener("pointermove", handleMove, { passive: true });
    wrap.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", handleMove);
      wrap.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, []);

  /* Escape kartı bağlayır */
  useEffect(() => {
    if (selected === null) {
      return;
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selected]);

  const selectedCategory = selected !== null ? categories[selected] : null;
  const SelectedIcon = selectedCategory?.icon;
  const selectedStats = selectedCategory
    ? stats?.[selectedCategory.name]
    : undefined;

  return (
    <div ref={wrapRef} className={`boutique ${className}`}>
      <canvas ref={dustRef} className="boutique__dust" aria-hidden="true" />

      <svg ref={svgRef} className="boutique__threads" aria-hidden="true">
        <defs>
          <linearGradient id="boutique-gold" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#f3dfae" />
            <stop offset="50%" stopColor="#c9a55c" />
            <stop offset="100%" stopColor="#f0d79b" />
          </linearGradient>
          <radialGradient id="boutique-spark">
            <stop offset="0%" stopColor="#fff7e0" />
            <stop offset="100%" stopColor="#e8c983" stopOpacity="0" />
          </radialGradient>
        </defs>

        {categories.map((category, i) => (
          <path
            key={category.id}
            ref={(element) => {
              threadRefs.current[i] = element;
            }}
            className="boutique__thread"
          />
        ))}

        {categories.map((category, i) => (
          <circle
            key={category.id}
            ref={(element) => {
              sparkRefs.current[i] = element;
            }}
            r="5"
            fill="url(#boutique-spark)"
          />
        ))}
      </svg>

      <div ref={coreRef} className="boutique__core" aria-hidden="true">
        <span className="boutique__core-ring" />
        <strong>AzLink</strong>
      </div>

      {categories.map((category, i) => {
        const Icon = category.icon;
        const info = stats?.[category.name];

        return (
          <button
            key={category.id}
            ref={(element) => {
              nodeRefs.current[i] = element;
            }}
            type="button"
            data-boutique-index={i}
            className={`boutique__medal ${
              hovered === i || selected === i ? "is-active" : ""
            }`}
            onPointerEnter={() => setHovered(i)}
            onPointerLeave={() => setHovered(null)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelected((current) => (current === i ? null : i));
              }
            }}
            aria-label={`${t(category.name)}${
              info?.businessCount ? `, ${t("{count} biznes", { count: info.businessCount })}` : ""
            }`}
          >
            <span className="boutique__face">
              <Icon size={24} strokeWidth={1.6} />
            </span>

            <span className="boutique__name">{t(category.name)}</span>

            <span className="boutique__hint">
              {info?.businessCount ? (
                <>
                  <b>{t("{count} biznes", { count: info.businessCount })}</b>
                  {info.priceFrom !== null && (
                    <span>{t("{price} ₼-dən", { price: info.priceFrom })}</span>
                  )}
                </>
              ) : (
                <span>{t("Tutub atın və ya klikləyin")}</span>
              )}
            </span>
          </button>
        );
      })}

      {/* Seçilmiş sahənin kartı */}
      {selectedCategory && (
        <div
          className="boutique__card"
          role="dialog"
          aria-label={t(selectedCategory.name)}
          key={selectedCategory.id}
        >
          <button
            type="button"
            className="boutique__close"
            onClick={() => setSelected(null)}
            aria-label={t("Bağla")}
          >
            ×
          </button>

          <div className="boutique__card-head">
            <span className="boutique__card-icon">
              {SelectedIcon && <SelectedIcon size={22} strokeWidth={1.6} />}
            </span>

            <div>
              <h3>{t(selectedCategory.name)}</h3>
              <p>
                {selectedStats?.businessCount
                  ? t("{count} biznes", { count: selectedStats.businessCount })
                  : selectedCategory.services.map((name) => t(name)).join(", ")}
              </p>
            </div>
          </div>

          {selectedStats && selectedStats.topServices.length > 0 ? (
            <ul className="boutique__menu">
              {selectedStats.topServices.map((service) => (
                <li key={service.name}>
                  <span>{service.name}</span>
                  <i />
                  <b>{service.price} ₼</b>
                </li>
              ))}
            </ul>
          ) : (
            <p className="boutique__empty">
              {selectedCategory.services.map((name) => t(name)).join(", ")}
            </p>
          )}

          <button
            type="button"
            className="boutique__cta"
            onClick={() => onSelect?.(selectedCategory.id)}
          >
            {t("Ustaları gör")}
          </button>
        </div>
      )}
    </div>
  );
}

export default ServiceBoutique;

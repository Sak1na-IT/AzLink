import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { categories } from "../../data/categories";
import "./PearlNecklace.css";

interface PearlNecklaceProps {
  /* Mirvari kliklənəndə kateqoriya id-si ilə çağırılır */
  onSelect?: (categoryId: string) => void;
  /* Sapın bərkidildiyi hündürlük (konteynerin hündürlüyünə nisbətən) */
  top?: number;
  /* Sapın ən aşağı nöqtəsinin dərinliyi (konteynerin hündürlüyünə nisbətən) */
  sag?: number;
  /*
   * Boyunbağının asıldığı sahə. Verilsə, top/sag bu elementin
   * ölçüsünə görə hesablanır, kanvas isə bütün konteyneri tutur:
   * mirvarini dartıb bu sahədən kənara çıxarmaq olar.
   */
  zoneRef?: RefObject<HTMLElement | null>;
  className?: string;
}

/*
 * "Bakının xidmətləri bir sapda" — AzLink-in simvolu.
 *
 * Qızılı sapa düzülmüş mirvari boyunbağı; hər mirvari bir xidmət
 * sahəsidir (data/categories.ts). Sap Verlet fizikası ilə hesablanır:
 *  - açılışda boyunbağı düşür, yellənib yerinə oturur;
 *  - siçan yaxınlaşanda mirvarilər kənara itələnir;
 *  - mirvarini tutub dartmaq olar, buraxanda yellənir;
 *  - mirvari kliklənəndə onSelect(kateqoriya) çağırılır.
 *
 * Çəkiliş <canvas>-dadır; ad etiketi isə aydın görünsün deyə HTML-dir.
 * Klaviatura və ekran oxuyucuları üçün eyni kateqoriyalar gizli
 * düymələr kimi də var.
 */

type Point = {
  x: number;
  y: number;
  px: number;
  py: number;
  invMass: number;
  pinned: boolean;
};

type Pearl = {
  point: number;
  radius: number;
  /* açılışda görünmə gecikməsi, ms */
  appearAt: number;
  phase: number;
};

const SEGMENTS = 56;
const GRAVITY = 0.32;
const DAMPING = 0.985;
const ITERATIONS = 32;
const STEP_MS = 1000 / 60;

const easeOutBack = (t: number) => {
  const c1 = 1.5;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/* ---------- Bir mirvarinin çəkilişi ---------- */

const drawPearl = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  lightX: number,
  lightY: number,
  phase: number,
  glow: number
) => {
  /* Məxmər üzərinə düşən kölgə */
  const shadow = ctx.createRadialGradient(
    x + r * 0.12,
    y + r * 1.05,
    0,
    x + r * 0.12,
    y + r * 1.05,
    r * 1.1
  );
  shadow.addColorStop(0, "rgba(0, 0, 0, 0.42)");
  shadow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.ellipse(x + r * 0.12, y + r * 1.05, r * 1.1, r * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  /* Üzərinə gələndə yumşaq parıltı */
  if (glow > 0.01) {
    const halo = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 2.4);
    halo.addColorStop(0, `rgba(255, 244, 222, ${0.32 * glow})`);
    halo.addColorStop(1, "rgba(255, 244, 222, 0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  const hx = x + lightX * r * 0.4;
  const hy = y + lightY * r * 0.4;

  /* Əsas kürə */
  const body = ctx.createRadialGradient(hx, hy, r * 0.05, x, y, r);
  body.addColorStop(0, "#ffffff");
  body.addColorStop(0.25, "#f7f2f1");
  body.addColorStop(0.55, "#e4dbde");
  body.addColorStop(0.82, "#bfb3bd");
  body.addColorStop(1, "#877c8f");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();

  /* Sədəf çalarları */
  if (typeof ctx.createConicGradient === "function") {
    const nacre = ctx.createConicGradient(phase, x, y);
    nacre.addColorStop(0, "rgba(255, 186, 204, 0.75)");
    nacre.addColorStop(0.2, "rgba(182, 224, 255, 0.75)");
    nacre.addColorStop(0.4, "rgba(214, 194, 255, 0.75)");
    nacre.addColorStop(0.6, "rgba(186, 246, 220, 0.75)");
    nacre.addColorStop(0.8, "rgba(255, 226, 190, 0.75)");
    nacre.addColorStop(1, "rgba(255, 186, 204, 0.75)");
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = nacre;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.globalCompositeOperation = "source-over";
  }

  /* İşığa yaxın tərəf ağarır */
  const bloom = ctx.createRadialGradient(hx, hy, 0, hx, hy, r * 0.75);
  bloom.addColorStop(0, "rgba(255, 255, 255, 0.6)");
  bloom.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = bloom;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);

  /* Kənar kölgəsi */
  const rim = ctx.createRadialGradient(x, y, r * 0.62, x, y, r);
  rim.addColorStop(0, "rgba(50, 32, 64, 0)");
  rim.addColorStop(1, "rgba(50, 32, 64, 0.38)");
  ctx.fillStyle = rim;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);

  /* Qarşı tərəfdən qızılı əks olunma (sapdan və məxmərdən) */
  const bx = x - lightX * r * 0.78;
  const by = y - lightY * r * 0.78;
  const bounce = ctx.createRadialGradient(bx, by, 0, bx, by, r * 0.6);
  bounce.addColorStop(0, "rgba(232, 204, 146, 0.38)");
  bounce.addColorStop(1, "rgba(232, 204, 146, 0)");
  ctx.fillStyle = bounce;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);

  ctx.restore();

  /* Parlaq nöqtə */
  const sx = x + lightX * r * 0.46;
  const sy = y + lightY * r * 0.46;
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(Math.atan2(lightY, lightX) + Math.PI / 2);
  const spec = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.24);
  spec.addColorStop(0, "rgba(255, 255, 255, 0.98)");
  spec.addColorStop(0.45, "rgba(255, 255, 255, 0.7)");
  spec.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = spec;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.24, r * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

function PearlNecklace({
  onSelect,
  top = 0.04,
  sag: sagRatio = 0.66,
  zoneRef,
  className = "",
}: PearlNecklaceProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);

  const [hovered, setHovered] = useState<number | null>(null);

  onSelectRef.current = onSelect;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!wrap || !canvas || !ctx) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let points: Point[] = [];
    let pearls: Pearl[] = [];
    let restLength = 0;

    let startTime = performance.now();
    let lastTime = startTime;
    let accumulator = 0;
    let frame = 0;
    let visible = true;

    /* Siçan */
    const mouse = { x: -9999, y: -9999, active: false };
    let light = { x: -0.45, y: -0.6 };
    let dragging: number | null = null;
    let downAt = { x: 0, y: 0, time: 0 };
    let hoverIndex: number | null = null;
    const glow = categories.map(() => 0);

    /* ---------- Quruluş ---------- */

    const setup = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const narrow = width < 640;

      /* Sapın ucları kənardan çıxır: boyunbağı çərçivəyə sığmır, davam edir */
      const leftX = narrow ? -width * 0.08 : -width * 0.03;
      const rightX = width - leftX;
      /* Asılma sahəsi: verilibsə zoneRef, yoxsa bütün konteyner */
      const zone = zoneRef?.current?.getBoundingClientRect();
      const zoneTop = zone ? zone.top - rect.top : 0;
      const zoneHeight = zone ? zone.height : height;

      const anchorY = zoneTop + zoneHeight * top;

      const span = rightX - leftX;
      const sag = zoneHeight * sagRatio;

      /* İstənilən formanın (parabola) uzunluğunu ədədi hesablayırıq */
      const shapeY = (t: number) => sag * (1 - Math.pow(2 * t - 1, 2));
      let ropeLength = 0;

      for (let i = 1; i <= 400; i += 1) {
        const t0 = (i - 1) / 400;
        const t1 = i / 400;
        ropeLength += Math.hypot(span * (t1 - t0), shapeY(t1) - shapeY(t0));
      }

      /* Ağırlıqdan azca uzanır: bunu əvvəlcədən nəzərə alırıq */
      restLength = (ropeLength / SEGMENTS) * 0.985;

      points = [];

      for (let i = 0; i <= SEGMENTS; i += 1) {
        const t = i / SEGMENTS;
        const x = leftX + span * t;
        const y = anchorY + shapeY(t);
        /*
         * Açılışda boyunbağı bir dəfə yüngülcə yellənir: əvvəlki mövqeyi
         * azca sola qoyuruq, Verlet bunu sağa doğru sürət kimi qəbul edir.
         */
        const swing = reduceMotion ? 0 : Math.sin(Math.PI * t) * width * 0.012;

        points.push({
          x,
          y,
          px: x - swing,
          py: y + swing * 0.4,
          invMass: 1,
          pinned: i === 0 || i === SEGMENTS,
        });
      }

      const baseRadius = clamp(width * 0.024, 13, 30);
      const count = categories.length;
      const middle = (count - 1) / 2;

      pearls = categories.map((_, k) => {
        const t = 0.2 + (k / (count - 1)) * 0.6;
        const point = Math.round(SEGMENTS * t);
        /* Klassik boyunbağı: ortadakı mirvari ən böyükdür */
        const fromCenter = Math.abs(k - middle) / middle;
        const radius = baseRadius * (1.12 - fromCenter * 0.3);

        points[point].invMass = 0.3;

        return {
          point,
          radius,
          appearAt: reduceMotion ? 0 : 450 + Math.abs(k - middle) * 140,
          phase: k * 0.9,
        };
      });

      /* Azaldılmış hərəkət: əvvəlcədən sakit vəziyyətə gətiririk */
      if (reduceMotion) {
        for (let i = 0; i < 400; i += 1) {
          simulate(0);
        }
      }

      startTime = performance.now();
    };

    /* ---------- Fizika ---------- */

    const simulate = (time: number) => {
      for (let i = 0; i < points.length; i += 1) {
        const p = points[i];

        if (p.pinned) {
          continue;
        }

        const vx = (p.x - p.px) * DAMPING;
        const vy = (p.y - p.py) * DAMPING;

        p.px = p.x;
        p.py = p.y;

        /* Çox zəif meh: boyunbağı "canlı" qalır */
        const breeze = reduceMotion
          ? 0
          : Math.sin(time * 0.0006 + i * 0.18) * 0.012;

        p.x += vx + breeze;
        p.y += vy + GRAVITY;

        /* Siçan mirvariləri yumşaqca itələyir */
        if (mouse.active && dragging === null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distance = Math.hypot(dx, dy);
          const reach = 90;

          if (distance > 0 && distance < reach) {
            const force = ((reach - distance) / reach) * 1.1;
            p.x += (dx / distance) * force;
            p.y += (dy / distance) * force;
          }
        }
      }

      if (dragging !== null) {
        const p = points[pearls[dragging].point];
        p.x += (mouse.x - p.x) * 0.4;
        p.y += (mouse.y - p.y) * 0.4;
      }

      for (let iteration = 0; iteration < ITERATIONS; iteration += 1) {
        for (let i = 0; i < SEGMENTS; i += 1) {
          const a = points[i];
          const b = points[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distance = Math.hypot(dx, dy) || 0.0001;
          const diff = (distance - restLength) / distance;
          const wa = a.pinned ? 0 : a.invMass;
          const wb = b.pinned ? 0 : b.invMass;
          const total = wa + wb;

          if (total === 0) {
            continue;
          }

          a.x += dx * diff * (wa / total);
          a.y += dy * diff * (wa / total);
          b.x -= dx * diff * (wb / total);
          b.y -= dy * diff * (wb / total);
        }

        /* Mirvarilər bir-birinin içinə girmir */
        for (let i = 0; i < pearls.length; i += 1) {
          for (let j = i + 1; j < pearls.length; j += 1) {
            const a = points[pearls[i].point];
            const b = points[pearls[j].point];
            const min = pearls[i].radius + pearls[j].radius + 2;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const distance = Math.hypot(dx, dy) || 0.0001;

            if (distance < min) {
              const push = (min - distance) / distance / 2;
              a.x -= dx * push;
              a.y -= dy * push;
              b.x += dx * push;
              b.y += dy * push;
            }
          }
        }
      }
    };

    /* ---------- Çəkiliş ---------- */

    const draw = (now: number) => {
      const elapsed = now - startTime;

      ctx.clearRect(0, 0, width, height);

      /* Qızılı sap */
      const threadAlpha = reduceMotion ? 1 : clamp(elapsed / 500, 0, 1);
      const gold = ctx.createLinearGradient(0, 0, width, 0);
      gold.addColorStop(0, `rgba(122, 92, 40, ${threadAlpha})`);
      gold.addColorStop(0.5, `rgba(236, 212, 152, ${threadAlpha})`);
      gold.addColorStop(1, `rgba(122, 92, 40, ${threadAlpha})`);

      ctx.strokeStyle = gold;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length - 1; i += 1) {
        const midX = (points[i].x + points[i + 1].x) / 2;
        const midY = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
      }

      const last = points[points.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();

      /* İşıq mənbəyi siçanın arxasınca hərəkət edir */
      const targetLight = mouse.active
        ? (() => {
            const cx = width / 2;
            const cy = height * 0.45;
            const dx = (mouse.x - cx) / (width * 0.6);
            const dy = (mouse.y - cy) / (height * 0.8) - 0.4;
            const length = Math.hypot(dx, dy) || 1;
            const scale = Math.min(0.85, length) / length;
            return { x: dx * scale, y: dy * scale };
          })()
        : { x: -0.45, y: -0.6 };

      light = {
        x: light.x + (targetLight.x - light.x) * 0.06,
        y: light.y + (targetLight.y - light.y) * 0.06,
      };

      pearls.forEach((pearl, k) => {
        const progress = clamp((elapsed - pearl.appearAt) / 650, 0, 1);

        if (progress <= 0) {
          return;
        }

        const scale = reduceMotion ? 1 : easeOutBack(progress);
        const target = hoverIndex === k || dragging === k ? 1 : 0;
        glow[k] += (target - glow[k]) * 0.15;

        const p = points[pearl.point];
        const radius = pearl.radius * scale * (1 + glow[k] * 0.08);
        const phase = pearl.phase + (reduceMotion ? 0 : now * 0.00015);

        ctx.globalAlpha = clamp(progress * 1.6, 0, 1);
        drawPearl(ctx, p.x, p.y, radius, light.x, light.y, phase, glow[k]);
        ctx.globalAlpha = 1;
      });

      /* Ad etiketi mirvarinin altında */
      const label = labelRef.current;
      const shown = dragging ?? hoverIndex;

      if (label && shown !== null) {
        const p = points[pearls[shown].point];
        const top = p.y + pearls[shown].radius + 16;
        const left = clamp(p.x, 90, width - 90);
        label.style.transform = `translate(${left}px, ${top}px) translateX(-50%)`;
      }
    };

    /* ---------- Döngü ---------- */

    const loop = (now: number) => {
      frame = 0;

      if (!visible) {
        return;
      }

      accumulator += Math.min(now - lastTime, 100);
      lastTime = now;

      while (accumulator >= STEP_MS) {
        simulate(now);
        accumulator -= STEP_MS;
      }

      draw(now);
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (!frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(loop);
      }
    };

    /* ---------- Siçan / toxunma ---------- */

    const toLocal = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const pearlAt = (x: number, y: number): number | null => {
      let found = -1;
      let best = Infinity;

      for (let k = 0; k < pearls.length; k += 1) {
        const p = points[pearls[k].point];
        const distance = Math.hypot(p.x - x, p.y - y);

        if (distance < pearls[k].radius * 1.5 && distance < best) {
          best = distance;
          found = k;
        }
      }

      return found === -1 ? null : found;
    };

    const updateHover = (index: number | null) => {
      if (index !== hoverIndex) {
        hoverIndex = index;
        setHovered(index);
        document.documentElement.style.cursor = index === null ? "" : "grab";
      }
    };

    const handleMove = (event: PointerEvent) => {
      const { x, y } = toLocal(event);
      mouse.x = x;
      mouse.y = y;
      mouse.active = x >= -40 && x <= width + 40 && y >= -40 && y <= height + 40;

      if (dragging === null) {
        updateHover(mouse.active ? pearlAt(x, y) : null);
      }
    };

    /*
     * Kanvas kliklərə mane olmur (pointer-events: none), ona görə
     * basmanı pəncərədə tuturuq: mirvarinin üstündədirsə, onu götürürük
     * və altdakı düymənin klikini ləğv edirik.
     */
    let suppressClick = false;

    const handleDown = (event: PointerEvent) => {
      const { x, y } = toLocal(event);
      const index = pearlAt(x, y);

      if (index === null) {
        return;
      }

      event.preventDefault();
      suppressClick = true;
      mouse.x = x;
      mouse.y = y;
      mouse.active = true;
      dragging = index;
      downAt = { x, y, time: performance.now() };
      document.documentElement.style.cursor = "grabbing";
      updateHover(index);
    };

    const handleUp = (event: PointerEvent) => {
      if (dragging === null) {
        return;
      }

      const { x, y } = toLocal(event);
      const moved = Math.hypot(x - downAt.x, y - downAt.y);
      const quick = performance.now() - downAt.time < 450;
      const index = dragging;

      dragging = null;
      document.documentElement.style.cursor = hoverIndex === null ? "" : "grab";

      /* Dartmadan sadəcə klikləyibsə: kateqoriyanı aç */
      if (moved < 8 && quick) {
        onSelectRef.current?.(categories[index].id);
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (suppressClick) {
        suppressClick = false;
        event.preventDefault();
        event.stopPropagation();
      }
    };

    /* Telefonda mirvarini dartanda səhifə sürüşməsin */
    const handleTouchMove = (event: TouchEvent) => {
      if (dragging !== null) {
        event.preventDefault();
      }
    };

    const handleLeave = () => {
      mouse.active = false;

      if (dragging === null) {
        updateHover(null);
      }
    };

    setup();
    start();

    const resizeObserver = new ResizeObserver(() => {
      setup();
    });
    resizeObserver.observe(wrap);

    if (zoneRef?.current) {
      resizeObserver.observe(zoneRef.current);
    }

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;

      if (visible) {
        start();
      }
    });
    intersection.observe(wrap);

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerdown", handleDown, { capture: true });
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    window.addEventListener("click", handleClick, { capture: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("pointerleave", handleLeave);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerdown", handleDown, { capture: true });
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
      window.removeEventListener("click", handleClick, { capture: true });
      window.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("pointerleave", handleLeave);
      document.documentElement.style.cursor = "";
    };
  }, [top, sagRatio, zoneRef]);

  const hoveredCategory = hovered !== null ? categories[hovered] : null;

  return (
    <div ref={wrapRef} className={`necklace ${className}`}>
      <canvas ref={canvasRef} className="necklace__canvas" aria-hidden="true" />

      <div
        ref={labelRef}
        className={`necklace__label ${hoveredCategory ? "is-visible" : ""}`}
        aria-hidden="true"
      >
        {hoveredCategory && (
          <>
            <strong>{hoveredCategory.name}</strong>
            <span>{hoveredCategory.services.join(", ")}</span>
          </>
        )}
      </div>

      {/* Klaviatura və ekran oxuyucuları üçün */}
      {onSelect && (
        <nav className="necklace__a11y" aria-label="Xidmət sahələri">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
            >
              {category.name}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

export default PearlNecklace;

import { CITIES, MAINLAND, NAKHCHIVAN, type LonLat } from "./azerbaijan";
import { Skyline } from "./skyline";

/*
 * AzLink şəbəkəsi: ana səhifənin arxa fonu.
 *
 * Bir 3D səhnə, üç mərhələ (sürüşdürməyə bağlı, s = 0…2):
 *   s = 0  Ayrı-ayrı şüşə kürələr, bir neçə incə əlaqə.
 *   s = 1  Eyni kürələr şəhərlərə çevrilir, düyünlər yayılıb
 *          Azərbaycanın konturunu çəkir.
 *   s = 2  Kontur sıx şəbəkəyə çevrilir, ortada AzLink mərkəzi,
 *          uzaqda Bakının gecə siluetı və Alov qüllələri.
 *
 * Hər düyünün və xəttin hər mərhələdə öz vəziyyəti var; aradakı
 * hallar hesablanır, ona görə geri sürüşdürəndə hər şey eyni yolla
 * geri qayıdır. Kəsik keçid və şəkil dəyişmə yoxdur.
 *
 * Kitabxanasız: 3D nöqtələr perspektiv kamera ilə ekrana
 * proyeksiya olunur və Canvas 2D ilə çəkilir.
 */

type Vec3 = [number, number, number];
type Triple = [number, number, number];

interface Node {
  kind: "hero" | "outline" | "interior" | "hub";
  /* 1-ci mərhələdə dünyadakı yeri */
  start: Vec3;
  /* Xəritə üzərində yeri (xəritənin öz koordinatları) */
  local: Vec3;
  radius: Triple;
  alpha: Triple;
  delay: number;
  phase: number;
}

interface Edge {
  a: number;
  b: number;
  weight: Triple;
  delay: number;
}

interface Pulse {
  edge: number;
  speed: number;
  offset: number;
}

interface Palette {
  dark: boolean;
  bgBase: string;
  bgCenter: string;
  bgEdge: string;
  glow: string; // "r, g, b"
  line: string;
  dust: string;
  glassBody: string;
  glassRim: string;
  glassShine: string;
}

const DARK: Palette = {
  dark: true,
  bgBase: "#03100c",
  bgCenter: "#0f4231",
  bgEdge: "#010705",
  glow: "80, 235, 170",
  line: "130, 250, 196",
  dust: "150, 255, 210",
  glassBody: "rgba(150, 255, 210, 0.07)",
  glassRim: "rgba(170, 255, 220, 0.7)",
  glassShine: "rgba(235, 255, 245, 0.75)",
};

const LIGHT: Palette = {
  dark: false,
  bgBase: "#eef3ee",
  bgCenter: "#ffffff",
  bgEdge: "#e2ebe4",
  glow: "26, 130, 95",
  line: "22, 104, 78",
  dust: "22, 104, 78",
  glassBody: "rgba(255, 255, 255, 0.4)",
  glassRim: "rgba(22, 104, 78, 0.5)",
  glassShine: "rgba(255, 255, 255, 0.95)",
};

const CAMERA = 3;
const MAP_SCALE = 0.58;

/* 1-ci mərhələdə şüşə kürələrin yeri və ölçüsü (əl ilə düzülüb:
   mətnin ortasını boş saxlayır) */
const HEROES: { pos: Vec3; r: number }[] = [
  { pos: [-0.35, 0.72, 0.6], r: 0.2 },
  { pos: [0.55, -0.62, 1.1], r: 0.15 },
  { pos: [1.35, 0.55, 0.9], r: 0.27 },
  { pos: [0.75, 0.05, 0.2], r: 0.12 },
  { pos: [-2.75, 1.25, 2.4], r: 0.16 },
  { pos: [2.15, -0.35, 2.0], r: 0.3 },
  { pos: [-0.2, -0.15, 2.6], r: 0.1 },
  { pos: [-2.45, -1.3, 2.2], r: 0.14 },
];

const HERO_LINKS: [number, number][] = [
  [0, 3],
  [2, 3],
  [1, 3],
  [2, 5],
  [1, 6],
];

/* ---------- köməkçilər ---------- */

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (v: number) => v * v * (3 - 2 * v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const seeded = (seed: number) => {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
};

const toLocal = ([lon, lat]: LonLat): [number, number] => [
  (lon - 47.6) * 0.766 * MAP_SCALE,
  (lat - 40.15) * MAP_SCALE,
];

/* Konturu bərabər addımlarla yenidən nöqtələyir */
const resample = (polygon: LonLat[], count: number) => {
  const points = polygon.map(toLocal);
  const lengths: number[] = [];
  let total = 0;

  points.forEach((p, i) => {
    const q = points[(i + 1) % points.length];
    const length = Math.hypot(q[0] - p[0], q[1] - p[1]);
    lengths.push(length);
    total += length;
  });

  const result: [number, number][] = [];
  const step = total / count;
  let segment = 0;
  let walked = 0;

  for (let i = 0; i < count; i += 1) {
    const target = i * step;
    while (walked + lengths[segment] < target) {
      walked += lengths[segment];
      segment += 1;
    }
    const p = points[segment];
    const q = points[(segment + 1) % points.length];
    const t = (target - walked) / lengths[segment];
    result.push([lerp(p[0], q[0], t), lerp(p[1], q[1], t)]);
  }

  return result;
};

const inside = (point: [number, number], polygon: [number, number][]) => {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > point[1] !== yj > point[1] && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi) {
      result = !result;
    }
  }
  return result;
};

/* Mərhələlər arası dəyər: hər element öz gecikməsi ilə */
const stageValue = (values: Triple, s: number, delay: number) => {
  const k = s >= 2 ? 1 : Math.floor(s);
  const f = s >= 2 ? 1 : s - k;
  const eased = smooth(clamp((f - delay) / (1 - 0.5)));
  return {
    value: lerp(values[k], values[k + 1], eased),
    growing: values[k + 1] > values[k],
    eased,
  };
};

/* =========================================================== */

export class NetworkScene {
  private ctx: CanvasRenderingContext2D;
  private nodes: Node[] = [];
  private edges: Edge[] = [];
  private pulses: Pulse[] = [];
  private dust: { pos: Vec3; size: number; alpha: number }[] = [];
  private palette: Palette = DARK;
  private sprite: HTMLCanvasElement;
  private backdrop: HTMLCanvasElement;
  private skyline = new Skyline();
  private bokeh: { x: number; y: number; r: number; alpha: number; speed: number; phase: number }[] = [];
  private width = 0;
  private height = 0;
  private ratio = 1;
  private focal = 1;
  private compact = false;
  private s = 0;
  private lastTime = 0;
  private positions: Vec3[] = [];

  constructor(
    private canvas: HTMLCanvasElement,
    private reduced: boolean
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D dəstəklənmir");
    this.ctx = ctx;
    this.sprite = document.createElement("canvas");
    this.backdrop = document.createElement("canvas");
  }

  setDark(dark: boolean) {
    this.palette = dark ? DARK : LIGHT;
    this.paintStatic();
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const compact = width < 760;
    this.ratio = Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.75);
    this.width = width;
    this.height = height;
    this.canvas.width = Math.round(width * this.ratio);
    this.canvas.height = Math.round(height * this.ratio);
    this.focal = Math.min(width * 1.3, height * 1.15);

    if (compact !== this.compact || this.nodes.length === 0) {
      this.compact = compact;
      this.build();
    }

    this.paintStatic();
  }

  /* ---------- Səhnəni qurmaq ---------- */

  private build() {
    const random = seeded(17);
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const mainlandLocal = MAINLAND.map(toLocal);
    const nakhLocal = NAKHCHIVAN.map(toLocal);
    const jitter = () => (random() - 0.5) * 0.05;

    /* 1. Şüşə kürələr → şəhərlər */
    HEROES.forEach((hero, index) => {
      const city = toLocal(CITIES[index]);
      /* Telefonda ekran dar olduğu üçün kürələri mərkəzə yaxınlaşdırırıq */
      const spread = this.compact ? 0.45 : 1;
      nodes.push({
        kind: "hero",
        start: [hero.pos[0] * spread, hero.pos[1] * (this.compact ? 1.5 : 1), hero.pos[2]],
        local: [city[0], city[1], 0],
        radius: [hero.r, 0.026, index === 0 ? 0.034 : 0.026],
        alpha: [1, 1, 1],
        delay: random() * 0.25,
        phase: random() * Math.PI * 2,
      });
    });

    const fromHero = (index: number): Vec3 => {
      const hero = nodes[index % HEROES.length].start;
      return [hero[0] + jitter() * 3, hero[1] + jitter() * 3, hero[2] + jitter() * 3];
    };

    /* 2. Kontur düyünləri: kürələrdən çıxıb sərhədə düzülür */
    const outlineStart = nodes.length;
    const mainland = resample(MAINLAND, this.compact ? 46 : 66);
    const nakh = resample(NAKHCHIVAN, this.compact ? 9 : 13);

    [mainland, nakh].forEach((ring) => {
      const first = nodes.length;
      ring.forEach((point, index) => {
        nodes.push({
          kind: "outline",
          start: fromHero(index),
          local: [point[0], point[1], jitter() * 0.6],
          radius: [0.006, 0.011, 0.012],
          alpha: [0, 1, 1],
          delay: 0.1 + (index / ring.length) * 0.4,
          phase: random() * Math.PI * 2,
        });
        const next = first + ((index + 1) % ring.length);
        edges.push({ a: nodes.length - 1, b: next, weight: [0, 0.95, 0.85], delay: 0.15 + (index / ring.length) * 0.35 });
      });
    });
    const outlineEnd = nodes.length;

    /* 3. Daxili düyünlər: əvvəl azı, sonra hamısı */
    const interiorStart = nodes.length;
    const interiorCount = this.compact ? 26 : 46;
    const placed: [number, number][] = [...CITIES.map(toLocal)];
    let tries = 0;
    while (nodes.length - interiorStart < interiorCount && tries < 4000) {
      tries += 1;
      const point: [number, number] = [lerp(-1.1, 1.15, random()), lerp(-0.85, 0.9, random())];
      const inMap = inside(point, mainlandLocal) || inside(point, nakhLocal);
      if (!inMap) continue;
      if (placed.some((p) => Math.hypot(p[0] - point[0], p[1] - point[1]) < 0.11)) continue;
      placed.push(point);
      const early = random() < 0.35;
      nodes.push({
        kind: "interior",
        start: fromHero(nodes.length),
        local: [point[0], point[1], jitter()],
        radius: [0.005, 0.009, 0.011],
        alpha: [0, early ? 0.75 : 0, 1],
        delay: random() * 0.5,
        phase: random() * Math.PI * 2,
      });
    }
    const interiorEnd = nodes.length;

    /* 4. AzLink mərkəzi */
    const hubIndex = nodes.length;
    nodes.push({
      kind: "hub",
      start: [0, 0, 1.5],
      local: [-0.05, 0.02, -0.28],
      radius: [0, 0, 0.055],
      alpha: [0, 0, 1],
      delay: 0.2,
      phase: 0,
    });

    const distance = (i: number, j: number) =>
      Math.hypot(nodes[i].local[0] - nodes[j].local[0], nodes[i].local[1] - nodes[j].local[1]);
    const seen = new Set<string>();
    const addEdge = (a: number, b: number, weight: Triple, delay: number) => {
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (a === b || seen.has(key)) return;
      seen.add(key);
      edges.push({ a, b, weight, delay });
    };
    edges.forEach((edge) => seen.add(`${Math.min(edge.a, edge.b)}-${Math.max(edge.a, edge.b)}`));

    /* Kürələr arasında bir neçə əlaqə (1-ci mərhələ) */
    HERO_LINKS.forEach(([a, b], index) => addEdge(a, b, [0.9, 0.3, 0.35], index * 0.08));

    /* Şəhər → ən yaxın kontur və daxili düyünlər */
    const nearest = (from: number, start: number, end: number, count: number) =>
      Array.from({ length: end - start }, (_, k) => start + k)
        .sort((i, j) => distance(from, i) - distance(from, j))
        .slice(0, count);

    for (let city = 0; city < HEROES.length; city += 1) {
      nearest(city, outlineStart, outlineEnd, 2).forEach((target) =>
        addEdge(city, target, [0, 0.75, 0.8], 0.3 + random() * 0.2)
      );
      nearest(city, interiorStart, interiorEnd, 2).forEach((target) =>
        addEdge(city, target, [0, 0.4, 0.85], 0.35 + random() * 0.15)
      );
    }

    /* Sıx şəbəkə: hər daxili düyün ən yaxın 3 qonşuya */
    const mapNodes = Array.from({ length: interiorEnd - HEROES.length }, (_, k) => HEROES.length + k).concat(
      Array.from({ length: HEROES.length }, (_, k) => k)
    );
    for (let i = interiorStart; i < interiorEnd; i += 1) {
      const early = nodes[i].alpha[1] > 0;
      mapNodes
        .filter((j) => j !== i)
        .sort((x, y) => distance(i, x) - distance(i, y))
        .slice(0, 3)
        .forEach((j, rank) => {
          const both = early && nodes[j].alpha[1] > 0 && rank === 0;
          addEdge(i, j, [0, both ? 0.5 : 0, 0.75], random() * 0.45);
        });
    }

    /* Mərkəzdən şəhərlərə və yaxın düyünlərə */
    for (let city = 0; city < HEROES.length; city += 1) addEdge(hubIndex, city, [0, 0, 0.8], 0.2 + random() * 0.25);
    nearest(hubIndex, interiorStart, interiorEnd, 5).forEach((target) =>
      addEdge(hubIndex, target, [0, 0, 0.55], 0.3 + random() * 0.2)
    );

    /* İşıq impulsları */
    const pulseEdges = edges.map((edge, index) => ({ edge, index })).filter(({ edge }) => edge.weight[2] > 0.5);
    this.pulses = Array.from({ length: this.compact ? 14 : 26 }, () => ({
      edge: pulseEdges[Math.floor(random() * pulseEdges.length)].index,
      speed: 0.18 + random() * 0.25,
      offset: random(),
    }));

    /* Havada toz */
    this.dust = Array.from({ length: this.compact ? 80 : 150 }, () => ({
      pos: [lerp(-3.2, 3.2, random()), lerp(-2, 2, random()), lerp(-0.5, 4.5, random())] as Vec3,
      size: 0.5 + random() * 1.1,
      alpha: 0.15 + random() * 0.4,
    }));

    /* Fokusdan kənar yumşaq işıq ləkələri: dərinlik və canlılıq */
    this.bokeh = Array.from({ length: this.compact ? 8 : 16 }, () => ({
      x: random(),
      y: random(),
      r: 18 + random() * 50,
      alpha: 0.05 + random() * 0.08,
      speed: 0.004 + random() * 0.01,
      phase: random() * Math.PI * 2,
    }));

    this.nodes = nodes;
    this.edges = edges;
    this.positions = nodes.map(() => [0, 0, 0]);
  }

  /* ---------- Dəyişməyən təbəqələr: fon, parıltı, siluet ---------- */

  private paintStatic() {
    if (!this.width) return;
    const p = this.palette;
    const w = this.canvas.width;
    const h = this.canvas.height;

    /* Düyün parıltısı */
    const size = 64;
    this.sprite.width = size;
    this.sprite.height = size;
    const sc = this.sprite.getContext("2d")!;
    const g = sc.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    if (p.dark) {
      g.addColorStop(0, "rgba(235, 255, 245, 1)");
      g.addColorStop(0.18, `rgba(${p.glow}, 0.75)`);
      g.addColorStop(0.45, `rgba(${p.glow}, 0.18)`);
      g.addColorStop(1, `rgba(${p.glow}, 0)`);
    } else {
      g.addColorStop(0, `rgba(${p.glow}, 0.95)`);
      g.addColorStop(0.2, `rgba(${p.glow}, 0.5)`);
      g.addColorStop(0.5, `rgba(${p.glow}, 0.1)`);
      g.addColorStop(1, `rgba(${p.glow}, 0)`);
    }
    sc.fillStyle = g;
    sc.fillRect(0, 0, size, size);

    /* Fon: dərin zümrüd (və ya açıq) duman */
    this.backdrop.width = w;
    this.backdrop.height = h;
    const bc = this.backdrop.getContext("2d")!;
    bc.fillStyle = p.bgBase;
    bc.fillRect(0, 0, w, h);
    const fog = bc.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.42, Math.max(w, h) * 0.75);
    fog.addColorStop(0, p.bgCenter);
    fog.addColorStop(0.55, p.bgBase);
    fog.addColorStop(1, p.bgEdge);
    bc.fillStyle = fog;
    bc.fillRect(0, 0, w, h);

    const skyWidth = this.compact ? w : w * 0.62;
    const skyHeight = this.height * (this.compact ? 0.32 : 0.5) * this.ratio;
    this.skyline.setup(skyWidth, skyHeight, this.ratio, p.dark);
  }

  /* ---------- Hər kadr ---------- */

  private mapTransform(s: number, time: number) {
    const t = smooth(clamp(s - 1));
    const sway = this.reduced ? 0 : Math.sin(time * 0.07) * 0.06;
    /* 2-ci mərhələdə xəritə böyükdür; 3-cüdə bir az kiçilib yuxarı
       qalxır ki, altda Bakı siluetı görünsün */
    const big = this.compact ? 1.0 : 1.38;
    return {
      rotX: lerp(0.5, 0.36, t),
      rotY: lerp(-0.18, -0.08, t) + sway,
      lift: lerp(0.02, this.compact ? 0.3 : 0.5, t),
      depth: lerp(1.0, 1.25, t),
      scale: lerp(big, big * 0.72, t),
    };
  }

  private toWorld(local: Vec3, m: ReturnType<NetworkScene["mapTransform"]>): Vec3 {
    const x = local[0] * m.scale;
    const y = local[1] * m.scale;
    const z = local[2];
    const cx = Math.cos(m.rotX);
    const sx = Math.sin(m.rotX);
    const y1 = y * cx - z * sx;
    const z1 = y * sx + z * cx;
    const cy = Math.cos(m.rotY);
    const sy = Math.sin(m.rotY);
    return [x * cy + z1 * sy, y1 + m.lift, -x * sy + z1 * cy + m.depth];
  }

  private project([x, y, z]: Vec3) {
    const depth = z + CAMERA;
    const scale = (this.focal / depth) * this.ratio;
    return {
      x: this.canvas.width * (this.compact ? 0.5 : 0.67) + x * scale,
      y: this.canvas.height * 0.5 - y * scale,
      scale,
      depth,
    };
  }

  render(target: number, now: number) {
    const ctx = this.ctx;
    const p = this.palette;
    const time = this.reduced ? 0 : now / 1000;
    const dt = this.lastTime ? Math.min(0.1, (now - this.lastTime) / 1000) : 0.016;
    this.lastTime = now;

    /* Sürüşdürmə dəyərinə yumşaq yaxınlaşma */
    this.s = this.reduced ? target : this.s + (target - this.s) * (1 - Math.exp(-dt * 4));
    const s = clamp(this.s, 0, 2);

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.drawImage(this.backdrop, 0, 0);

    /* Xəritə ətrafında yumşaq işıq: 2-ci və 3-cü mərhələdə güclənir */
    const mapGlow = smooth(clamp(s * 0.8));
    if (mapGlow > 0.01) {
      const gx = this.canvas.width * (this.compact ? 0.5 : 0.67);
      const gy = this.canvas.height * 0.45;
      const gr = Math.max(this.canvas.width, this.canvas.height) * 0.45;
      const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
      glow.addColorStop(0, `rgba(${p.glow}, ${(p.dark ? 0.24 : 0.1) * mapGlow})`);
      glow.addColorStop(1, `rgba(${p.glow}, 0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.drawDust(time, s);

    this.drawBokeh(time);

    /* Uzaqda Bakı siluetı: sağ-aşağıda, aşağıdan yavaşca qalxır */
    const sky = smooth(clamp((s - 1.15) / 0.85));
    if (sky > 0.01) {
      const drift = this.reduced ? 0 : Math.sin(time * 0.05) * 6 * this.ratio;
      const sx = this.compact ? 0 : this.canvas.width * 0.38;
      const sy = this.canvas.height - this.height * (this.compact ? 0.32 : 0.5) * this.ratio + (1 - sky) * 60 * this.ratio;
      this.skyline.draw(ctx, sx + drift, sy, sky, time);
    }

    /* Düyünlərin dünyadakı yeri */
    const m = this.mapTransform(s, time);
    const swayAll = this.reduced ? 0 : Math.sin(time * 0.05) * 0.05;
    const nodeState = this.nodes.map((node, index) => {
      const onMap = this.toWorld(node.local, m);
      let pos: Vec3;
      if (s < 1) {
        const f = smooth(clamp((s - node.delay) / (1 - 0.5)));
        const float = this.reduced ? 0 : (node.kind === "hero" ? 0.05 : 0.02) * (1 - f);
        const start: Vec3 = [
          node.start[0] + Math.sin(time * 0.35 + node.phase) * float,
          node.start[1] + Math.cos(time * 0.3 + node.phase) * float,
          node.start[2],
        ];
        pos = [lerp(start[0], onMap[0], f), lerp(start[1], onMap[1], f), lerp(start[2], onMap[2], f)];
      } else {
        pos = onMap;
      }
      /* Bütün səhnə yavaşca yellənir */
      const cz = pos[2] - 1;
      pos = [pos[0] * Math.cos(swayAll) + cz * Math.sin(swayAll), pos[1], -pos[0] * Math.sin(swayAll) + cz * Math.cos(swayAll) + 1];
      this.positions[index] = pos;
      const radius = stageValue(node.radius, s, node.delay).value;
      const alpha = stageValue(node.alpha, s, node.delay).value;
      return { node, pos, radius, alpha, screen: this.project(pos) };
    });

    /* Xətlər */
    ctx.globalCompositeOperation = p.dark ? "lighter" : "source-over";
    ctx.lineCap = "round";
    const edgeAlpha: number[] = [];
    this.edges.forEach((edge, index) => {
      const state = stageValue(edge.weight, s, edge.delay);
      const a = nodeState[edge.a];
      const b = nodeState[edge.b];
      /* Xətt yalnız hər iki ucu görünəndə tam parlayır */
      const fade = clamp(0.3 + Math.min(a.alpha, b.alpha));
      const alpha = state.value * fade;
      edgeAlpha[index] = alpha;
      if (alpha < 0.01) return;
      const grow = state.growing ? state.eased : 1;
      const ex = lerp(a.screen.x, b.screen.x, grow);
      const ey = lerp(a.screen.y, b.screen.y, grow);
      const depthFade = clamp(1.6 - (a.screen.depth + b.screen.depth) / 2 / 4.2, 0.35, 1);
      ctx.strokeStyle = `rgba(${p.line}, ${alpha * 0.14 * depthFade})`;
      ctx.lineWidth = 3.6 * this.ratio;
      ctx.beginPath();
      ctx.moveTo(a.screen.x, a.screen.y);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.strokeStyle = `rgba(${p.line}, ${alpha * 0.75 * depthFade})`;
      ctx.lineWidth = 1 * this.ratio;
      ctx.stroke();
    });

    /* İşıq impulsları: insanlar və bizneslər arasında hərəkət */
    const pulseStrength = this.reduced ? 0 : smooth(clamp((s - 0.7) / 0.6));
    if (pulseStrength > 0.01) {
      this.pulses.forEach((pulse) => {
        const edge = this.edges[pulse.edge];
        const alpha = edgeAlpha[pulse.edge] * pulseStrength;
        if (alpha < 0.3) return;
        const t = (time * pulse.speed + pulse.offset) % 1;
        const a = nodeState[edge.a].screen;
        const b = nodeState[edge.b].screen;
        const size = 14 * this.ratio;
        ctx.globalAlpha = alpha * Math.sin(t * Math.PI);
        ctx.drawImage(this.sprite, lerp(a.x, b.x, t) - size / 2, lerp(a.y, b.y, t) - size / 2, size, size);
      });
      ctx.globalAlpha = 1;
    }

    /* Düyünlər: uzaqdan yaxına */
    nodeState
      .filter((state) => state.alpha > 0.01 && state.radius > 0.0005)
      .sort((a, b) => b.screen.depth - a.screen.depth)
      .forEach((state) => {
        const px = state.radius * state.screen.scale;
        const depthFade = clamp(1.7 - state.screen.depth / 3.6, 0.3, 1);
        if (state.node.kind === "hub") {
          this.drawHub(state.screen.x, state.screen.y, px, state.alpha, time);
          return;
        }
        /* Böyük kürə şüşədir; kiçildikcə parlaq düyünə çevrilir */
        const glass = clamp((px - 7 * this.ratio) / (12 * this.ratio));
        if (glass > 0) this.drawGlass(state.screen.x, state.screen.y, px, state.alpha * glass * depthFade, time + state.node.phase);
        const dot = 1 - glass * 0.85;
        const bright = state.node.kind === "hero" ? 1 : 0.75;
        const size = Math.max(px * 5, 5 * this.ratio) * (state.node.kind === "hero" ? 1.3 : 1);
        ctx.globalCompositeOperation = p.dark ? "lighter" : "source-over";
        ctx.globalAlpha = state.alpha * dot * bright * depthFade;
        ctx.drawImage(this.sprite, state.screen.x - size / 2, state.screen.y - size / 2, size, size);
        ctx.globalAlpha = 1;
      });

    ctx.globalCompositeOperation = "source-over";
  }

  private drawBokeh(time: number) {
    const ctx = this.ctx;
    const p = this.palette;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.globalCompositeOperation = p.dark ? "lighter" : "source-over";
    this.bokeh.forEach((b) => {
      const x = ((b.x + time * b.speed) % 1.2 - 0.1) * w;
      const y = (b.y + Math.sin(time * 0.2 + b.phase) * 0.03) * h;
      const r = b.r * this.ratio;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const strength = b.alpha * (p.dark ? 1 : 0.6);
      g.addColorStop(0, `rgba(${p.glow}, ${strength})`);
      g.addColorStop(0.7, `rgba(${p.glow}, ${strength * 0.5})`);
      g.addColorStop(1, `rgba(${p.glow}, 0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    });
    ctx.globalCompositeOperation = "source-over";
  }

  private drawDust(time: number, s: number) {
    const ctx = this.ctx;
    const p = this.palette;
    const lift = 0.25 + s * 0.1;
    ctx.fillStyle = `rgb(${p.dust})`;
    this.dust.forEach((mote, index) => {
      const y = ((mote.pos[1] + time * 0.012 * (1 + (index % 3)) + 2) % 4) - 2;
      const pr = this.project([mote.pos[0], y, mote.pos[2]]);
      const size = mote.size * this.ratio * clamp(4 / pr.depth, 0.5, 1.6);
      ctx.globalAlpha = mote.alpha * lift * (p.dark ? 1 : 0.6);
      ctx.fillRect(pr.x, pr.y, size, size);
    });
    ctx.globalAlpha = 1;
  }

  /* Şüşə kürə: şəffaf gövdə, kənar işığı, parıltı, alt tərəfdə əks */
  private drawGlass(x: number, y: number, r: number, alpha: number, time: number) {
    const ctx = this.ctx;
    const p = this.palette;
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = alpha;

    const body = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.05, x, y, r);
    body.addColorStop(0, p.dark ? "rgba(190, 255, 225, 0.16)" : "rgba(255, 255, 255, 0.7)");
    body.addColorStop(0.55, p.glassBody);
    body.addColorStop(0.92, p.dark ? "rgba(110, 240, 185, 0.16)" : "rgba(22, 104, 78, 0.12)");
    body.addColorStop(1, p.dark ? "rgba(110, 240, 185, 0.35)" : "rgba(22, 104, 78, 0.28)");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    /* Kənar işığı */
    ctx.strokeStyle = p.glassRim;
    ctx.lineWidth = Math.max(0.8, r * 0.022);
    ctx.stroke();

    /* İçəridə zəif zümrüd nüvə: kürə "canlı" görünsün */
    const core = ctx.createRadialGradient(x, y, 0, x, y, r * 0.5);
    core.addColorStop(0, p.dark ? "rgba(120, 255, 195, 0.22)" : "rgba(22, 104, 78, 0.12)");
    core.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
    ctx.fill();

    /* Altdan qayıdan zümrüd işıq */
    const caustic = ctx.createRadialGradient(x + r * 0.15, y + r * 0.55, 0, x + r * 0.15, y + r * 0.55, r * 0.6);
    caustic.addColorStop(0, p.dark ? "rgba(120, 255, 195, 0.35)" : "rgba(22, 104, 78, 0.18)");
    caustic.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = caustic;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.98, 0, Math.PI * 2);
    ctx.fill();

    /* Parıltı: yuxarı solda, yavaşca yerini dəyişir */
    const shift = Math.sin(time * 0.25) * r * 0.04;
    ctx.fillStyle = p.glassShine;
    ctx.beginPath();
    ctx.ellipse(x - r * 0.38 + shift, y - r * 0.45, r * 0.22, r * 0.11, -0.6, 0, Math.PI * 2);
    ctx.globalAlpha = alpha * 0.55;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + r * 0.42, y + r * 0.3, r * 0.04, 0, Math.PI * 2);
    ctx.globalAlpha = alpha * 0.4;
    ctx.fill();
    ctx.restore();
  }

  /* AzLink mərkəzi: parlaq nüvə, iki halqa, yavaş fırlanan qırıq halqa */
  private drawHub(x: number, y: number, r: number, alpha: number, time: number) {
    const ctx = this.ctx;
    const p = this.palette;
    const glowSize = r * 9;
    ctx.globalCompositeOperation = p.dark ? "lighter" : "source-over";
    ctx.globalAlpha = alpha * 0.8;
    ctx.drawImage(this.sprite, x - glowSize / 2, y - glowSize / 2, glowSize, glowSize);
    ctx.globalAlpha = 1;
    this.drawGlass(x, y, r, alpha, time);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = `rgba(${p.line}, 0.7)`;
    ctx.lineWidth = 1.2 * this.ratio;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([4 * this.ratio, 7 * this.ratio]);
    ctx.lineDashOffset = -time * 6 * this.ratio;
    ctx.strokeStyle = `rgba(${p.line}, 0.45)`;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    /* Ortada "A" işarəsi: AzLink */
    ctx.strokeStyle = p.dark ? "rgba(225, 255, 240, 0.9)" : "rgba(22, 104, 78, 0.9)";
    ctx.lineWidth = Math.max(1.2, r * 0.12);
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x - r * 0.42, y + r * 0.38);
    ctx.lineTo(x, y - r * 0.45);
    ctx.lineTo(x + r * 0.42, y + r * 0.38);
    ctx.moveTo(x - r * 0.2, y + r * 0.08);
    ctx.lineTo(x + r * 0.2, y + r * 0.08);
    ctx.stroke();
    ctx.restore();
  }
}

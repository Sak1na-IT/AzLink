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
  /* 3-cü mərhələdə bu düyün Alov qülləsinin konturuna keçir */
  tower?: number;
  towerT?: number;
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
  bgBase: "#020b08",
  bgCenter: "#0a3125",
  bgEdge: "#010705",
  glow: "70, 215, 160",
  line: "236, 206, 140",
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
/* Qüllə düyünləri bu dərinlikdə yerləşir */
const TOWER_DEPTH = 1.2;

interface TowerShape {
  cx: number;
  half: number;
  ground: number;
  top: number;
  lean: number;
}

/* Çəkilmiş siluetdə qüllələrin konturu üçün forma.
   PHOTO_TOWERS: 3-cü fotoda (stage-3.jpg) Alov qüllələrinin yeri, şəklin eni və
   hündürlüyünə nisbətdə. Şəbəkə 3-cü mərhələdə bu konturları çəkir. */
const PHOTO_TOWERS: TowerShape[] = [
  { cx: 0.778, half: 0.0216, top: 0.473, ground: 0.643, lean: 0.45 },
  { cx: 0.842, half: 0.0226, top: 0.406, ground: 0.643, lean: 0.5 },
  { cx: 0.908, half: 0.0286, top: 0.362, ground: 0.625, lean: 0.5 },
];

/* Qaranlıq rejimin fotolarında kameranın yaxınlaşdığı nöqtələr
   (şəklin eni/hündürlüyünə nisbətdə): "out" — buradan çıxılır,
   "in" — növbəti şəkil bu nöqtədən açılır */
const JOURNEY = [
  { out: { u: 0.685, v: 0.646 }, in: { u: 0.5, v: 0.5 } }, // aşağıdakı parlaq şüşə kürə
  { out: { u: 0.878, v: 0.418 }, in: { u: 0.655, v: 0.445 } }, // xəritədə Bakı / xəritənin mərkəzi
  { out: { u: 0.5, v: 0.5 }, in: { u: 0.84, v: 0.53 } }, // Alov qüllələri
];

/* 1-ci qaranlıq fotoda (stage-1.jpg) şüşə kürələrin mərkəzləri */
const SPHERES_IN_PHOTO = [
  { u: 0.744, v: 0.244 },
  { u: 0.685, v: 0.646 },
  { u: 0.53, v: 0.355 },
  { u: 0.932, v: 0.53 },
  { u: 0.464, v: 0.794 },
  { u: 0.631, v: 0.127 },
  { u: 0.881, v: 0.058 },
  { u: 0.94, v: 0.26 },
  { u: 0.512, v: 0.519 },
];

/* Ağ rejimin xəritə fotosunda (stage-2-light.jpg) Bakının yeri */
const BAKU_IN_LIGHT_MAP = { u: 0.855, v: 0.43 };

/* Qüllə konturunda nöqtə: t = 0 sol əsas, 0.5 uc, 1 sağ əsas
   (skyline.ts-dəki forma ilə eyni əyrilər) */
const towerPoint = (g: TowerShape, t: number): [number, number] => {
  const H = g.ground - g.top;
  const tip = g.cx + g.lean * g.half;
  const bezier = (p0: number, p1: number, p2: number, p3: number, u: number) =>
    (1 - u) ** 3 * p0 + 3 * (1 - u) ** 2 * u * p1 + 3 * (1 - u) * u * u * p2 + u ** 3 * p3;
  if (t <= 0.5) {
    const u = t / 0.5;
    return [
      bezier(g.cx - g.half, g.cx - g.half * 1.04, g.cx - g.half * 0.72, tip, u),
      bezier(g.ground, g.ground - H * 0.5, g.top + H * 0.1, g.top, u),
    ];
  }
  const u = (t - 0.5) / 0.5;
  return [
    bezier(tip, g.cx + g.half * 0.88, g.cx + g.half, g.cx + g.half, u),
    bezier(g.top, g.top + H * 0.22, g.ground - H * 0.48, g.ground, u),
  ];
};
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

type Icon = "user" | "briefcase" | "scissors" | "wrench" | "calendar" | "home";

/* Sadə xətt ikonları (24×24 qutuda) */
const ICONS: Record<Icon, Path2D> = {
  user: new Path2D("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 3.6-6 8-6s8 2 8 6"),
  briefcase: new Path2D("M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z M9 7V5h6v2 M3 13h18"),
  scissors: new Path2D("M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M8.1 8.1 20 20 M8.1 15.9 20 4"),
  wrench: new Path2D("M14.7 6.3a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.7-7.7z M14.7 6.3 17 4"),
  calendar: new Path2D("M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z M3 10h18 M8 3v4 M16 3v4"),
  home: new Path2D("M3 11 12 4l9 7v9H3z M10 20v-5h4v5"),
};

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
  /* Şəbəkə ayrıca təbəqədə çəkilir: üstündən bulanıq nüsxə = işıq saçma (bloom) */
  private net = document.createElement("canvas");
  private fog = document.createElement("canvas");
  private overlay = document.createElement("canvas");
  private main: CanvasRenderingContext2D;
  private landDots: { local: Vec3; delay: number }[] = [];
  /* HD fotolar: qaranlıq rejim üçün public/landing/stage-1…3.jpg,
     ağ rejim üçün stage-1-light.jpg və stage-2-light.jpg (3-cü
     mərhələdə xəritə fotosu Bakıya yaxınlaşır). Bir rejimin fotoları
     yüklənibsə həmin rejimdə arxa fon fotodur. */
  private photoSets: Record<"dark" | "light", HTMLImageElement[]> = { dark: [], light: [] };
  private photoReady = { dark: false, light: false };

  private get photos() {
    return this.photoSets[this.palette.dark ? "dark" : "light"];
  }
  private skyOrigin = { x: 0, y: 0 };
  /* 2-ci fotonun parlaq nöqtələri: kürələrdən uzanan xətlər buraya çatır */
  private mapTargets: { u: number; v: number; from: number; delay: number; near: number[] }[] = [];
  private landRings: Vec3[][] = [];
  private badges: { local: Vec3; icon: Icon; city: number; delay: number }[] = [];
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
    this.main = ctx;
    this.sprite = document.createElement("canvas");
    this.backdrop = document.createElement("canvas");

    (["dark", "light"] as const).forEach((mode) => {
      let loaded = 0;
      const files = mode === "light" ? [1, 2, 2] : [1, 2, 3];
      this.photoSets[mode] = files.map((stage) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => {
          loaded += 1;
          if (loaded === 3) this.photoReady[mode] = true;
        };
        image.src = `/landing/stage-${stage}${mode === "light" ? "-light" : ""}.jpg`;
        return image;
      });
    });
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
    const interiorCount = this.compact ? 34 : 78;
    const placed: [number, number][] = [...CITIES.map(toLocal)];
    let tries = 0;
    while (nodes.length - interiorStart < interiorCount && tries < 4000) {
      tries += 1;
      const point: [number, number] = [lerp(-1.1, 1.15, random()), lerp(-0.85, 0.9, random())];
      const inMap = inside(point, mainlandLocal) || inside(point, nakhLocal);
      if (!inMap) continue;
      if (placed.some((p) => Math.hypot(p[0] - point[0], p[1] - point[1]) < (this.compact ? 0.1 : 0.082))) continue;
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

    /* Şərqdəki daxili düyünlərin bir hissəsi 3-cü mərhələdə Alov
       qüllələrinə axır: xəritə qüllələrə çevrilir */
    const perTower = this.compact ? 7 : 14;
    const towerNodes = Array.from({ length: interiorEnd - interiorStart }, (_, k) => interiorStart + k)
      .sort((a, b) => nodes[b].local[0] - nodes[a].local[0])
      .slice(0, perTower * 3);
    towerNodes.forEach((index, k) => {
      const tower = k % 3;
      const slot = Math.floor(k / 3);
      nodes[index].tower = tower;
      nodes[index].towerT = perTower > 1 ? slot / (perTower - 1) : 0.5;
      nodes[index].radius = [nodes[index].radius[0], nodes[index].radius[1], 0.008];
    });

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
        addEdge(city, target, [0, 0.4, nodes[target].tower !== undefined ? 0 : 0.85], 0.35 + random() * 0.15)
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
          const leaves = nodes[i].tower !== undefined || nodes[j].tower !== undefined;
          addEdge(i, j, [0, both ? 0.5 : 0, leaves ? 0 : 0.75], random() * 0.45);
        });
    }

    /* Mərkəzdən şəhərlərə və yaxın düyünlərə */
    for (let city = 0; city < HEROES.length; city += 1) addEdge(hubIndex, city, [0, 0, 0.8], 0.2 + random() * 0.25);
    nearest(hubIndex, interiorStart, interiorEnd, 5)
      .filter((target) => nodes[target].tower === undefined)
      .forEach((target) => addEdge(hubIndex, target, [0, 0, 0.55], 0.3 + random() * 0.2));

    /* Qüllələrin konturu, içində "LED" pillələri və xəritəyə bağlayan sap */
    for (let tower = 0; tower < 3; tower += 1) {
      const ring = towerNodes
        .filter((index) => nodes[index].tower === tower)
        .sort((a, b) => (nodes[a].towerT ?? 0) - (nodes[b].towerT ?? 0));
      ring.forEach((index, k) => {
        if (k > 0) addEdge(ring[k - 1], index, [0, 0, 0.95], 0.25 + (k / ring.length) * 0.3);
        const partner = ring[ring.length - 1 - k];
        if (k < ring.length / 2 - 1 && partner !== index) addEdge(index, partner, [0, 0, 0.45], 0.45 + random() * 0.1);
      });
      const tip = ring[Math.floor(ring.length / 2)];
      addEdge(hubIndex, tip, [0, 0, 0.85], 0.2);
      if (tower === 0) addEdge(0, ring[0], [0, 0, 0.8], 0.3);
    }

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

    /* Torpaq: ölkənin içi incə nöqtə toru ilə işıqlanır */
    const step = this.compact ? 0.034 : 0.024;
    this.landDots = [];
    for (let y = -0.85; y < 0.9; y += step) {
      for (let x = -1.15; x < 1.2; x += step) {
        const point: [number, number] = [x + (random() - 0.5) * step * 0.6, y + (random() - 0.5) * step * 0.6];
        if (inside(point, mainlandLocal) || inside(point, nakhLocal)) {
          this.landDots.push({ local: [point[0], point[1], 0], delay: random() });
        }
      }
    }
    this.landRings = [mainlandLocal, nakhLocal].map((ring) => ring.map(([x, y]) => [x, y, 0] as Vec3));

    /* Xidmət nişanları: xəritənin üstündə üzən şüşə dairələr */
    const icons: [LonLat, Icon][] = [
      [[46.1, 40.25], "user"],
      [[48.2, 41.05], "briefcase"],
      [[47.55, 39.85], "scissors"],
      [[49.1, 39.75], "wrench"],
      [[45.55, 39.45], "calendar"],
      [[48.95, 40.95], "home"],
    ];
    this.badges = (this.compact ? icons.slice(0, 4) : icons).map(([lonLat, icon]) => {
      const [x, y] = toLocal(lonLat);
      let city = 0;
      let best = Infinity;
      CITIES.forEach((c, index) => {
        const [cx, cy] = toLocal(c);
        const d = Math.hypot(cx - x, cy - y);
        if (d < best) {
          best = d;
          city = index;
        }
      });
      return { local: [x, y, -0.14] as Vec3, icon, city, delay: random() * 0.4 };
    });

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

    this.net.width = w;
    this.net.height = h;

    /* Duman: kiçik ölçüdə çəkilib böyüdülür, ona görə çox yumşaqdır */
    const fw = Math.round(w / 6);
    const fh = Math.round(h / 6);
    this.fog.width = fw;
    this.fog.height = fh;
    const fc = this.fog.getContext("2d")!;
    fc.clearRect(0, 0, fw, fh);
    const random = seeded(3);
    for (let i = 0; i < 70; i += 1) {
      const x = random() * fw;
      const y = fh * (0.25 + random() * 0.75);
      const r = (0.08 + random() * 0.22) * fw;
      const g2 = fc.createRadialGradient(x, y, 0, x, y, r);
      const a = (p.dark ? 0.025 : 0.02) + random() * (p.dark ? 0.03 : 0.02);
      g2.addColorStop(0, p.dark ? `rgba(60, 170, 125, ${a})` : `rgba(40, 140, 100, ${a})`);
      g2.addColorStop(1, "rgba(0, 0, 0, 0)");
      fc.fillStyle = g2;
      fc.fillRect(x - r, y - r, r * 2, r * 2);
    }

    /* Kino effekti: kənarlarda qaranlıq və çox incə dən */
    this.overlay.width = w;
    this.overlay.height = h;
    const oc = this.overlay.getContext("2d")!;
    oc.clearRect(0, 0, w, h);
    const vignette = oc.createRadialGradient(w * 0.6, h * 0.5, Math.min(w, h) * 0.3, w * 0.6, h * 0.5, Math.max(w, h) * 0.8);
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(1, p.dark ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0)");
    oc.fillStyle = vignette;
    oc.fillRect(0, 0, w, h);
    const tile = document.createElement("canvas");
    tile.width = 160;
    tile.height = 160;
    const tc = tile.getContext("2d")!;
    const noise = tc.createImageData(160, 160);
    for (let i = 0; i < noise.data.length; i += 4) {
      /* Math.random: təkrarlanan naxış (zolaq) yaranmasın */
      const v = Math.random() * 255;
      noise.data[i] = v;
      noise.data[i + 1] = v;
      noise.data[i + 2] = v;
      noise.data[i + 3] = p.dark ? 9 : 6;
    }
    tc.putImageData(noise, 0, 0);
    oc.fillStyle = oc.createPattern(tile, "repeat")!;
    oc.fillRect(0, 0, w, h);

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
      lift: lerp(0.02, this.compact ? 0.32 : 0.6, t),
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
    const photo = this.photoReady[p.dark ? "dark" : "light"];
    if (photo) this.drawPhotos(s, time);
    else ctx.drawImage(this.backdrop, 0, 0);

    /* Xəritə ətrafında yumşaq işıq: 2-ci və 3-cü mərhələdə güclənir */
    const mapGlow = smooth(clamp(s * 0.8));
    if (mapGlow > 0.01) {
      const gx = this.canvas.width * (this.compact ? 0.5 : 0.67);
      const gy = this.canvas.height * 0.45;
      const gr = Math.max(this.canvas.width, this.canvas.height) * 0.45;
      const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
      glow.addColorStop(0, `rgba(${p.glow}, ${(p.dark ? 0.15 : 0.1) * mapGlow})`);
      glow.addColorStop(1, `rgba(${p.glow}, 0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    if (!photo) this.drawFog(time, s);
    this.drawBokeh(time);

    /* Uzaqda Bakı siluetı: sağ-aşağıda, aşağıdan yavaşca qalxır */
    const sky = smooth(clamp((s - 1.15) / 0.85));
    if (sky > 0.01 && !photo) {
      const drift = this.reduced ? 0 : Math.sin(time * 0.05) * 6 * this.ratio;
      const sx = this.compact ? 0 : this.canvas.width * 0.38;
      const sy = this.canvas.height - this.height * (this.compact ? 0.32 : 0.5) * this.ratio + (1 - sky) * 60 * this.ratio;
      this.skyline.draw(ctx, sx + drift, sy, sky, time);
      this.skyOrigin = { x: sx + drift, y: sy };
    }

    /* Fotolar varsa səhnəni fotolar özü danışır: üstündə yalnız
       üzən işıq zərrəcikləri və kino effekti, çəkilmiş xəritə yoxdur */
    if (photo) {
      this.drawDust(time, s);
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(this.overlay, 0, 0);
      return;
    }

    if (!photo) {
      const drift = this.reduced ? 0 : Math.sin(time * 0.05) * 6 * this.ratio;
      this.skyOrigin = {
        x: (this.compact ? 0 : this.canvas.width * 0.38) + drift,
        y: this.canvas.height - this.height * (this.compact ? 0.32 : 0.5) * this.ratio + (1 - sky) * 60 * this.ratio,
      };
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

      /* 3-cü mərhələ: xəritədən qopub qüllənin konturuna axır */
      if (node.tower !== undefined && s > 1) {
        const f = smooth(clamp((s - 1 - node.delay * 0.5) / 0.6));
        if (f > 0) {
          const target = this.towerWorld(node.tower, node.towerT ?? 0, s, time, photo);
          pos = [lerp(pos[0], target[0], f), lerp(pos[1], target[1], f), lerp(pos[2], target[2], f)];
        }
      }
      this.positions[index] = pos;
      const radius = stageValue(node.radius, s, node.delay).value;
      const alpha = stageValue(node.alpha, s, node.delay).value;
      return { node, pos, radius, alpha, screen: this.project(pos) };
    });

    /* Torpaq: ölkənin forması işıqlı nöqtələrlə dolur */
    this.drawLand(s, m, swayAll);

    /* Şəbəkə ayrıca təbəqəyə çəkilir */
    const net = this.net.getContext("2d")!;
    net.globalCompositeOperation = "source-over";
    net.globalAlpha = 1;
    net.clearRect(0, 0, this.net.width, this.net.height);
    this.ctx = net;
    const glassQueue: { x: number; y: number; r: number; alpha: number; depth: number; phase: number }[] = [];

    /* Xətlər */
    ctx.globalCompositeOperation = "source-over";
    net.globalCompositeOperation = p.dark ? "lighter" : "source-over";
    net.lineCap = "round";
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
      net.strokeStyle = `rgba(${p.line}, ${alpha * 0.14 * depthFade})`;
      net.lineWidth = 3.6 * this.ratio;
      net.beginPath();
      net.moveTo(a.screen.x, a.screen.y);
      net.lineTo(ex, ey);
      net.stroke();
      net.strokeStyle = `rgba(${p.line}, ${alpha * 0.75 * depthFade})`;
      net.lineWidth = 1 * this.ratio;
      net.stroke();
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
        net.globalAlpha = alpha * Math.sin(t * Math.PI);
        net.drawImage(this.sprite, lerp(a.x, b.x, t) - size / 2, lerp(a.y, b.y, t) - size / 2, size, size);
      });
      net.globalAlpha = 1;
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
        const glass = photo ? 0 : clamp((px - 7 * this.ratio) / (12 * this.ratio));
        if (glass > 0) {
          glassQueue.push({
            x: state.screen.x,
            y: state.screen.y,
            r: px,
            alpha: state.alpha * glass * depthFade,
            depth: state.screen.depth,
            phase: time + state.node.phase,
          });
        }
        const dot = 1 - glass * 0.85;
        const bright = state.node.kind === "hero" ? 1 : 0.75;
        const size = Math.max(px * 5, 5 * this.ratio) * (state.node.kind === "hero" ? 1.3 : 1);
        net.globalCompositeOperation = p.dark ? "lighter" : "source-over";
        net.globalAlpha = state.alpha * dot * bright * depthFade;
        net.drawImage(this.sprite, state.screen.x - size / 2, state.screen.y - size / 2, size, size);
        net.globalAlpha = 1;
      });

    /* Xidmət nişanları */
    this.drawBadges(s, m, swayAll, nodeState, time);

    this.ctx = this.main;

    /* Bloom: əvvəl bulanıq nüsxə, sonra iti xətlər */
    ctx.save();
    ctx.globalCompositeOperation = p.dark ? "lighter" : "source-over";
    ctx.filter = `blur(${Math.round(9 * this.ratio)}px)`;
    ctx.globalAlpha = p.dark ? 0.95 : 0.16;
    ctx.drawImage(this.net, 0, 0);
    ctx.filter = "none";
    ctx.globalAlpha = 1;
    ctx.drawImage(this.net, 0, 0);
    ctx.restore();

    /* Şüşə kürələr: fokusdan uzaq olanlar bulanıqdır (dərinlik) */
    glassQueue.forEach((g) => {
      const blur = clamp(Math.abs(g.depth - 3.9) * 2.4, 0, 6) * this.ratio;
      ctx.save();
      if (blur > 0.6) ctx.filter = `blur(${blur.toFixed(1)}px)`;
      this.drawGlass(g.x, g.y, g.r, g.alpha, g.phase);
      ctx.restore();
    });

    this.drawDust(time, s);

    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(this.overlay, 0, 0);
    ctx.globalCompositeOperation = "source-over";
  }

  /* Fotolar üst-üstə: hər mərhələnin fotosu əvvəlkinin üstünə açılır,
     yavaş yaxınlaşma və yüngül şaquli hərəkətlə (dərinlik hissi) */
  private drawPhotos(s: number, time: number) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (this.palette.dark) {
      this.drawDarkJourney(s, time);
      return;
    }
    void w;
    void h;
    const weights = [1, smooth(clamp(s)), smooth(clamp(s - 1))];
    this.photos.forEach((image, index) => {
      const alpha = weights[index];
      if (alpha < 0.01) return;
      const rect = this.photoRect(index, s, time);
      ctx.globalAlpha = alpha;
      ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h);
    });
    ctx.globalAlpha = 1;
  }

  /* Qaranlıq rejim: kamera bir istiqamətdə irəli gedir.
     1 → 2: şüşə kürəyə yaxınlaşır; xəritə həmin kürənin içində kiçik
     başlayır və dairə kimi açılaraq böyüyür (kürədən çıxır).
     2 → 3: Bakının parlaq nöqtəsinə yaxınlaşır; Alov qüllələri o
     nöqtədən açılır. Hər şey eyni nöqtədən, fasiləsiz hərəkət edir;
     geri sürüşdürəndə eyni yolla geri qayıdır. */
  private drawDarkJourney(s: number, time: number) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const drift = this.reduced ? 0 : Math.sin(time * 0.05) * 0.006;

    /* Şəklin "örtük" ölçüsü; lövbər nöqtəsi "at" yerinə qoyulub k dəfə böyüdülür */
    const place = (index: number, k: number, anchor: { u: number; v: number }, at: { x: number; y: number } | null) => {
      const image = this.photos[index];
      const cover = Math.max(w / image.naturalWidth, h / image.naturalHeight) * (1.03 + drift);
      const bw = image.naturalWidth * cover;
      const bh = image.naturalHeight * cover;
      const bx = (w - bw) * (this.compact ? 0.7 : 0.5);
      const by = (h - bh) / 2;
      const ax = bx + anchor.u * bw;
      const ay = by + anchor.v * bh;
      const tx = at ? at.x : ax;
      const ty = at ? at.y : ay;
      return { x: tx + (bx - ax) * k, y: ty + (by - ay) * k, w: bw * k, h: bh * k, anchor: { x: ax, y: ay } };
    };

    const stage = Math.min(Math.floor(s), 1);
    const raw = s >= 2 ? 1 : clamp(s - stage);
    const t = smooth(raw);

    /* 1 → 2: kürələri birləşdirən qızılı xətlər aşağıya uzanır, xəritənin
       parlaq nöqtələrinə çatır və xəritəyə çevrilir; xəritə fotosu bu
       anda bulanıqdan aydınlaşaraq üzə çıxır. */
    if (stage === 0) {
      const spheres = place(0, 1 + 0.18 * t, { u: 0.7, v: 0.5 }, null);
      const blurOut = 5 * smooth(clamp((raw - 0.45) / 0.5)) * this.ratio;
      ctx.save();
      if (blurOut > 0.5) ctx.filter = `blur(${blurOut.toFixed(1)}px)`;
      ctx.drawImage(this.photos[0], spheres.x, spheres.y, spheres.w, spheres.h);
      ctx.restore();

      const map = place(1, 1.06 - 0.06 * t, JOURNEY[1].in, null);
      const reveal = smooth(clamp((raw - 0.4) / 0.5));
      if (reveal > 0.005) {
        const blurIn = 8 * (1 - reveal) * this.ratio;
        ctx.save();
        ctx.globalAlpha = reveal;
        if (blurIn > 0.5) ctx.filter = `blur(${blurIn.toFixed(1)}px)`;
        ctx.drawImage(this.photos[1], map.x, map.y, map.w, map.h);
        ctx.restore();
      }

      this.drawThreads(raw, time, spheres, map);
      return;
    }

    const from = JOURNEY[stage];
    const to = JOURNEY[stage + 1];

    /* Gedən şəkil: yaxınlaşdığımız nöqtə ekranda yerində qalır */
    const point = place(stage, 1, from.out, null).anchor;
    const out = place(stage, 1 + 2.4 * t, from.out, point);
    ctx.globalAlpha = 1;
    ctx.drawImage(this.photos[stage], out.x, out.y, out.w, out.h);
    if (raw <= 0.001) return;

    /* Gələn şəkil: həmin nöqtədə kiçik başlayır, öz yerinə doğru böyüyür */
    const home = place(stage + 1, 1, to.in, null).anchor;
    const k = lerp(0.28, 1, t);
    const incoming = place(stage + 1, k, to.in, {
      x: lerp(point.x, home.x, t),
      y: lerp(point.y, home.y, t),
    });

    /* Dairəvi açılış: mərkəz yaxınlaşdığımız nöqtədir */
    const layer = this.net;
    const lc = layer.getContext("2d")!;
    lc.globalCompositeOperation = "source-over";
    lc.globalAlpha = 1;
    lc.clearRect(0, 0, w, h);
    lc.drawImage(this.photos[stage + 1], incoming.x, incoming.y, incoming.w, incoming.h);
    /* Dairənin mərkəzi gələn şəklin lövbəri ilə birlikdə hərəkət edir */
    const cx = lerp(point.x, home.x, t);
    const cy = lerp(point.y, home.y, t);
    const opening = lerp(Math.min(w, h) * 0.04, Math.hypot(w, h) * 0.75, smooth(clamp(raw * 1.15)));
    /* Dairə şəklin öz kənarlarından çıxmasın (düz kənar görünməsin) */
    const imageCap = 0.5 * Math.min(incoming.w, incoming.h) + smooth(clamp((raw - 0.7) / 0.3)) * Math.hypot(w, h);
    const radius = Math.min(opening, imageCap);
    const mask = lc.createRadialGradient(cx, cy, radius * 0.55, cx, cy, radius);
    mask.addColorStop(0, "rgba(0, 0, 0, 1)");
    mask.addColorStop(1, "rgba(0, 0, 0, 0)");
    lc.globalCompositeOperation = "destination-in";
    lc.fillStyle = mask;
    lc.fillRect(0, 0, w, h);
    lc.globalCompositeOperation = "source-over";

    ctx.globalAlpha = smooth(clamp(raw / 0.25));
    ctx.drawImage(layer, 0, 0);
    ctx.globalAlpha = 1;

    /* Açılışın kənarında incə işıq halqası */
    const ring = Math.sin(Math.PI * clamp(raw * 1.1));
    if (ring > 0.02) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = `rgba(${stage === 0 ? "140, 240, 195" : "240, 210, 150"}, ${0.35 * ring})`;
      ctx.lineWidth = 2 * this.ratio;
      ctx.filter = `blur(${Math.round(3 * this.ratio)}px)`;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.78, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  /* 2-ci fotodan parlaq nöqtələri seçir (bir dəfə) */
  private sampleMapTargets() {
    const image = this.photos[1];
    if (this.mapTargets.length || !image.complete || !image.naturalWidth) return;
    const cw = 168;
    const ch = Math.round((image.naturalHeight / image.naturalWidth) * cw);
    const probe = document.createElement("canvas");
    probe.width = cw;
    probe.height = ch;
    const pc = probe.getContext("2d", { willReadFrequently: true });
    if (!pc) return;
    pc.drawImage(image, 0, 0, cw, ch);
    let data: Uint8ClampedArray;
    try {
      data = pc.getImageData(0, 0, cw, ch).data;
    } catch {
      return;
    }
    const bright: { u: number; v: number }[] = [];
    for (let y = 0; y < ch; y += 1) {
      for (let x = Math.round(cw * 0.38); x < cw; x += 1) {
        const i = (y * cw + x) * 4;
        if (data[i + 1] > 120 && data[i + 1] > data[i] * 1.25) bright.push({ u: (x + 0.5) / cw, v: (y + 0.5) / ch });
      }
    }
    if (bright.length < 10) return;
    const random = seeded(41);
    const count = this.compact ? 36 : 70;
    const picked: { u: number; v: number }[] = [];
    let tries = 0;
    while (picked.length < count && tries < 4000) {
      tries += 1;
      const p = bright[Math.floor(random() * bright.length)];
      if (picked.some((q) => Math.hypot(q.u - p.u, (q.v - p.v) * 0.56) < 0.022)) continue;
      picked.push(p);
    }
    this.mapTargets = picked.map((p, index) => {
      /* Ən yaxın kürədən başlayır, amma yuxarıdakı kürələr də iştirak edir */
      const from = SPHERES_IN_PHOTO.map((sphere, k) => ({ k, d: Math.hypot(sphere.u - p.u, sphere.v - p.v) + (index % 3 === 0 ? random() * 0.3 : 0) }))
        .sort((a, b) => a.d - b.d)[0].k;
      return { ...p, from, delay: random() * 0.25, near: [] as number[] };
    });
    this.mapTargets.forEach((target, index) => {
      target.near = this.mapTargets
        .map((other, k) => ({ k, d: Math.hypot(other.u - target.u, (other.v - target.v) * 0.56) }))
        .filter((item) => item.k !== index)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2)
        .map((item) => item.k);
    });
  }

  /* Kürələrdən xəritəyə uzanan qızılı xətlər */
  private drawThreads(
    raw: number,
    time: number,
    spheres: { x: number; y: number; w: number; h: number },
    map: { x: number; y: number; w: number; h: number }
  ) {
    this.sampleMapTargets();
    if (!this.mapTargets.length) return;
    const ctx = this.ctx;
    /* Əvvəl görünür, sonda xəritənin içində əriyir */
    const presence = smooth(clamp(raw / 0.12)) * (1 - smooth(clamp((raw - 0.78) / 0.22)));
    if (presence < 0.01) return;
    const r = this.ratio;
    const toScreen = (rect: { x: number; y: number; w: number; h: number }, u: number, v: number) => ({
      x: rect.x + u * rect.w,
      y: rect.y + v * rect.h,
    });
    const ends = this.mapTargets.map((target) => toScreen(map, target.u, target.v));

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    this.mapTargets.forEach((target, index) => {
      const grow = smooth(clamp((raw - 0.05 - target.delay) / 0.45));
      if (grow < 0.01) return;
      const sphere = SPHERES_IN_PHOTO[target.from];
      const start = toScreen(spheres, sphere.u, sphere.v);
      const end = ends[index];
      /* Xətt aşağıya doğru əyilərək uzanır */
      const control = { x: lerp(start.x, end.x, 0.3), y: Math.max(start.y, end.y) + 40 * r };
      const steps = 18;
      const upto = Math.max(1, Math.round(steps * grow));
      ctx.beginPath();
      for (let k = 0; k <= upto; k += 1) {
        const u = (k / steps);
        const x = (1 - u) * (1 - u) * start.x + 2 * (1 - u) * u * control.x + u * u * end.x;
        const y = (1 - u) * (1 - u) * start.y + 2 * (1 - u) * u * control.y + u * u * end.y;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(236, 206, 140, ${0.12 * presence})`;
      ctx.lineWidth = 3 * r;
      ctx.stroke();
      ctx.strokeStyle = `rgba(246, 222, 160, ${0.6 * presence})`;
      ctx.lineWidth = 0.9 * r;
      ctx.stroke();

      /* Xəttin ucunda işıq; çatanda xəritədə düyün yanır */
      const u = upto / steps;
      const tip = {
        x: (1 - u) * (1 - u) * start.x + 2 * (1 - u) * u * control.x + u * u * end.x,
        y: (1 - u) * (1 - u) * start.y + 2 * (1 - u) * u * control.y + u * u * end.y,
      };
      const size = (grow >= 1 ? 9 : 12) * r;
      ctx.globalAlpha = presence * (grow >= 1 ? 0.8 : 1);
      ctx.drawImage(this.sprite, tip.x - size / 2, tip.y - size / 2, size, size);
      ctx.globalAlpha = 1;

      /* Çatandan sonra qonşu nöqtələrlə birləşir: xəritənin toru */
      if (grow >= 0.98) {
        target.near.forEach((k) => {
          const link = smooth(clamp((raw - 0.5 - target.delay * 0.5) / 0.25));
          if (link < 0.01) return;
          const other = ends[k];
          ctx.strokeStyle = `rgba(150, 245, 200, ${0.5 * presence * link})`;
          ctx.lineWidth = 0.8 * r;
          ctx.beginPath();
          ctx.moveTo(end.x, end.y);
          ctx.lineTo(lerp(end.x, other.x, link), lerp(end.y, other.y, link));
          ctx.stroke();
        });
      }
    });
    ctx.restore();
    void time;
  }

  private photoRect(index: number, s: number, time: number) {
    const image = this.photos[index];
    const w = this.canvas.width;
    const h = this.canvas.height;
    const local = clamp(s - index + 1, 0, 2);
    const zoom = 1.05 - local * 0.02 + (this.reduced ? 0 : Math.sin(time * 0.05 + index) * 0.006);
    const cover = Math.max(w / image.naturalWidth, h / image.naturalHeight) * zoom;
    const dw = image.naturalWidth * cover;
    const dh = image.naturalHeight * cover;
    /* Telefonda şəklin sağ hissəsi (səhnə) görünsün */
    const focusX = this.compact ? 0.7 : 0.5;
    const rect = { x: (w - dw) * focusX, y: (h - dh) / 2 - (local - 1) * h * 0.02, w: dw, h: dh };

    /* Ağ rejimdə 3-cü mərhələ: xəritə fotosu Bakıya (parlayan nöqtəyə)
       yaxınlaşır; 2-ci və 3-cü təbəqə eyni hərəkəti edir, keçid görünmür */
    if (!this.palette.dark && index >= 1) {
      const t = smooth(clamp(s - 1));
      const k = 1 + 1.1 * t;
      const anchor = { x: rect.x + BAKU_IN_LIGHT_MAP.u * rect.w, y: rect.y + BAKU_IN_LIGHT_MAP.v * rect.h };
      const target = { x: lerp(anchor.x, w * (this.compact ? 0.6 : 0.74), t), y: lerp(anchor.y, h * 0.5, t) };
      return {
        x: target.x + (rect.x - anchor.x) * k,
        y: target.y + (rect.y - anchor.y) * k,
        w: rect.w * k,
        h: rect.h * k,
      };
    }
    return rect;
  }

  /* Qüllə konturunda nöqtənin dünyadakı yeri (foto və ya çəkilmiş siluet) */
  private towerWorld(tower: number, t: number, s: number, time: number, photo: boolean): Vec3 {
    let screen: [number, number];
    if (photo) {
      const rect = this.photoRect(2, s, time);
      const [u, v] = towerPoint(PHOTO_TOWERS[tower], t);
      screen = [rect.x + u * rect.w, rect.y + v * rect.h];
    } else {
      const shape = this.skyline.towers()[tower];
      const [u, v] = towerPoint(shape, t);
      screen = [this.skyOrigin.x + u, this.skyOrigin.y + v];
    }
    const scale = (this.focal / (TOWER_DEPTH + CAMERA)) * this.ratio;
    return [
      (screen[0] - this.canvas.width * (this.compact ? 0.5 : 0.67)) / scale,
      (this.canvas.height * 0.5 - screen[1]) / scale,
      TOWER_DEPTH,
    ];
  }

  private drawFog(time: number, s: number) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const strength = 0.7 + s * 0.25;
    ctx.save();
    ctx.globalCompositeOperation = this.palette.dark ? "lighter" : "multiply";
    [0, 1].forEach((layer) => {
      const speed = layer ? 0.012 : 0.007;
      const dx = Math.sin(time * speed * 6 + layer * 2) * w * 0.06 - w * 0.1;
      ctx.globalAlpha = strength * (layer ? 0.7 : 1);
      ctx.drawImage(this.fog, dx, layer ? h * 0.05 : 0, w * 1.25, h);
    });
    ctx.restore();
  }

  private drawLand(s: number, m: ReturnType<NetworkScene["mapTransform"]>, sway: number) {
    const ctx = this.ctx;
    const p = this.palette;
    const land = smooth(clamp((s - 0.55) / 0.6));
    if (land < 0.01) return;
    const place = (local: Vec3) => {
      const pos = this.toWorld(local, m);
      const cz = pos[2] - 1;
      return this.project([pos[0] * Math.cos(sway) + cz * Math.sin(sway), pos[1], -pos[0] * Math.sin(sway) + cz * Math.cos(sway) + 1]);
    };
    /* Ölkənin forması: içəridən yumşaq zümrüd işıq */
    ctx.save();
    ctx.beginPath();
    this.landRings.forEach((ring) => {
      ring.forEach((point, index) => {
        const pr = place(point);
        if (index === 0) ctx.moveTo(pr.x, pr.y);
        else ctx.lineTo(pr.x, pr.y);
      });
      ctx.closePath();
    });
    const center = place([0, 0, 0]);
    const fill = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, center.scale * 0.9);
    fill.addColorStop(0, `rgba(${p.glow}, ${(p.dark ? 0.2 : 0.12) * land})`);
    fill.addColorStop(1, `rgba(${p.glow}, ${(p.dark ? 0.05 : 0.04) * land})`);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.restore();

    /* İncə nöqtə toru: ölkə "işıqlı torpaq" kimi görünür */
    ctx.fillStyle = `rgb(${p.line})`;
    const size = Math.max(1, 1.1 * this.ratio);
    this.landDots.forEach((dot) => {
      const a = smooth(clamp((land - dot.delay * 0.6) / 0.4));
      if (a < 0.02) return;
      const pr = place(dot.local);
      ctx.globalAlpha = a * (p.dark ? 0.32 : 0.35) * clamp(1.6 - pr.depth / 3.6, 0.3, 1);
      ctx.fillRect(pr.x, pr.y, size, size);
    });
    ctx.globalAlpha = 1;
  }

  private drawBadges(
    s: number,
    m: ReturnType<NetworkScene["mapTransform"]>,
    sway: number,
    nodeState: { screen: { x: number; y: number } }[],
    time: number
  ) {
    const ctx = this.ctx;
    const p = this.palette;
    const show = smooth(clamp((s - 1.05) / 0.5));
    if (show < 0.01) return;
    this.badges.forEach((badge, index) => {
      const a = smooth(clamp((show - badge.delay) / 0.6));
      if (a < 0.01) return;
      const bob = this.reduced ? 0 : Math.sin(time * 0.8 + index) * 0.012;
      const pos = this.toWorld([badge.local[0], badge.local[1], badge.local[2] + bob], m);
      const cz = pos[2] - 1;
      const pr = this.project([pos[0] * Math.cos(sway) + cz * Math.sin(sway), pos[1], -pos[0] * Math.sin(sway) + cz * Math.cos(sway) + 1]);
      const city = nodeState[badge.city].screen;
      const r = (this.compact ? 15 : 19) * this.ratio;

      /* Nişandan şəhərə incə xətt */
      ctx.save();
      ctx.globalAlpha = a * 0.5;
      ctx.strokeStyle = `rgb(${p.line})`;
      ctx.lineWidth = 0.8 * this.ratio;
      ctx.setLineDash([3 * this.ratio, 4 * this.ratio]);
      ctx.beginPath();
      ctx.moveTo(pr.x, pr.y);
      ctx.lineTo(city.x, city.y);
      ctx.stroke();
      ctx.setLineDash([]);

      /* Şüşə dairə */
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = a;
      ctx.fillStyle = p.dark ? "rgba(4, 26, 19, 0.82)" : "rgba(255, 255, 255, 0.88)";
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = p.dark ? "rgba(150, 255, 210, 0.75)" : "rgba(22, 104, 78, 0.6)";
      ctx.lineWidth = 1.1 * this.ratio;
      ctx.stroke();

      /* İkon */
      ctx.translate(pr.x - r * 0.5, pr.y - r * 0.5);
      ctx.scale(r / 24, r / 24);
      ctx.strokeStyle = p.dark ? "rgba(200, 255, 230, 0.95)" : "rgba(22, 104, 78, 0.95)";
      ctx.lineWidth = 1.8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke(ICONS[badge.icon]);
      ctx.restore();
    });
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

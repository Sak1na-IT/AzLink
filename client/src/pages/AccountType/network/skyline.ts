/*
 * Bakı siluetı: Alov qüllələri, TV qülləsi, axşam şəhəri, bulvar
 * işıqları və Xəzərdə əks. 3-cü mərhələdə ekranın sağ-aşağısında
 * görünür.
 *
 * Qaranlıq rejim: axşam. Qüllələrin fasadında LED ekranda dalğalanan
 * Azərbaycan bayrağı, pəncərələrdə isti işıq.
 * Açıq rejim: gündüz. Qüllələr mavi şüşə, üzərində işıq əksi gəzir.
 *
 * Dəyişməyən hissələr (göy, uzaq şəhər, binalar) ölçü dəyişəndə bir
 * dəfə çəkilir; hər kadrda yalnız qüllələr, su əksi və işıqlar.
 */

/* LED ekranın rəngləri: bayraq, bir az işıqlı tonda */
const FLAG = ["#22b8e6", "#e2384b", "#3fa64c"];

const seeded = (seed: number) => {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
};

interface Tower {
  x: number; // mərkəz (enin hissəsi)
  height: number; // hündürlüyün hissəsi
  width: number;
  lean: number;
}

/* Bulvardan baxanda: solda ən hündür, sağda iki alçaq qüllə */
const TOWERS: Tower[] = [
  { x: 0.6, height: 0.84, width: 0.06, lean: 0.4 },
  { x: 0.775, height: 0.66, width: 0.056, lean: 0.35 },
  { x: 0.885, height: 0.72, width: 0.058, lean: 0.38 },
];

export class Skyline {
  private base = document.createElement("canvas");
  private front = document.createElement("canvas");
  private frame = document.createElement("canvas");
  private glow = document.createElement("canvas");
  private width = 0;
  private height = 0;
  private ratio = 1;
  private dark = true;
  private lamps: { x: number; y: number; size: number }[] = [];

  setup(width: number, height: number, ratio: number, dark: boolean) {
    this.width = Math.max(1, Math.round(width));
    this.height = Math.max(1, Math.round(height));
    this.ratio = ratio;
    this.dark = dark;
    [this.base, this.front, this.frame].forEach((canvas) => {
      canvas.width = this.width;
      canvas.height = this.height;
    });
    this.paintBase();
    this.paintFront();
    this.paintGlow();
  }

  get horizon() {
    return this.height * 0.8;
  }

  /* Qüllənin forması: sol tərəf qövslə ucuna qalxır, sağ tərəf demək olar düz */
  private towerPath(tower: Tower) {
    const w = this.width;
    const h = this.height;
    const cx = tower.x * w;
    const half = (tower.width * w) / 2;
    const ground = h * 0.76;
    const top = ground - tower.height * h;
    const H = ground - top;
    const tip = cx + tower.lean * half;
    /* Bir tərəf uzun qövslə iti uca qalxır, digəri demək olar düz enir */
    const path = new Path2D();
    path.moveTo(cx - half, ground);
    path.bezierCurveTo(cx - half * 1.04, ground - H * 0.5, cx - half * 0.72, top + H * 0.1, tip, top);
    path.bezierCurveTo(cx + half * 0.88, top + H * 0.22, cx + half * 1.0, ground - H * 0.48, cx + half, ground);
    path.closePath();
    return { path, cx, half, ground, top };
  }

  /* ---------- Arxa: göy, uzaq təpələr və şəhər ---------- */
  private paintBase() {
    const c = this.base.getContext("2d")!;
    const w = this.width;
    const h = this.height;
    const r = this.ratio;
    const random = seeded(11);
    c.clearRect(0, 0, w, h);

    /* Üfüqdə axşam işığı (və ya gündüz səması) */
    const sky = c.createLinearGradient(0, 0, 0, this.horizon);
    if (this.dark) {
      sky.addColorStop(0, "rgba(8, 30, 40, 0)");
      sky.addColorStop(0.45, "rgba(20, 60, 80, 0.55)");
      sky.addColorStop(0.78, "rgba(170, 110, 70, 0.55)");
      sky.addColorStop(1, "rgba(255, 170, 90, 0.7)");
    } else {
      sky.addColorStop(0, "rgba(200, 225, 240, 0)");
      sky.addColorStop(0.6, "rgba(190, 220, 238, 0.7)");
      sky.addColorStop(1, "rgba(240, 232, 214, 0.95)");
    }
    c.fillStyle = sky;
    c.fillRect(0, 0, w, this.horizon);

    /* Uzaq təpələr və onların üzərində şəhər işıqları */
    c.fillStyle = this.dark ? "#0b1a22" : "rgba(120, 150, 160, 0.55)";
    c.beginPath();
    c.moveTo(0, h * 0.7);
    for (let x = 0; x <= w; x += w / 12) {
      c.lineTo(x, h * (0.6 + Math.sin(x / w * 5 + 1) * 0.04 + random() * 0.02));
    }
    c.lineTo(w, h * 0.8);
    c.lineTo(0, h * 0.8);
    c.fill();
    if (this.dark) {
      for (let i = 0; i < 260; i += 1) {
        const x = random() * w;
        const y = h * (0.64 + random() * 0.14);
        c.fillStyle = random() > 0.3 ? `rgba(255, 196, 120, ${0.3 + random() * 0.5})` : `rgba(255, 240, 210, ${0.4 + random() * 0.4})`;
        c.fillRect(x, y, 1.2 * r, 1.2 * r);
      }
    }

    /* TV qülləsi */
    const tv = w * 0.13;
    const tvTop = h * 0.08;
    const tvBase = h * 0.66;
    const body = c.createLinearGradient(tv - 6 * r, 0, tv + 6 * r, 0);
    body.addColorStop(0, this.dark ? "#3a2a18" : "#9aa7ad");
    body.addColorStop(0.5, this.dark ? "#d9a24a" : "#e6ecef");
    body.addColorStop(1, this.dark ? "#3a2a18" : "#8d989e");
    c.fillStyle = body;
    c.beginPath();
    c.moveTo(tv - 7 * r, tvBase);
    c.lineTo(tv - 2.5 * r, h * 0.28);
    c.lineTo(tv + 2.5 * r, h * 0.28);
    c.lineTo(tv + 7 * r, tvBase);
    c.fill();
    c.fillRect(tv - 9 * r, h * 0.27, 18 * r, 9 * r);
    c.fillRect(tv - 6 * r, h * 0.33, 12 * r, 5 * r);
    c.fillRect(tv - 1.2 * r, tvTop, 2.4 * r, h * 0.2);
    if (this.dark) {
      c.fillStyle = "rgba(255, 90, 60, 0.95)";
      [0.1, 0.16, 0.22].forEach((y) => c.fillRect(tv - 1.5 * r, h * y, 3 * r, 3 * r));
    }

    /* Hündür binalar (qüllələrin arxasında) */
    for (let i = 0; i < 26; i += 1) {
      const bx = random() * w;
      const bw = (10 + random() * 22) * r;
      const bh = h * (0.08 + random() * 0.16);
      const by = h * 0.74 - bh;
      c.fillStyle = this.dark ? "#0d1b24" : "rgba(150, 170, 178, 0.8)";
      c.fillRect(bx, by, bw, bh + h * 0.06);
      this.windows(c, bx, by, bw, bh, random, 0.35);
    }
  }

  /* ---------- Ön: sahil binaları, bulvar ---------- */
  private paintFront() {
    const c = this.front.getContext("2d")!;
    const w = this.width;
    const h = this.height;
    const r = this.ratio;
    const random = seeded(29);
    c.clearRect(0, 0, w, h);

    /* Sahil boyu klassik binalar: tünd gövdə, damda isti işıq,
       pəncərələrin yalnız bir hissəsi yanır */
    let x = 0;
    while (x < w) {
      const bw = (22 + random() * 40) * r;
      const bh = h * (0.05 + random() * 0.1);
      const by = this.horizon - bh;
      const body = c.createLinearGradient(0, by, 0, this.horizon);
      if (this.dark) {
        body.addColorStop(0, "#4a3418");
        body.addColorStop(0.18, "#22180c");
        body.addColorStop(1, "#0e0a05");
      } else {
        body.addColorStop(0, "#efe4cc");
        body.addColorStop(1, "#d8c9a8");
      }
      c.fillStyle = body;
      c.fillRect(x, by, bw, bh);
      /* Fasadın yuxarı kənarında işıq xətti */
      c.fillStyle = this.dark ? "rgba(255, 200, 120, 0.55)" : "rgba(255, 255, 255, 0.7)";
      c.fillRect(x, by, bw, 1.2 * r);
      /* Kübbə və ya qüllə: bəzi binalarda */
      if (random() > 0.75) {
        c.fillStyle = this.dark ? "#3a2812" : "#e3d4b2";
        c.beginPath();
        c.arc(x + bw / 2, by, bw * 0.16, Math.PI, 0);
        c.fill();
      }
      /* Pəncərələr: hündür, nazik, isti */
      for (let wy = by + 5 * r; wy < this.horizon - 4 * r; wy += 7 * r) {
        for (let wx = x + 4 * r; wx < x + bw - 4 * r; wx += 6 * r) {
          if (random() > (this.dark ? 0.55 : 0.4)) {
            c.fillStyle = this.dark
              ? `rgba(255, ${190 + Math.round(random() * 40)}, ${110 + Math.round(random() * 50)}, ${0.55 + random() * 0.4})`
              : "rgba(90, 110, 115, 0.35)";
            c.fillRect(wx, wy, 1.6 * r, 3.4 * r);
          }
        }
      }
      x += bw + (1 + random() * 3) * r;
    }

    /* Bulvar zolağı və fənərlər */
    c.fillStyle = this.dark ? "#120c06" : "#cbbf9f";
    c.fillRect(0, this.horizon - 2 * r, w, 4 * r);
    this.lamps = [];
    for (let lx = 6 * r; lx < w; lx += 22 * r) {
      this.lamps.push({ x: lx, y: this.horizon - 6 * r, size: (10 + random() * 6) * r });
    }
  }

  private windows(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, random: () => number, chance: number) {
    const r = this.ratio;
    c.fillStyle = this.dark ? "rgba(255, 205, 130, 0.8)" : "rgba(80, 100, 110, 0.3)";
    for (let wy = y + 4 * r; wy < y + h - 2 * r; wy += 5 * r) {
      for (let wx = x + 2 * r; wx < x + w - 2 * r; wx += 4 * r) {
        if (random() < chance) c.fillRect(wx, wy, 1.6 * r, 2.2 * r);
      }
    }
  }

  /* Qüllələrin ətrafında işıq halosu (bir dəfə, bulanıq) */
  private paintGlow() {
    this.glow.width = this.width;
    this.glow.height = this.height;
    const c = this.glow.getContext("2d")!;
    c.clearRect(0, 0, this.width, this.height);
    if (!this.dark) return;
    c.filter = `blur(${18 * this.ratio}px)`;
    TOWERS.forEach((tower, index) => {
      const { path } = this.towerPath(tower);
      c.fillStyle = FLAG[index % 3];
      c.globalAlpha = 0.32;
      c.fill(path);
    });
    c.filter = "none";
    c.globalAlpha = 1;
  }

  /* ---------- Hər kadr ---------- */
  draw(target: CanvasRenderingContext2D, x: number, y: number, alpha: number, time: number) {
    if (alpha <= 0.01) return;
    const c = this.frame.getContext("2d")!;
    const w = this.width;
    const h = this.height;
    const r = this.ratio;
    c.globalCompositeOperation = "source-over";
    c.globalAlpha = 1;
    c.clearRect(0, 0, w, h);
    c.drawImage(this.base, 0, 0);

    if (this.dark) {
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.55 + Math.sin(time * 0.8) * 0.08;
      c.drawImage(this.glow, 0, 0);
      c.globalCompositeOperation = "source-over";
      c.globalAlpha = 1;
    }

    TOWERS.forEach((tower, index) => this.drawTower(c, tower, index, time));
    c.drawImage(this.front, 0, 0);

    /* Bulvar fənərləri */
    c.globalCompositeOperation = this.dark ? "lighter" : "source-over";
    this.lamps.forEach((lamp, index) => {
      const g = c.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, lamp.size);
      const flicker = 0.85 + Math.sin(time * 2 + index) * 0.05;
      g.addColorStop(0, this.dark ? `rgba(255, 220, 150, ${0.9 * flicker})` : "rgba(255, 255, 255, 0.5)");
      g.addColorStop(0.3, this.dark ? "rgba(255, 170, 80, 0.3)" : "rgba(255, 255, 255, 0.1)");
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      c.fillStyle = g;
      c.fillRect(lamp.x - lamp.size, lamp.y - lamp.size, lamp.size * 2, lamp.size * 2);
    });
    c.globalCompositeOperation = "source-over";

    /* Xəzər: tünd su, şəhərin dalğalanan əksi */
    const horizon = Math.round(this.horizon);
    const water = c.createLinearGradient(0, horizon, 0, h);
    water.addColorStop(0, this.dark ? "#0a1a22" : "#b9d3dc");
    water.addColorStop(1, this.dark ? "#03090c" : "#d7e6e8");
    c.fillStyle = water;
    c.fillRect(0, horizon, w, h - horizon);
    const step = Math.max(2, Math.round(2 * r));
    for (let row = 0; row < h - horizon; row += step) {
      const sourceY = horizon - row * 1.9 - step;
      if (sourceY < 0) break;
      const shift = Math.sin(row * 0.35 + time * 1.6) * (1 + row * 0.05) * r;
      c.globalAlpha = (this.dark ? 0.5 : 0.35) * (1 - row / (h - horizon));
      c.drawImage(this.frame, 0, sourceY, w, step, shift, horizon + row, w, step);
    }
    c.globalAlpha = 1;

    /* Kənarlara doğru əriyən maska: səhnəyə qarışsın */
    c.globalCompositeOperation = "destination-in";
    const fadeX = c.createLinearGradient(0, 0, w * 0.3, 0);
    fadeX.addColorStop(0, "rgba(0, 0, 0, 0)");
    fadeX.addColorStop(1, "rgba(0, 0, 0, 1)");
    c.fillStyle = fadeX;
    c.fillRect(0, 0, w, h);
    const fadeY = c.createLinearGradient(0, 0, 0, h * 0.4);
    fadeY.addColorStop(0, "rgba(0, 0, 0, 0)");
    fadeY.addColorStop(1, "rgba(0, 0, 0, 1)");
    c.fillStyle = fadeY;
    c.fillRect(0, 0, w, h);
    c.globalCompositeOperation = "source-over";

    target.globalAlpha = alpha;
    target.drawImage(this.frame, x, y);
    target.globalAlpha = 1;
  }

  private drawTower(c: CanvasRenderingContext2D, tower: Tower, index: number, time: number) {
    const { path, cx, half, ground, top } = this.towerPath(tower);
    const r = this.ratio;
    const height = ground - top;
    c.save();
    c.clip(path);

    if (this.dark) {
      /* LED fasad: dalğalanan bayraq */
      const strip = Math.max(2, Math.round(2.5 * r));
      for (let x = cx - half * 1.2; x < cx + half * 1.2; x += strip) {
        const wave = Math.sin((x - cx) / (half * 0.9) * 1.8 + time * 1.3 + index) * height * 0.022;
        const band = height / 3;
        FLAG.forEach((color, k) => {
          c.fillStyle = color;
          c.fillRect(x, top + band * k + wave - (k === 0 ? height : 0), strip + 0.5, band + (k === 0 ? height : 0) + (k === 2 ? height : 0));
        });
      }
      /* Ay-ulduz: ortadakı qırmızı zolaqda */
      const sy = top + height / 2 + Math.sin(time * 1.3 + index) * height * 0.022;
      const moon = half * 0.15;
      c.fillStyle = "rgba(255, 255, 255, 0.92)";
      c.beginPath();
      c.arc(cx - half * 0.12, sy, moon, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = FLAG[1];
      c.beginPath();
      c.arc(cx - half * 0.06, sy, moon * 0.8, 0, Math.PI * 2);
      c.fill();
      /* Səkkizguşəli ulduz */
      c.fillStyle = "rgba(255, 255, 255, 0.92)";
      c.beginPath();
      for (let k = 0; k < 16; k += 1) {
        const angle = (k / 16) * Math.PI * 2;
        const radius = k % 2 === 0 ? moon * 0.5 : moon * 0.22;
        c.lineTo(cx + half * 0.16 + Math.cos(angle) * radius, sy + Math.sin(angle) * radius);
      }
      c.fill();
      /* Yuxarıdan aşağı yumşaq işıq: LED parıltısı */
      const sheen = c.createLinearGradient(0, top, 0, ground);
      sheen.addColorStop(0, "rgba(255, 255, 255, 0.18)");
      sheen.addColorStop(0.5, "rgba(255, 255, 255, 0)");
      sheen.addColorStop(1, "rgba(0, 0, 0, 0.35)");
      c.fillStyle = sheen;
      c.fillRect(cx - half * 1.2, top, half * 2.4, height);
      /* LED sətirləri və şüşə panellər */
      c.fillStyle = "rgba(0, 0, 0, 0.28)";
      for (let y = top; y < ground; y += 2.4 * r) c.fillRect(cx - half * 1.2, y, half * 2.4, 0.8 * r);
      c.fillStyle = "rgba(0, 0, 0, 0.18)";
      for (let k = -2; k <= 2; k += 1) c.fillRect(cx + k * half * 0.42, top, 1 * r, height);
      /* Kənarda kölgə: həcm hissi */
      const shade = c.createLinearGradient(cx - half, 0, cx + half, 0);
      shade.addColorStop(0, "rgba(0, 0, 0, 0.45)");
      shade.addColorStop(0.35, "rgba(0, 0, 0, 0)");
      shade.addColorStop(0.75, "rgba(255, 255, 255, 0.08)");
      shade.addColorStop(1, "rgba(0, 0, 0, 0.35)");
      c.fillStyle = shade;
      c.fillRect(cx - half * 1.2, top, half * 2.4, height);
    } else {
      /* Gündüz: mavi şüşə, üzərindən işıq zolağı keçir */
      const glass = c.createLinearGradient(cx - half, 0, cx + half, 0);
      glass.addColorStop(0, "#4f8fb5");
      glass.addColorStop(0.45, "#a9d4ea");
      glass.addColorStop(1, "#3c7499");
      c.fillStyle = glass;
      c.fillRect(cx - half * 1.2, top, half * 2.4, height);
      const sweep = ((time * 0.08 + index * 0.3) % 1.4) - 0.2;
      const shine = c.createLinearGradient(0, top + height * (sweep - 0.15), 0, top + height * (sweep + 0.15));
      shine.addColorStop(0, "rgba(255, 255, 255, 0)");
      shine.addColorStop(0.5, "rgba(255, 255, 255, 0.45)");
      shine.addColorStop(1, "rgba(255, 255, 255, 0)");
      c.fillStyle = shine;
      c.fillRect(cx - half * 1.2, top, half * 2.4, height);
      c.fillStyle = "rgba(30, 70, 95, 0.18)";
      for (let y = top; y < ground; y += 4 * r) c.fillRect(cx - half * 1.2, y, half * 2.4, 1 * r);
    }
    c.restore();

    /* Kənar işığı */
    c.strokeStyle = this.dark ? "rgba(255, 255, 255, 0.35)" : "rgba(255, 255, 255, 0.8)";
    c.lineWidth = 1 * r;
    c.stroke(path);
  }
}

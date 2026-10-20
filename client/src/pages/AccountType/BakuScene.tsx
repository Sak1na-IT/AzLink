import { t } from "../../i18n";

/*
 * Bakı sahilinin panoraması (illüstrasiya). Üç lay fərqli sürətlə
 * sürüşür: uzaq təpələr və TV qülləsi, əsas lay və ön planda bulvar
 * fənərləri. Aşağı sürüşdürdükcə "kamera" sahil boyunca gedir:
 * Alov qüllələri → bulvar və Bakı Gözü → İçərişəhər və Qız qalası →
 * Heydər Əliyev Mərkəzi → Dövlət Bayrağı Meydanı.
 * Kameranın yeri valideyndəki --cam (0–1) ilə idarə olunur. Rənglər
 * CSS-dədir: açıq rejimdə gündüz, qaranlıq rejimdə gecə Bakısı.
 */

/* Əsas layın koordinatları: 0–7500 en, üfüq (sahil) y = 800 */
export const PANORAMA_WIDTH = 7500;
const SHORE = 800;

/* Görməli yerlər: adın göstərildiyi mərkəz (x) */
export const LANDMARKS = [
  { id: "flames", x: 1060 },
  { id: "eye", x: 3200 },
  { id: "maiden", x: 4410 },
  { id: "hac", x: 6400 },
  { id: "flag", x: 7150 },
] as const;

/* Sabit "təsadüfi" ədədlər: hər açılışda eyni şəhər */
const seeded = (seed: number) => {
  let value = seed;

  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
};

/* Alov qülləsi: altı enli, ucu bir tərəfə əyilən alov forması */
const flame = (cx: number, base: number, height: number, width: number, lean: number) => {
  const top = base - height;

  return [
    `M ${cx - width / 2} ${base}`,
    `C ${cx - width / 2} ${base - height * 0.55} ${cx - width * 0.62} ${top + height * 0.22} ${cx + lean} ${top}`,
    `C ${cx + width * 0.42} ${top + height * 0.28} ${cx + width / 2} ${base - height * 0.5} ${cx + width / 2} ${base}`,
    "Z",
  ].join(" ");
};

/* Qala divarının dişləri */
const battlement = (from: number, to: number, top: number) => {
  const parts = [`M ${from} ${SHORE} L ${from} ${top + 10}`];

  for (let x = from; x < to; x += 28) {
    parts.push(`L ${x} ${top} L ${x + 14} ${top} L ${x + 14} ${top + 10} L ${Math.min(x + 28, to)} ${top + 10}`);
  }

  parts.push(`L ${to} ${SHORE} Z`);
  return parts.join(" ");
};

interface Block {
  x: number;
  width: number;
  height: number;
  windows: { x: number; y: number }[];
}

/* Çoxmərtəbəli binalar və onların pəncərələri */
const makeBlocks = (from: number, to: number, seed: number, maxHeight: number): Block[] => {
  const random = seeded(seed);
  const blocks: Block[] = [];
  let x = from;

  while (x < to) {
    const width = 46 + Math.round(random() * 54);
    const height = 70 + Math.round(random() * maxHeight);
    const windows: { x: number; y: number }[] = [];

    for (let wy = SHORE - height + 14; wy < SHORE - 14; wy += 16) {
      for (let wx = x + 8; wx < x + width - 10; wx += 13) {
        if (random() > 0.45) windows.push({ x: wx, y: wy });
      }
    }

    blocks.push({ x, width, height, windows });
    x += width + 4 + Math.round(random() * 10);
  }

  return blocks;
};

const BLOCK_GROUPS = [
  makeBlocks(1650, 2850, 7, 120),
  makeBlocks(3420, 3900, 11, 100),
  makeBlocks(3980, 4200, 19, 90),
  makeBlocks(4800, 5900, 23, 150),
];

/* Bakı Gözü */
const EYE = { cx: 3200, cy: 640, r: 118 };
const EYE_SPOKES = Array.from({ length: 16 }, (_, index) => (index / 16) * Math.PI * 2);

/* Ön plan fənərləri */
const LAMPS = Array.from({ length: 36 }, (_, index) => 120 + index * 250);

/* Heydər Əliyev Mərkəzinin dalğası: sol tərəf alçaq, ortada zirvə */
const hac = (x: number) => `M ${x} 800 C ${x + 60} 750 ${x + 80} 660 ${x + 160} 610 C ${x + 250} 556 ${x + 360} 570 ${x + 400} 620 C ${x + 440} 668 ${x + 470} 690 ${x + 510} 676 C ${x + 545} 664 ${x + 565} 692 ${x + 585} 734 C ${x + 598} 762 ${x + 610} 786 ${x + 620} 800 Z`;

function Blocks({ blocks, lift = 0 }: { blocks: Block[]; lift?: number }) {
  return (
    <>
      <g className="baku-blocks">
        {blocks.map((block) => (
          <rect
            key={block.x}
            x={block.x}
            y={SHORE - block.height - lift}
            width={block.width}
            height={block.height + lift}
            rx="3"
          />
        ))}
      </g>
      <g className="baku-windows">
        {blocks.flatMap((block) =>
          block.windows.map((w) => (
            <rect key={`${w.x}-${w.y}`} x={w.x} y={w.y - lift} width="6" height="8" />
          ))
        )}
      </g>
    </>
  );
}

/* Görməli yerin adı: incə xətt və yazı, kamera yaxınlaşanda görünür */
function Label({ id, x, top, text }: { id: string; x: number; top: number; text: string }) {
  return (
    <g className="baku-label" data-landmark={id}>
      <line x1={x} y1={top - 12} x2={x} y2={top - 64} />
      <text x={x} y={top - 80} textAnchor="middle">
        {text}
      </text>
    </g>
  );
}

function BakuScene() {
  return (
    <div className="baku-scene" aria-hidden="true">
      {/* ---------- Uzaq lay: Abşeron təpələri, TV qülləsi ---------- */}
      <svg
        className="baku-layer baku-layer--far"
        viewBox={`0 0 ${PANORAMA_WIDTH} 1000`}
        preserveAspectRatio="xMinYMax meet"
      >
        <path
          className="baku-hills"
          d={`M 0 ${SHORE} L 0 640 C 400 580 800 610 1200 560 C 1600 515 1900 600 2300 585 C 2800 566 3200 520 3700 560 C 4200 596 4600 548 5100 590 C 5600 620 6100 560 6600 585 C 7000 605 7300 580 7500 600 L 7500 ${SHORE} Z`}
        />

        {/* Bakı TV qülləsi */}
        <g className="baku-tv">
          <path d="M 1592 560 L 1600 290 L 1608 560 Z" />
          <rect x="1586" y="320" width="28" height="34" rx="6" />
          <rect x="1590" y="362" width="20" height="12" rx="4" />
          <line x1="1600" y1="290" x2="1600" y2="222" />
          <circle className="baku-light--red" cx="1600" cy="222" r="4" />
        </g>

        {/* Uzaqda hündür binalar */}
        <g className="baku-far-towers">
          <path d="M 3540 560 C 3538 470 3550 400 3576 330 C 3596 400 3606 470 3604 560 Z" />
          <rect x="3632" y="470" width="34" height="90" />
          <rect x="3480" y="490" width="40" height="70" />
          <rect x="2440" y="520" width="30" height="70" />
          <rect x="2484" y="500" width="26" height="90" />
          <rect x="5200" y="500" width="36" height="90" />
          <rect x="5250" y="470" width="28" height="120" />
        </g>
      </svg>

      {/* ---------- Əsas lay ---------- */}
      <svg
        className="baku-layer baku-layer--main"
        viewBox={`0 0 ${PANORAMA_WIDTH} 1000`}
        preserveAspectRatio="xMinYMax meet"
      >
        <defs>
          <linearGradient id="baku-flame-glass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" className="baku-stop-glass-a" />
            <stop offset="55%" className="baku-stop-glass-b" />
            <stop offset="100%" className="baku-stop-glass-c" />
          </linearGradient>

          {/* Gecə: qüllələrdə yuxarı axan alov işığı */}
          <linearGradient id="baku-flame-fire" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ff7a2a" />
            <stop offset="35%" stopColor="#ffb347" />
            <stop offset="65%" stopColor="#ff5a1f" />
            <stop offset="100%" stopColor="#ffd27a" />
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              values="0 0.6; 0 -0.6"
              dur="2.6s"
              repeatCount="indefinite"
            />
          </linearGradient>

          <linearGradient id="baku-stone" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" className="baku-stop-stone-a" />
            <stop offset="60%" className="baku-stop-stone-b" />
            <stop offset="100%" className="baku-stop-stone-c" />
          </linearGradient>

          <linearGradient id="baku-wave" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" className="baku-stop-wave-a" />
            <stop offset="100%" className="baku-stop-wave-b" />
          </linearGradient>
        </defs>

        {/* ===== Alov qüllələri təpədə ===== */}
        <path
          className="baku-ground"
          d={`M 660 ${SHORE} C 760 720 860 690 1000 672 C 1120 658 1240 680 1360 735 C 1420 762 1480 790 1540 ${SHORE} Z`}
        />
        <g className="baku-flames">
          <path d={flame(930, 700, 300, 92, 18)} />
          <path d={flame(1068, 690, 380, 104, -14)} />
          <path d={flame(1190, 705, 330, 96, 10)} />
        </g>
        <g className="baku-flame-lines">
          {[890, 910, 930, 950, 1028, 1048, 1068, 1088, 1108, 1152, 1172, 1192, 1212].map((x) => (
            <line key={x} x1={x} y1="420" x2={x} y2="700" />
          ))}
        </g>
        <Label id="flames" x={1068} top={310} text={t("Alov qüllələri")} />

        {/* ===== Bulvar binaları ===== */}
        <Blocks blocks={BLOCK_GROUPS[0]} />

        {/* ===== Bakı Gözü ===== */}
        <g className="baku-eye">
          <path d={`M ${EYE.cx - 60} ${SHORE} L ${EYE.cx} ${EYE.cy} L ${EYE.cx + 60} ${SHORE}`} />
          <circle cx={EYE.cx} cy={EYE.cy} r={EYE.r} />
          <circle cx={EYE.cx} cy={EYE.cy} r={EYE.r - 10} />
          {EYE_SPOKES.map((angle) => (
            <line
              key={angle}
              x1={EYE.cx}
              y1={EYE.cy}
              x2={EYE.cx + Math.cos(angle) * EYE.r}
              y2={EYE.cy + Math.sin(angle) * EYE.r}
            />
          ))}
        </g>
        <g className="baku-eye-cabins">
          {EYE_SPOKES.map((angle) => (
            <circle
              key={angle}
              cx={EYE.cx + Math.cos(angle) * (EYE.r + 7)}
              cy={EYE.cy + Math.sin(angle) * (EYE.r + 7)}
              r="6"
            />
          ))}
        </g>
        <Label id="eye" x={EYE.cx} top={EYE.cy - EYE.r - 10} text={t("Bakı Gözü")} />

        <Blocks blocks={BLOCK_GROUPS[1]} />
        <Blocks blocks={BLOCK_GROUPS[2]} lift={20} />

        {/* ===== İçərişəhər: qala divarı, məscid, minarə ===== */}
        <g className="baku-oldcity">
          <path d={battlement(4190, 4344, 732)} />
          <path d={battlement(4500, 4700, 732)} />
          <path d="M 4250 742 L 4250 712 Q 4280 668 4310 712 L 4310 742 Z" />
          <rect x="4324" y="640" width="12" height="102" />
          <path d="M 4320 640 L 4330 618 L 4340 640 Z" />
          <path d="M 4600 742 L 4600 716 Q 4625 682 4650 716 L 4650 742 Z" />
          <path className="baku-gate" d="M 4568 800 L 4568 772 Q 4580 756 4592 772 L 4592 800 Z" />
        </g>

        {/* Qız qalası: silindr gövdə, bir tərəfdə dayaq çıxıntısı */}
        <g className="baku-maiden">
          <path d="M 4372 800 L 4380 540 L 4464 540 L 4472 800 Z" fill="url(#baku-stone)" />
          <path d="M 4464 590 L 4492 594 L 4498 800 L 4470 800 Z" fill="url(#baku-stone)" />
          <path className="baku-maiden-top" d="M 4376 540 L 4376 528 L 4390 528 L 4390 520 L 4404 520 L 4404 528 L 4420 528 L 4420 520 L 4434 520 L 4434 528 L 4450 528 L 4450 520 L 4464 520 L 4464 528 L 4468 528 L 4468 540 Z" />
          <g className="baku-maiden-rings">
            <line x1="4379" y1="600" x2="4466" y2="600" />
            <line x1="4377" y1="680" x2="4468" y2="680" />
          </g>
        </g>
        <Label id="maiden" x={4422} top={520} text={t("Qız qalası")} />

        {/* ===== Müasir şəhər ===== */}
        <Blocks blocks={BLOCK_GROUPS[3]} />

        {/* ===== Heydər Əliyev Mərkəzi ===== */}
        <g className="baku-hac">
          <path fill="url(#baku-wave)" d={hac(6100)} />
          <path
            className="baku-hac-fold"
            d="M 6180 800 C 6220 750 6250 680 6320 640 C 6380 606 6450 620 6490 668"
          />
        </g>
        <Label id="hac" x={6340} top={570} text={t("Heydər Əliyev Mərkəzi")} />

        {/* ===== Dövlət Bayrağı Meydanı ===== */}
        <g className="baku-flag">
          <path className="baku-flag-pole" d="M 7146 800 L 7150 330 L 7154 800 Z" />
          <g className="baku-flag-cloth">
            <rect x="7154" y="336" width="120" height="26" fill="#00b5e2" />
            <rect x="7154" y="362" width="120" height="26" fill="#ef3340" />
            <rect x="7154" y="388" width="120" height="26" fill="#509e2f" />
            <circle cx="7208" cy="375" r="9" fill="#fff" />
            <circle cx="7211" cy="375" r="7.4" fill="#ef3340" />
            <path
              d="M 7222 369 L 7223.6 373.2 L 7228 373.4 L 7224.6 376.2 L 7225.8 380.6 L 7222 378.2 L 7218.2 380.6 L 7219.4 376.2 L 7216 373.4 L 7220.4 373.2 Z"
              fill="#fff"
            />
          </g>
          <path className="baku-ground" d="M 7020 800 C 7080 776 7220 776 7280 800 Z" />
        </g>
        <Label id="flag" x={7150} top={320} text={t("Dövlət Bayrağı Meydanı")} />

        {/* Sahil xətti */}
        <rect className="baku-shore" x="0" y={SHORE - 4} width={PANORAMA_WIDTH} height="8" />
      </svg>

      {/* ---------- Ön plan: bulvar fənərləri ---------- */}
      <svg
        className="baku-layer baku-layer--near"
        viewBox="0 0 9000 1000"
        preserveAspectRatio="xMinYMax meet"
      >
        <rect className="baku-promenade" x="0" y="960" width="9000" height="40" />
        <line className="baku-railing" x1="0" y1="944" x2="9000" y2="944" />
        {LAMPS.map((x) => (
          <g key={x} className="baku-lamp">
            <rect x={x - 2} y="872" width="4" height="88" />
            <path d={`M ${x - 12} 874 L ${x + 12} 874 L ${x + 7} 862 L ${x - 7} 862 Z`} />
            <circle className="baku-lamp-glow" cx={x} cy="880" r="18" />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default BakuScene;

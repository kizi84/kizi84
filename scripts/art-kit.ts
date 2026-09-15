/**
 * Vector packshot kit.
 *
 * The shop's real photography lives on the old site, which this environment
 * cannot reach, so every catalogue item ships with a generated flat-vector
 * packshot instead of an empty frame. Each archetype below draws one product
 * type on a 1000x1000 studio background; the palette is keyed off the brand so
 * a brand's items read as a family on the grid.
 *
 * Replacing one is a normal upload in the admin panel — nothing here is
 * referenced by the storefront beyond the file path stored on the product.
 */

export type Palette = {
  base: string;
  dark: string;
  light: string;
  ink: string;
  accent: string;
  paper: string;
};

export const PALETTES: Record<string, Palette> = {
  forest:  { base: "#1d6f5c", dark: "#103f34", light: "#8ad6bb", ink: "#0a241e", accent: "#e8a33d", paper: "#f2fbf7" },
  amber:   { base: "#d98420", dark: "#8a4a12", light: "#f6d9a6", ink: "#3a2208", accent: "#1d6f5c", paper: "#fdf7ec" },
  crimson: { base: "#b3342f", dark: "#731d1a", light: "#f2bdb9", ink: "#3d100e", accent: "#e8a33d", paper: "#fdf1f0" },
  navy:    { base: "#27456f", dark: "#152845", light: "#aec4e2", ink: "#0d1830", accent: "#e8a33d", paper: "#f1f5fb" },
  plum:    { base: "#6b3a6e", dark: "#3f1f44", light: "#dcb8e0", ink: "#2a1230", accent: "#ebb968", paper: "#faf1fb" },
  teal:    { base: "#1f6f78", dark: "#0e3c43", light: "#a4d8de", ink: "#08272c", accent: "#e8a33d", paper: "#f0fafb" },
  clay:    { base: "#a85a3c", dark: "#6a3120", light: "#eec5ad", ink: "#331708", accent: "#1d6f5c", paper: "#fdf4ef" },
  moss:    { base: "#4d6b2a", dark: "#2a3c13", light: "#cbdfa6", ink: "#18230b", accent: "#e8a33d", paper: "#f6fbee" },
  slate:   { base: "#4a5663", dark: "#28303a", light: "#c7cfd8", ink: "#141920", accent: "#e8a33d", paper: "#f4f6f9" },
  leather: { base: "#8a5326", dark: "#4f2d10", light: "#d6a76c", ink: "#2a1608", accent: "#efe2c8", paper: "#faf4e9" },
  rose:    { base: "#b34a63", dark: "#71263a", light: "#f0c0cd", ink: "#3b1220", accent: "#e8a33d", paper: "#fdf1f4" },
  sky:     { base: "#2f7fa8", dark: "#164a66", light: "#b3ddef", ink: "#0a2a3a", accent: "#e8a33d", paper: "#eff8fc" },
};

const MOTIF: Record<string, string> = {
  paw: `<ellipse cx="-58" cy="-40" rx="23" ry="31" transform="rotate(-18 -58 -40)"/><ellipse cx="-20" cy="-66" rx="22" ry="31" transform="rotate(-6 -20 -66)"/><ellipse cx="20" cy="-66" rx="22" ry="31" transform="rotate(6 20 -66)"/><ellipse cx="58" cy="-40" rx="23" ry="31" transform="rotate(18 58 -40)"/><path d="M0,-24 C46,-24 76,6 76,38 C76,70 46,88 0,88 C-46,88 -76,70 -76,38 C-76,6 -46,-24 0,-24 Z"/>`,
  dog: `<ellipse cx="-64" cy="-6" rx="23" ry="50" transform="rotate(-14 -64 -6)"/><ellipse cx="64" cy="-6" rx="23" ry="50" transform="rotate(14 64 -6)"/><circle cx="0" cy="0" r="58"/><ellipse cx="0" cy="46" rx="30" ry="24"/>`,
  cat: `<path d="M-60,-34 L-50,-100 L-4,-62 Z"/><path d="M60,-34 L50,-100 L4,-62 Z"/><circle cx="0" cy="4" r="62"/>`,
  bone: `<rect x="-78" y="-22" width="156" height="44" rx="22"/><circle cx="-76" cy="-26" r="28"/><circle cx="-76" cy="26" r="28"/><circle cx="76" cy="-26" r="28"/><circle cx="76" cy="26" r="28"/>`,
  fish: `<path d="M-86,0 C-48,-52 34,-52 70,0 C34,52 -48,52 -86,0 Z"/><path d="M70,0 L112,-38 L112,38 Z"/>`,
  kibble: `<ellipse cx="-46" cy="-30" rx="26" ry="20" transform="rotate(-20 -46 -30)"/><ellipse cx="34" cy="-42" rx="26" ry="20" transform="rotate(14 34 -42)"/><ellipse cx="-12" cy="22" rx="28" ry="21" transform="rotate(-6 -12 22)"/><ellipse cx="58" cy="26" rx="25" ry="19" transform="rotate(24 58 26)"/><ellipse cx="-62" cy="46" rx="24" ry="18" transform="rotate(10 -62 46)"/>`,
  leaf: `<path d="M0,84 C-72,36 -72,-48 0,-92 C72,-48 72,36 0,84 Z"/><rect x="-5" y="-10" width="10" height="104" rx="5"/>`,
  drop: `<path d="M0,-92 C48,-30 76,4 76,38 C76,80 42,104 0,104 C-42,104 -76,80 -76,38 C-76,4 -48,-30 0,-92 Z"/>`,
  heart: `<path d="M0,86 C-96,22 -96,-38 -52,-62 C-22,-78 -2,-58 0,-42 C2,-58 22,-78 52,-62 C96,-38 96,22 0,86 Z"/>`,
  shield: `<path d="M0,-92 L80,-60 L80,10 C80,58 44,84 0,98 C-44,84 -80,58 -80,10 L-80,-60 Z"/>`,
};


/** Stable small hash so a product always gets the same decorative details. */
export function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

type Ctx = {
  pal: Palette;
  brand: string;
  size: string;
  motif: string;
  seed: number;
  /** Second view: a different crop/angle of the same object. */
  alt: boolean;
};

function motifGroup(name: string, fill: string, scale = 1, x = 0, y = 0, opacity = 1) {
  const body = MOTIF[name] ?? MOTIF.paw;
  return `<g transform="translate(${x},${y}) scale(${scale})" fill="${fill}" opacity="${opacity}">${body}</g>`;
}

/**
 * Centred text that shrinks to fit.
 *
 * SVG has no text wrapping and no auto-fit, so a long brand name would simply
 * run off the side of the pack. The advance width of DejaVu Sans Bold is close
 * enough to 0.66em per character to size from, with the letter-spacing added
 * back in.
 */
function label(
  text: string,
  x: number,
  y: number,
  size: number,
  fill: string,
  weight = 700,
  spacing = 0,
  maxWidth = Infinity,
) {
  if (!text || size <= 0) return "";

  const measure = (px: number) => text.length * px * 0.66 + Math.max(0, text.length - 1) * spacing;
  let fontSize = size;
  if (measure(fontSize) > maxWidth) {
    fontSize = Math.max(14, (maxWidth - Math.max(0, text.length - 1) * spacing) / (text.length * 0.66));
  }

  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="DejaVu Sans" font-size="${fontSize.toFixed(1)}" font-weight="${weight}" letter-spacing="${spacing}" fill="${fill}">${esc(text)}</text>`;
}

/* ------------------------------------------------------------------ *
 * Archetypes. Each returns the object drawn on a 1000x1000 canvas,
 * standing on the floor line at y=886.
 * ------------------------------------------------------------------ */

function zigzag(x1: number, x2: number, y: number, depth: number, step: number, up: boolean) {
  const pts: string[] = [`M${x1},${y}`];
  for (let x = x1; x < x2; x += step) {
    pts.push(`L${Math.min(x + step / 2, x2)},${y + (up ? -depth : depth)}`);
    pts.push(`L${Math.min(x + step, x2)},${y}`);
  }
  return pts.join(" ");
}

type Draw = (c: Ctx) => string;

const ARCHETYPES: Record<string, Draw> = {
  /* Stand-up kibble sack — the workhorse of a pet shop shelf. */
  bag: (c) => `
    <path d="M300,232 Q500,198 700,232 L700,298 Q500,266 300,298 Z" fill="${c.pal.dark}"/>
    <path d="M${300},290 Q500,258 700,290 L718,846 Q500,886 282,846 Z" fill="${c.pal.base}"/>
    <path d="M282,846 L300,290 Q334,281 366,276 L352,870 Q314,860 282,846 Z" fill="#ffffff" opacity="0.10"/>
    <path d="M634,276 Q666,282 700,290 L718,846 Q684,861 646,870 Z" fill="#000000" opacity="0.14"/>
    <path d="M282,700 L718,648 L718,752 L282,804 Z" fill="${c.pal.light}"/>
    <circle cx="500" cy="520" r="110" fill="${c.pal.paper}"/>
    ${motifGroup(c.motif, c.pal.base, 0.74, 500, 522)}
    ${label(c.brand, 500, 380, 52, "#ffffff", 800, 1.5, 356)}
    ${label(c.size, 500, 742, 48, c.pal.ink, 800, 1, 372)}
    <path d="M300,232 Q500,198 700,232" fill="none" stroke="${c.pal.ink}" stroke-width="3" opacity="0.25"/>`,

  /* Smaller resealable treat pouch. */
  treats: (c) => `
    <path d="M330,330 Q500,306 670,330 L670,384 Q500,362 330,384 Z" fill="${c.pal.dark}"/>
    <path d="M330,376 Q500,354 670,376 L686,838 Q500,872 314,838 Z" fill="${c.pal.base}"/>
    <path d="M314,838 L330,376 Q356,370 380,366 L370,858 Q340,850 314,838 Z" fill="#ffffff" opacity="0.10"/>
    <rect x="336" y="404" width="328" height="14" rx="7" fill="${c.pal.light}" opacity="0.85"/>
    <path d="M314,706 L686,672 L686,752 L314,788 Z" fill="${c.pal.light}"/>
    <circle cx="500" cy="556" r="92" fill="${c.pal.paper}"/>
    ${motifGroup(c.motif, c.pal.base, 0.6, 500, 558)}
    ${label(c.brand, 500, 470, 40, "#ffffff", 800, 1, 296)}
    ${label(c.size, 500, 742, 38, c.pal.ink, 800, 1, 316)}`,

  /* Flat single-serve sachet. */
  pouch: (c) => `
    <path d="M286,318 L714,318 L714,806 L286,806 Z" fill="${c.pal.base}"/>
    <path d="M286,318 L714,318 L714,386 L286,386 Z" fill="${c.pal.dark}"/>
    <path d="M286,742 L714,742 L714,806 L286,806 Z" fill="${c.pal.dark}"/>
    <path d="${zigzag(286, 714, 318, 16, 26, true)}" fill="${c.pal.dark}"/>
    <path d="${zigzag(286, 714, 806, 16, 26, false)}" fill="${c.pal.dark}"/>
    <path d="M286,318 L340,318 L340,806 L286,806 Z" fill="#ffffff" opacity="0.10"/>
    <path d="M660,318 L714,318 L714,806 L660,806 Z" fill="#000000" opacity="0.12"/>
    <circle cx="500" cy="576" r="92" fill="${c.pal.paper}"/>
    ${motifGroup(c.motif, c.pal.base, 0.6, 500, 578)}
    ${label(c.brand, 500, 460, 44, "#ffffff", 800, 1, 372)}
    ${label(c.size, 500, 786, 34, "#ffffff", 700, 2, 372)}`,

  /* Tin can, viewed slightly from above. */
  can: (c) => `
    <path d="M310,430 L310,772 C310,802 395,822 500,822 C605,822 690,802 690,772 L690,430 Z" fill="${c.pal.base}"/>
    <path d="M336,436 L336,790 C336,800 352,808 370,812 L370,440 Z" fill="#ffffff" opacity="0.18"/>
    <path d="M640,440 L640,812 C660,806 678,796 678,786 L678,436 Z" fill="#000000" opacity="0.14"/>
    <ellipse cx="500" cy="430" rx="190" ry="54" fill="${c.pal.dark}"/>
    <ellipse cx="500" cy="428" rx="168" ry="44" fill="${c.pal.light}"/>
    <ellipse cx="500" cy="428" rx="120" ry="30" fill="none" stroke="${c.pal.dark}" stroke-width="4" opacity="0.4"/>
    <path d="M310,516 C310,546 395,566 500,566 C605,566 690,546 690,516 L690,708 C690,738 605,758 500,758 C395,758 310,738 310,708 Z" fill="${c.pal.paper}"/>
    ${motifGroup(c.motif, c.pal.base, 0.54, 500, 672)}
    ${label(c.brand, 500, 606, 42, c.pal.ink, 800, 1, 330)}`,

  /* Leather collar, laid flat as a ring so the buckle and holes read. */
  collar: (c) => `
    <ellipse cx="500" cy="580" rx="232" ry="178" fill="none" stroke="${c.pal.dark}" stroke-width="52"/>
    <ellipse cx="500" cy="574" rx="232" ry="178" fill="none" stroke="${c.pal.base}" stroke-width="44"/>
    <ellipse cx="500" cy="574" rx="232" ry="178" fill="none" stroke="${c.pal.light}" stroke-width="2.5" stroke-dasharray="12 9" opacity="0.75"/>
    <g fill="${c.pal.accent}">
      <rect x="452" y="352" width="96" height="70" rx="12"/>
      <rect x="470" y="370" width="60" height="34" rx="8" fill="${c.pal.paper}"/>
      <rect x="494" y="342" width="12" height="96" rx="6"/>
    </g>
    <g fill="${c.pal.dark}" opacity="0.7">
      <circle cx="606" cy="410" r="8"/><circle cx="660" cy="452" r="8"/>
      <circle cx="698" cy="506" r="8"/><circle cx="716" cy="568" r="8"/>
    </g>
    <path d="M300,700 Q500,790 700,700" fill="none" stroke="#000000" stroke-width="10" opacity="0.06"/>`,

  /* Coiled leather lead with a swivel clip. */
  leash: (c) => `
    <ellipse cx="470" cy="596" rx="212" ry="158" fill="none" stroke="${c.pal.dark}" stroke-width="42"/>
    <ellipse cx="530" cy="534" rx="168" ry="122" fill="none" stroke="${c.pal.base}" stroke-width="40"/>
    <ellipse cx="530" cy="534" rx="168" ry="122" fill="none" stroke="${c.pal.light}" stroke-width="2.5" stroke-dasharray="11 8" opacity="0.7"/>
    <ellipse cx="470" cy="596" rx="212" ry="158" fill="none" stroke="${c.pal.light}" stroke-width="2.5" stroke-dasharray="11 8" opacity="0.5"/>
    <g fill="${c.pal.accent}">
      <rect x="640" y="640" width="44" height="126" rx="22"/>
      <rect x="652" y="664" width="20" height="78" rx="10" fill="${c.pal.paper}"/>
      <circle cx="662" cy="622" r="26"/>
      <circle cx="662" cy="622" r="13" fill="${c.pal.paper}"/>
    </g>`,

  /* Basket muzzle with breathing gaps. */
  muzzle: (c) => `
    <path d="M336,404 L664,404 L618,724 Q500,772 382,724 Z" fill="${c.pal.base}"/>
    <path d="M336,404 L664,404 L654,474 L346,474 Z" fill="${c.pal.dark}"/>
    <g stroke="${c.pal.dark}" stroke-width="12" opacity="0.55" fill="none">
      <path d="M368,526 L632,526"/><path d="M380,606 L620,606"/><path d="M392,686 L608,686"/>
      <path d="M436,478 L420,736"/><path d="M500,478 L500,754"/><path d="M564,478 L580,736"/>
    </g>
    <path d="M318,398 Q500,244 682,398" fill="none" stroke="${c.pal.dark}" stroke-width="40" stroke-linecap="round"/>
    <path d="M318,398 Q500,256 682,398" fill="none" stroke="${c.pal.accent}" stroke-width="28" stroke-linecap="round"/>
    <path d="M318,398 Q500,256 682,398" fill="none" stroke="${c.pal.light}" stroke-width="3" stroke-dasharray="10 8" opacity="0.7"/>
    <rect x="466" y="248" width="68" height="48" rx="10" fill="${c.pal.dark}"/>
    <rect x="480" y="260" width="40" height="24" rx="6" fill="${c.pal.paper}"/>`,

  /* Chest harness, seen from above. */
  harness: (c) => `
    <path d="M310,380 Q500,320 690,380 L690,452 Q500,392 310,452 Z" fill="${c.pal.base}"/>
    <path d="M356,446 L444,806 L344,806 L282,470 Z" fill="${c.pal.base}"/>
    <path d="M644,446 L556,806 L656,806 L718,470 Z" fill="${c.pal.base}"/>
    <path d="M444,806 L556,806 L556,730 L444,730 Z" fill="${c.pal.dark}"/>
    <g fill="none" stroke="${c.pal.light}" stroke-width="3" stroke-dasharray="11 8" opacity="0.65">
      <path d="M322,398 Q500,340 678,398"/>
      <path d="M368,470 L446,782"/><path d="M632,470 L554,782"/>
    </g>
    <circle cx="500" cy="424" r="34" fill="none" stroke="${c.pal.accent}" stroke-width="16"/>`,

  /* Retractable lead — grip body with the tape running out. */
  retractable: (c) => `
    <path d="M360,336 C470,300 612,320 656,404 C704,494 676,610 592,652 C520,688 416,672 372,600 C330,530 322,392 360,336 Z" fill="${c.pal.base}"/>
    <path d="M394,372 C480,344 592,362 626,428 C662,498 640,586 576,618 Z" fill="#ffffff" opacity="0.14"/>
    <path d="M404,610 L470,824 L364,824 L332,652 Z" fill="${c.pal.dark}"/>
    <circle cx="512" cy="480" r="86" fill="${c.pal.dark}"/>
    <circle cx="512" cy="480" r="52" fill="${c.pal.light}"/>
    <rect x="556" y="642" width="200" height="22" rx="11" fill="${c.pal.paper}" transform="rotate(14 556 642)"/>
    <rect x="430" y="700" width="126" height="46" rx="23" fill="${c.pal.accent}"/>`,

  /* Natural chew. */
  bone: (c) => `
    ${motifGroup("bone", c.pal.base, 2.1, 500, 590)}
    <g fill="${c.pal.dark}" opacity="0.35">
      <ellipse cx="420" cy="566" rx="26" ry="14" transform="rotate(-12 420 566)"/>
      <ellipse cx="548" cy="612" rx="30" ry="15" transform="rotate(8 548 612)"/>
      <ellipse cx="620" cy="548" rx="20" ry="11" transform="rotate(-20 620 548)"/>
    </g>
    <path d="M330,700 Q500,760 670,700" fill="none" stroke="#000" stroke-width="8" opacity="0.05"/>`,

  /* Supplement jar. */
  jar: (c) => `
    <rect x="378" y="336" width="244" height="78" rx="16" fill="${c.pal.dark}"/>
    <g fill="#000" opacity="0.18">
      <rect x="396" y="346" width="8" height="58"/><rect x="432" y="346" width="8" height="58"/>
      <rect x="468" y="346" width="8" height="58"/><rect x="504" y="346" width="8" height="58"/>
      <rect x="540" y="346" width="8" height="58"/><rect x="576" y="346" width="8" height="58"/>
    </g>
    <path d="M362,410 L638,410 L650,806 C650,824 580,836 500,836 C420,836 350,824 350,806 Z" fill="${c.pal.base}"/>
    <path d="M388,416 L388,822 C404,828 420,830 436,832 L426,418 Z" fill="#ffffff" opacity="0.18"/>
    <rect x="368" y="500" width="264" height="216" rx="12" fill="${c.pal.paper}"/>
    ${motifGroup(c.motif, c.pal.base, 0.52, 500, 640)}
    ${label(c.brand, 500, 552, 36, c.pal.ink, 800, 0.5, 236)}`,

  /* Shampoo / conditioner bottle. */
  bottle: (c) => `
    <rect x="452" y="238" width="96" height="66" rx="14" fill="${c.pal.dark}"/>
    <rect x="466" y="212" width="68" height="40" rx="12" fill="${c.pal.dark}"/>
    <path d="M430,300 L570,300 C594,300 610,336 616,382 L628,780 C630,812 574,830 500,830 C426,830 370,812 372,780 L384,382 C390,336 406,300 430,300 Z" fill="${c.pal.base}"/>
    <path d="M414,328 C402,364 398,400 396,436 L386,798 C398,808 414,814 430,818 L438,320 Z" fill="#ffffff" opacity="0.2"/>
    <rect x="386" y="470" width="228" height="248" rx="14" fill="${c.pal.paper}"/>
    ${motifGroup(c.motif, c.pal.base, 0.5, 500, 632)}
    ${label(c.brand, 500, 528, 34, c.pal.ink, 800, 0.5, 200)}
    ${label(c.size, 500, 760, 28, "#ffffff", 700, 1, 190)}`,

  /* Trigger spray. */
  spray: (c) => `
    <path d="M556,246 L664,246 C684,246 692,262 686,278 L648,344 L556,344 Z" fill="${c.pal.dark}"/>
    <path d="M556,300 L512,300 L512,354 L556,354 Z" fill="${c.pal.dark}"/>
    <rect x="470" y="246" width="96" height="120" rx="16" fill="${c.pal.dark}"/>
    <path d="M414,364 L586,364 C608,364 620,392 624,430 L636,782 C638,812 578,830 500,830 C422,830 362,812 364,782 L376,430 C380,392 392,364 414,364 Z" fill="${c.pal.base}"/>
    <path d="M404,394 C394,424 390,452 388,482 L380,798 C392,808 406,814 422,818 L430,388 Z" fill="#ffffff" opacity="0.2"/>
    <rect x="388" y="500" width="224" height="216" rx="14" fill="${c.pal.paper}"/>
    ${motifGroup(c.motif, c.pal.base, 0.46, 500, 644)}
    ${label(c.brand, 500, 556, 32, c.pal.ink, 800, 0.5, 196)}`,

  /* Grooming comb. */
  comb: (c) => `
    <rect x="286" y="386" width="428" height="128" rx="26" fill="${c.pal.base}"/>
    <rect x="312" y="410" width="376" height="34" rx="17" fill="#ffffff" opacity="0.2"/>
    <rect x="286" y="500" width="428" height="42" rx="12" fill="${c.pal.dark}"/>
    <g fill="${c.pal.accent}">
      ${Array.from({ length: 17 }, (_, i) => `<rect x="${306 + i * 23}" y="538" width="9" height="${180 + ((i * 7) % 5) * 6}" rx="4.5"/>`).join("")}
    </g>
    <g fill="${c.pal.accent}">
      ${Array.from({ length: 17 }, (_, i) => `<circle cx="${310.5 + i * 23}" cy="${722 + ((i * 7) % 5) * 6}" r="7"/>`).join("")}
    </g>`,

  /* Litter tray with a high rim. */
  litterbox: (c) => `
    <path d="M250,486 L750,486 L706,796 C704,812 692,820 676,820 L324,820 C308,820 296,812 294,796 Z" fill="${c.pal.base}"/>
    <path d="M250,486 L750,486 L742,542 L258,542 Z" fill="${c.pal.dark}"/>
    <path d="M294,560 L706,560 L672,780 L328,780 Z" fill="${c.pal.light}" opacity="0.55"/>
    <path d="M262,486 Q500,436 738,486 L750,486 L742,542 L258,542 Z" fill="${c.pal.dark}"/>
    <g fill="${c.pal.paper}" opacity="0.9">
      <rect x="600" y="360" width="26" height="200" rx="13" transform="rotate(16 600 360)"/>
      <path d="M636,540 L738,568 L716,646 L622,610 Z"/>
    </g>
    <g fill="${c.pal.dark}" opacity="0.28">
      ${Array.from({ length: 24 }, (_, i) => `<circle cx="${340 + ((i * 131) % 330)}" cy="${620 + ((i * 197) % 140)}" r="${5 + (i % 3)}"/>`).join("")}
    </g>`,

  /* Scratching post with a sisal column. */
  post: (c) => `
    <rect x="300" y="790" width="400" height="56" rx="14" fill="${c.pal.dark}"/>
    <rect x="428" y="366" width="144" height="430" fill="${c.pal.base}"/>
    <g stroke="${c.pal.dark}" stroke-width="7" opacity="0.5">
      ${Array.from({ length: 21 }, (_, i) => `<path d="M428,${378 + i * 20} L572,${370 + i * 20}"/>`).join("")}
    </g>
    <rect x="336" y="306" width="328" height="66" rx="18" fill="${c.pal.light}"/>
    <rect x="336" y="306" width="328" height="22" rx="11" fill="#ffffff" opacity="0.5"/>
    <path d="M660,330 L680,470" stroke="${c.pal.accent}" stroke-width="6" fill="none"/>
    <circle cx="684" cy="502" r="38" fill="${c.pal.accent}"/>
    <circle cx="672" cy="490" r="12" fill="#ffffff" opacity="0.4"/>`,

  /* Stainless / ceramic bowl. */
  bowl: (c) => `
    <path d="M254,540 C254,540 300,790 316,808 C332,828 400,842 500,842 C600,842 668,828 684,808 C700,790 746,540 746,540 Z" fill="${c.pal.base}"/>
    <path d="M300,560 C300,560 336,772 346,786 C356,800 420,810 500,810 Z" fill="#ffffff" opacity="0.18"/>
    <ellipse cx="500" cy="540" rx="246" ry="76" fill="${c.pal.dark}"/>
    <ellipse cx="500" cy="544" rx="214" ry="62" fill="${c.pal.light}"/>
    <ellipse cx="500" cy="548" rx="176" ry="48" fill="${c.pal.dark}" opacity="0.35"/>
    ${motifGroup(c.motif, c.pal.paper, 0.32, 500, 552, 0.85)}`,

  /* Solid rubber toy. */
  ball: (c) => `
    <circle cx="500" cy="570" r="216" fill="${c.pal.base}"/>
    <path d="M500,354 C620,414 640,690 520,784 C420,784 306,700 300,556 C332,430 420,356 500,354 Z" fill="#ffffff" opacity="0.10"/>
    <circle cx="500" cy="570" r="216" fill="none" stroke="${c.pal.dark}" stroke-width="10" opacity="0.4"/>
    <path d="M320,470 Q500,552 680,470" fill="none" stroke="${c.pal.dark}" stroke-width="16" opacity="0.5"/>
    <path d="M320,672 Q500,590 680,672" fill="none" stroke="${c.pal.dark}" stroke-width="16" opacity="0.5"/>
    <ellipse cx="426" cy="466" rx="52" ry="34" fill="#ffffff" opacity="0.32" transform="rotate(-26 426 466)"/>
    ${motifGroup(c.motif, c.pal.paper, 0.4, 500, 570, 0.5)}`,

  /* Feather wand for cats. */
  wand: (c) => `
    <rect x="234" y="700" width="330" height="30" rx="15" fill="${c.pal.dark}" transform="rotate(-16 234 700)"/>
    <rect x="248" y="706" width="120" height="16" rx="8" fill="${c.pal.light}" transform="rotate(-16 248 706)" opacity="0.6"/>
    <path d="M556,614 Q640,560 668,464" fill="none" stroke="${c.pal.ink}" stroke-width="5" opacity="0.6"/>
    <g fill="${c.pal.base}">
      <ellipse cx="668" cy="400" rx="30" ry="112" transform="rotate(12 668 400)"/>
      <ellipse cx="608" cy="424" rx="26" ry="96" transform="rotate(-18 608 424)"/>
      <ellipse cx="726" cy="436" rx="26" ry="92" transform="rotate(34 726 436)"/>
    </g>
    <g fill="${c.pal.accent}" opacity="0.8">
      <ellipse cx="668" cy="368" rx="14" ry="58" transform="rotate(12 668 368)"/>
      <ellipse cx="612" cy="398" rx="12" ry="50" transform="rotate(-18 612 398)"/>
    </g>
    <circle cx="668" cy="514" r="22" fill="${c.pal.dark}"/>`,

  /* Plush toy. */
  plush: (c) => `
    <ellipse cx="500" cy="654" rx="176" ry="192" fill="${c.pal.base}"/>
    <circle cx="500" cy="420" r="142" fill="${c.pal.base}"/>
    <ellipse cx="386" cy="318" rx="52" ry="68" transform="rotate(-24 386 318)" fill="${c.pal.dark}"/>
    <ellipse cx="614" cy="318" rx="52" ry="68" transform="rotate(24 614 318)" fill="${c.pal.dark}"/>
    <ellipse cx="500" cy="468" rx="76" ry="56" fill="${c.pal.light}"/>
    <ellipse cx="500" cy="440" rx="26" ry="20" fill="${c.pal.ink}"/>
    <circle cx="456" cy="392" r="14" fill="${c.pal.ink}"/>
    <circle cx="544" cy="392" r="14" fill="${c.pal.ink}"/>
    <ellipse cx="500" cy="700" rx="104" ry="118" fill="${c.pal.light}" opacity="0.65"/>
    <ellipse cx="344" cy="646" rx="52" ry="76" transform="rotate(-16 344 646)" fill="${c.pal.dark}"/>
    <ellipse cx="656" cy="646" rx="52" ry="76" transform="rotate(16 656 646)" fill="${c.pal.dark}"/>`,

  /* Dog coat, laid flat. */
  coat: (c) => `
    <path d="M318,410 C400,344 600,344 682,410 L734,660 C700,760 620,812 500,812 C380,812 300,760 266,660 Z" fill="${c.pal.base}"/>
    <path d="M318,410 C400,344 600,344 682,410 L668,470 C598,414 402,414 332,470 Z" fill="${c.pal.dark}"/>
    <path d="M330,470 C400,420 600,420 670,470 L690,640 L500,690 L310,640 Z" fill="#ffffff" opacity="0.10"/>
    <rect x="452" y="500" width="96" height="30" rx="15" fill="${c.pal.dark}"/>
    <g fill="none" stroke="${c.pal.light}" stroke-width="3" stroke-dasharray="11 9" opacity="0.7">
      <path d="M296,650 C340,748 410,792 500,792 C590,792 660,748 704,650"/>
    </g>
    <rect x="252" y="604" width="200" height="40" rx="20" fill="${c.pal.accent}" transform="rotate(14 252 604)"/>
    <rect x="548" y="640" width="200" height="40" rx="20" fill="${c.pal.accent}" transform="rotate(-14 548 640)"/>`,

  /* Pack of absorbent pads. */
  pads: (c) => `
    <path d="M288,352 L712,352 L712,828 L288,828 Z" fill="${c.pal.base}"/>
    <path d="M288,352 L712,352 L712,432 L288,432 Z" fill="${c.pal.dark}"/>
    <path d="M288,352 L348,352 L348,828 L288,828 Z" fill="#ffffff" opacity="0.12"/>
    <path d="M652,352 L712,352 L712,828 L652,828 Z" fill="#000000" opacity="0.12"/>
    <g>
      <rect x="380" y="500" width="240" height="196" rx="10" fill="${c.pal.paper}"/>
      <g stroke="${c.pal.light}" stroke-width="3" opacity="0.9">
        <path d="M380,548 L620,548"/><path d="M380,598 L620,598"/><path d="M380,648 L620,648"/>
        <path d="M440,500 L440,696"/><path d="M500,500 L500,696"/><path d="M560,500 L560,696"/>
      </g>
      ${motifGroup("drop", c.pal.base, 0.28, 500, 598, 0.55)}
    </g>
    ${label(c.brand, 500, 402, 40, "#ffffff", 800, 1, 380)}
    ${label(c.size, 500, 768, 36, "#ffffff", 700, 1, 380)}`,

  /* Pet bed. */
  bed: (c) => `
    <ellipse cx="500" cy="704" rx="304" ry="134" fill="${c.pal.dark}"/>
    <ellipse cx="500" cy="676" rx="304" ry="132" fill="${c.pal.base}"/>
    <ellipse cx="500" cy="690" rx="212" ry="82" fill="${c.pal.light}"/>
    <ellipse cx="500" cy="684" rx="212" ry="80" fill="${c.pal.paper}" opacity="0.7"/>
    <g fill="none" stroke="${c.pal.dark}" stroke-width="3" opacity="0.3">
      <path d="M340,646 Q500,610 660,646"/><path d="M330,704 Q500,672 670,704"/>
    </g>
    <path d="M236,600 Q280,516 380,506" fill="none" stroke="${c.pal.base}" stroke-width="44" stroke-linecap="round"/>
    <path d="M764,600 Q720,516 620,506" fill="none" stroke="${c.pal.base}" stroke-width="44" stroke-linecap="round"/>
    <path d="M380,506 L620,506" stroke="${c.pal.base}" stroke-width="44" stroke-linecap="round"/>
    ${motifGroup(c.motif, c.pal.base, 0.3, 500, 682, 0.3)}`,

  /* Transport crate. */
  carrier: (c) => `
    <path d="M278,436 L722,436 L700,806 L300,806 Z" fill="${c.pal.base}"/>
    <path d="M278,436 L722,436 L716,500 L284,500 Z" fill="${c.pal.dark}"/>
    <path d="M300,806 L700,806 L696,838 L304,838 Z" fill="${c.pal.dark}"/>
    <rect x="418" y="330" width="164" height="36" rx="18" fill="${c.pal.dark}"/>
    <path d="M418,348 L418,436 M582,348 L582,436" stroke="${c.pal.dark}" stroke-width="20"/>
    <path d="M394,530 L640,530 L622,756 L412,756 Z" fill="${c.pal.dark}"/>
    <g stroke="${c.pal.light}" stroke-width="12" opacity="0.85">
      ${Array.from({ length: 6 }, (_, i) => `<path d="M${420 + i * 38},540 L${416 + i * 36},746"/>`).join("")}
      <path d="M400,610 L634,610"/><path d="M404,682 L628,682"/>
    </g>
    <path d="M278,436 L330,436 L312,806 L300,806 Z" fill="#ffffff" opacity="0.12"/>`,

  /* Bag of clumping litter — heavier, squarer than a food sack. */
  littersand: (c) => `
    <path d="M292,300 L708,300 L708,368 L292,368 Z" fill="${c.pal.dark}"/>
    <path d="M292,360 L708,360 L728,846 L272,846 Z" fill="${c.pal.base}"/>
    <path d="M272,846 L292,360 L346,360 L334,852 Z" fill="#ffffff" opacity="0.12"/>
    <path d="M654,360 L708,360 L728,846 L666,852 Z" fill="#000000" opacity="0.14"/>
    <path d="M272,690 L728,644 L728,742 L272,790 Z" fill="${c.pal.light}"/>
    <circle cx="500" cy="518" r="104" fill="${c.pal.paper}"/>
    ${motifGroup(c.motif, c.pal.base, 0.66, 500, 520)}
    ${label(c.brand, 500, 420, 44, "#ffffff", 800, 1, 380)}
    ${label(c.size, 500, 736, 44, c.pal.ink, 800, 1, 400)}`,

  /* Carton box — treats, dental sticks, accessories. */
  box: (c) => `
    <path d="M300,392 L700,392 L700,820 L300,820 Z" fill="${c.pal.base}"/>
    <path d="M300,392 L700,392 L660,330 L260,330 Z" fill="${c.pal.dark}"/>
    <path d="M300,392 L260,330 L260,762 L300,820 Z" fill="#000000" opacity="0.18"/>
    <rect x="344" y="480" width="312" height="252" rx="14" fill="${c.pal.paper}"/>
    ${motifGroup(c.motif, c.pal.base, 0.56, 500, 632)}
    ${label(c.brand, 500, 542, 40, c.pal.ink, 800, 0.5, 284)}
    ${label(c.size, 500, 786, 34, "#ffffff", 700, 1, 360)}`,
};

export const ARCHETYPE_NAMES = Object.keys(ARCHETYPES);

/** Renders the finished 1000x1000 packshot. */
export function packshot(archetype: string, ctx: Ctx): string {
  const draw = ARCHETYPES[archetype] ?? ARCHETYPES.box;
  const { pal } = ctx;
  const tilt = ctx.alt ? -7 + (ctx.seed % 5) : 0;
  const zoom = ctx.alt ? 0.9 : 1;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">
  <defs>
    <radialGradient id="ground" cx="50%" cy="34%" r="78%">
      <stop offset="0" stop-color="${ctx.alt ? pal.paper : "#ffffff"}"/>
      <stop offset="1" stop-color="${ctx.alt ? pal.light : "#ece7dd"}"/>
    </radialGradient>
    <filter id="soften" x="-40%" y="-60%" width="180%" height="240%">
      <feGaussianBlur stdDeviation="26"/>
    </filter>
  </defs>
  <rect width="1000" height="1000" fill="url(#ground)"/>
  <circle cx="500" cy="470" r="336" fill="#ffffff" opacity="${ctx.alt ? 0.28 : 0.55}"/>
  ${motifGroup(ctx.motif, pal.base, 1.9, 500, 470, ctx.alt ? 0.07 : 0.045)}
  <ellipse cx="500" cy="880" rx="268" ry="46" fill="${pal.ink}" opacity="0.2" filter="url(#soften)"/>
  <g transform="translate(500,540) rotate(${tilt}) scale(${zoom}) translate(-500,-540)">
    ${draw(ctx)}
  </g>
</svg>`;
}

export type { Ctx };

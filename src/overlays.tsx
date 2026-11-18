import React from "react";
import { AbsoluteFill } from "remotion";
import type { Timeline } from "./timeline";
import {
  Chip, Counter, DOWN, GrowPanel, INK, MUTED, PAPER, Panel, RIGHT, SAND, Sand, Txt, U, UP,
  boxStyle, fadeIn, hundreds, prog,
} from "./ui";

type P = { t: number; tl: Timeline };

/** Shows its graphics from `from` until `to`, fading them out so they are gone by the cut at `to`. */
const Section: React.FC<{ t: number; from: number; to: number; out?: number; children: React.ReactNode }> = ({
  t, from, to, out = 0.25, children,
}) =>
  t < from || t >= to ? null : (
    <AbsoluteFill style={{ opacity: 1 - prog(t, to - out, out) }}>{children}</AbsoluteFill>
  );

// 0.0-5.5: the hook, counting from the first frame
const Hook: React.FC<P> = ({ t, tl }) => {
  const nobody = tl.at("nobody");
  return (
    <Section t={t} from={0} to={tl.cut.title} out={0.2}>
      <GrowPanel t={t} pad={48} gap={18} steps={[[0, 2], [nobody, 3]]} style={{ left: 48, bottom: 48 }}>
        <Txt size={44} color={MUTED}>For more than</Txt>
        <Counter
          size={140}
          final="3,700"
          suffix=" years"
          value={hundreds(100 + 3600 * prog(t, 0, tl.at("years")))} // starts at 100, never "0 years"
        />
        <Txt size={60} bold style={fadeIn(t, nobody, 0.25, ...UP(0.15))}>nobody built anything taller</Txt>
      </GrowPanel>
    </Section>
  );
};

// 5.5-9.4: the name, then a marker on Khufu's pyramid (the right one in this clip, which holds still)
const Title: React.FC<P> = ({ t, tl }) => {
  const great = tl.at("great");
  const khufu = tl.at("hufu"); // Whisper heard "Hufu"
  return (
    <Section t={t} from={tl.cut.title} to={tl.cut.film}>
      <Panel pad={48} style={{ left: 72, top: 72, display: "flex", flexDirection: "column", gap: 14, ...fadeIn(t, great, 0.25, ...UP(0.15)) }}>
        <Txt size={84} bold>The Great Pyramid</Txt>
        <Txt size={84} bold>of Giza</Txt>
      </Panel>
      <svg width={34} height={29} style={{ position: "absolute", left: 1547 - 17, top: 313 - 14.5, ...fadeIn(t, khufu, 0.25, ...DOWN(0.2)) }}>
        <polygon points="0,0 34,0 17,29" fill={SAND} />
      </svg>
      <Panel
        pad={24}
        style={{ right: 48, bottom: 1080 - 284, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, ...fadeIn(t, khufu, 0.25, ...UP(0.1)) }}
      >
        <Txt size={34} color={MUTED}>Tomb of</Txt>
        <Txt size={44} bold>Pharaoh Khufu</Txt>
      </Panel>
    </Section>
  );
};

// 9.4-13.0: the 1897 film, and a timeline from Khufu to today
const Film: React.FC<P> = ({ t, tl }) => {
  const finished = tl.at("finished");
  const four = tl.at("4");
  const years = tl.at("years", 2);
  const grow = prog(t, four, years - four);
  const show = fadeIn(t, finished);
  const track = 1104; // x 408 to 1512, as in overlay.py
  return (
    <Section t={t} from={tl.cut.film} to={tl.cut.blocks}>
      <Panel pad={17} style={{ left: 290, top: 50 }}>
        <Txt size={26} color={MUTED}>Giza, filmed in 1897 by Alexandre Promio</Txt>
      </Panel>
      <div style={{ ...boxStyle(), position: "absolute", left: 408 - 42, bottom: 30, padding: 42, width: track, boxSizing: "content-box", opacity: show.opacity }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 34 }}>
          <Txt size={34} color={MUTED}>More than</Txt>
          <Counter size={72} final="4,500" suffix=" years ago" align="center" visible={t >= four} value={hundreds(100 + 4400 * grow)} />
        </div>
        <div style={{ position: "relative", height: 12 }}>
          <div style={{ position: "absolute", top: 3, left: 0, right: 0, height: 6, backgroundColor: MUTED }} />
          <div style={{ position: "absolute", top: 0, left: 0, width: track * grow, height: 12, backgroundColor: SAND }} />
          {[0, track].map((x) => (
            <div key={x} style={{ position: "absolute", left: x - 2, top: -13, width: 4, height: 38, backgroundColor: PAPER }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 30 }}>
          <Txt size={34}>c. 2600 BC</Txt>
          <Txt size={34}>Today</Txt>
        </div>
      </div>
    </Section>
  );
};

// 13.0-19.9: the blocks, then their weight
const Blocks: React.FC<P> = ({ t, tl }) => {
  const [workers, two, stone, about] = [tl.at("workers"), tl.at("2"), tl.at("stone"), tl.at("about")];
  const counting = two + 0.2;
  const m = 0.1 + 2.2 * prog(t, counting, tl.end("million") - counting);
  return (
    <Section t={t} from={tl.cut.blocks} to={tl.cut.height}>
      <GrowPanel t={t} pad={48} gap={17} appear={workers} steps={[[workers, 1], [two, 2, 0.2], [stone, 3], [about, 4]]} style={{ left: 24, top: 24 }}>
        <Txt size={44} color={MUTED} style={fadeIn(t, workers, 0.25, ...UP(0.1))}>An estimated</Txt>
        <Counter size={130} final="2.3" suffix=" million" visible={t >= counting} value={m.toFixed(1)} />
        <Txt size={64} bold style={fadeIn(t, stone, 0.25, ...UP(0.1))}>stone blocks</Txt>
        <Txt size={50} style={fadeIn(t, about, 0.25, ...UP(0.1))}>About <Sand>6 million tonnes</Sand> in all</Txt>
      </GrowPanel>
    </Section>
  );
};

// The pyramid drawn to scale (146.6 m high on a 230.3 m base), on the right of the frame, as in overlay.py.
const K = (3.8 * U) / 146.6;
const BASE = { x: 960 + 4.3 * U, y: 540 + 3.3 * U };
const A = { x: BASE.x - (230.3 * K) / 2, y: BASE.y };
const C = { x: BASE.x + (230.3 * K) / 2, y: BASE.y };
const APEX = { x: BASE.x, y: BASE.y - 146.6 * K };
const pts = (...p: { x: number; y: number }[]) => p.map((q) => `${q.x},${q.y}`).join(" ");
const HEIGHT_BOX = { left: A.x - 42, top: 180 - 42, width: C.x - A.x + 84, height: BASE.y - 180 + 84 };

// 19.9-24.6: the height when new
const Height: React.FC<P> = ({ t, tl }) => {
  const [when, stood] = [tl.at("when"), tl.at("stood")];
  const rise = prog(t, stood, tl.end("6", 2) - stood);
  const draw = prog(t, when, 0.8);
  const perimeter = 2 * Math.hypot(C.x - APEX.x, APEX.y - C.y) + (C.x - A.x);
  return (
    <Section t={t} from={tl.cut.height} to={tl.cut.casing}>
      <div style={{ ...boxStyle(), position: "absolute", ...HEIGHT_BOX, opacity: draw }} />
      <AbsoluteFill style={{ opacity: draw }}>
        <div style={{ position: "absolute", left: A.x, top: 180, display: "flex", flexDirection: "column", gap: 12 }}>
          <Txt size={34} color={MUTED}>Height when new</Txt>
          <Counter size={80} final="146.6" suffix=" m" visible={t >= stood} value={(146.6 * rise).toFixed(1)} />
        </div>
      </AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <polygon points={pts(A, C, APEX)} fill="none" stroke={SAND} strokeWidth={6} strokeLinejoin="round" strokeDasharray={perimeter} strokeDashoffset={perimeter * (1 - draw)} />
        {t >= stood && <line x1={BASE.x} y1={BASE.y} x2={BASE.x} y2={BASE.y - (BASE.y - APEX.y) * rise} stroke={PAPER} strokeWidth={4} />}
      </svg>
    </Section>
  );
};

// 24.6-29.7: the casing, shown where it survives, near the top of Khafre's pyramid
const Casing: React.FC<P> = ({ t, tl }) => {
  const [over, smoothW, casing, stripped] = [tl.at("over"), tl.at("smooth"), tl.at("casing"), tl.at("stripped")];
  const spot = { x: 1050, y: 430 }; // on the casing, right face, in both the first and last frame of the push
  const tip = { x: 1090, y: 250 };
  const lead = prog(t, casing, 0.35);
  return (
    <Section t={t} from={tl.cut.casing} to={tl.cut.today}>
      <GrowPanel t={t} pad={48} gap={14} appear={over} steps={[[over, 1], [smoothW, 2], [stripped, 3]]} style={{ left: 24, bottom: 24 }}>
        <Txt size={40} color={MUTED} style={fadeIn(t, over, 0.25, ...UP(0.1))}>Over the centuries,</Txt>
        <Txt size={52} bold style={fadeIn(t, smoothW, 0.25, ...UP(0.1))}>most of its smooth white limestone casing</Txt>
        <Txt size={52} bold color={SAND} style={fadeIn(t, stripped, 0.25, ...UP(0.1))}>was stripped away</Txt>
      </GrowPanel>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <line x1={spot.x} y1={spot.y} x2={spot.x + (tip.x - spot.x) * lead} y2={spot.y + (tip.y - spot.y) * lead} stroke={SAND} strokeWidth={4} opacity={lead > 0 ? 1 : 0} />
        <circle cx={spot.x} cy={spot.y} r={11} fill={SAND} style={{ ...fadeIn(t, casing, 0.35, 0, 0, 0.5), transformOrigin: `${spot.x}px ${spot.y}px` }} />
      </svg>
      <Panel pad={26} style={{ left: tip.x, top: tip.y, translate: "0 -50%", display: "flex", flexDirection: "column", gap: 10, opacity: fadeIn(t, casing, 0.35).opacity }}>
        <Txt size={36} bold>Casing still in place</Txt>
        <Txt size={32} color={MUTED}>on Khafre&apos;s pyramid, next door</Txt>
      </Panel>
    </Section>
  );
};

// 29.7-34.0: today's height against the original, at the same scale and in the same place
const Today: React.FC<P> = ({ t, tl }) => {
  const [today, n138, tall] = [tl.at("today"), tl.at("138"), tl.at("tall")];
  const f = 138.5 / 146.6;
  const L = { x: A.x + (APEX.x - A.x) * f, y: A.y + (APEX.y - A.y) * f };
  const R = { x: C.x + (APEX.x - C.x) * f, y: C.y + (APEX.y - C.y) * f };
  const g = 146.6 - 8.1 * prog(t, n138, tl.end("5") - n138);
  const swap = prog(t, tall);
  const open = prog(t, tl.cut.today);
  return (
    <Section t={t} from={tl.cut.today} to={tl.cut.aswan}>
      <div style={{ ...boxStyle(), position: "absolute", ...HEIGHT_BOX, opacity: open }} />
      <div style={{ position: "absolute", left: A.x, top: 180, display: "flex", flexDirection: "column", gap: 12, opacity: open }}>
        <Txt size={34} color={MUTED}>Height today</Txt>
        <Counter size={80} final="146.6" suffix=" m" visible={t >= n138} value={g.toFixed(1)} />
        <div style={{ position: "relative" }}>
          <Txt size={32} color={MUTED} style={{ opacity: 1 - swap }}>146.6 m when new</Txt>
          <Txt size={32} color={MUTED} style={{ position: "absolute", top: 0, opacity: swap }}>8.1 m lower than when new</Txt>
        </div>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <polygon points={pts(A, C, APEX)} fill="none" stroke={MUTED} strokeWidth={4} strokeDasharray="14 10" opacity={open} />
        <polygon points={pts(A, C, R, L)} fill={SAND} fillOpacity={0.3} stroke={SAND} strokeWidth={6} strokeLinejoin="round" opacity={prog(t, today, 0.4)} />
      </svg>
    </Section>
  );
};

// 34.0-39.5: the granite's trip north from Aswan
const Aswan: React.FC<P> = ({ t, tl }) => {
  const [granite, aswan, more] = [tl.at("granite"), tl.at("aswan"), tl.at("more", 3)];
  const trip = prog(t, more, tl.at("south") - more);
  const gz = { x: 1596, y: 240 };
  const asw = { x: 1596, y: 840 };
  const route = fadeIn(t, aswan);
  const stoneY = asw.y + (gz.y - asw.y) * trip;
  return (
    <Section t={t} from={tl.cut.aswan} to={tl.cut.wonders}>
      <GrowPanel t={t} pad={48} gap={14} appear={granite} steps={[[granite, 1], [aswan, 3]]} style={{ left: 24, bottom: 24 }}>
        <Txt size={60} bold style={fadeIn(t, granite, 0.25, ...UP(0.1))}>Granite blocks</Txt>
        <Txt size={60} bold color={SAND} style={fadeIn(t, aswan, 0.25, ...UP(0.1))}>from Aswan</Txt>
        <Txt size={28} color={MUTED} style={{ opacity: route.opacity }}>Pictured: the granite quarries at Aswan</Txt>
      </GrowPanel>
      <AbsoluteFill style={{ opacity: route.opacity }}>
        <div style={{ ...boxStyle(), position: "absolute", left: 1140, top: 174, width: 744, height: 732 }} />
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <line x1={asw.x} y1={asw.y} x2={asw.x} y2={stoneY} stroke={SAND} strokeWidth={6} />
          <circle cx={gz.x} cy={gz.y} r={14} fill={PAPER} />
          <circle cx={asw.x} cy={asw.y} r={14} fill={SAND} />
          {t >= more && <rect x={asw.x - 18} y={stoneY - 18} width={36} height={36} fill={SAND} />}
        </svg>
        <Txt size={44} bold style={{ position: "absolute", left: gz.x + 30, top: gz.y, translate: "0 -50%" }}>Giza</Txt>
        <Txt size={44} bold style={{ position: "absolute", left: asw.x + 30, top: asw.y, translate: "0 -50%" }}>Aswan</Txt>
        <Counter size={60} final="900" suffix="+ km" align="right" visible={t >= more} value={String(Math.round((900 * trip) / 10) * 10)} style={{ position: "absolute", right: 1920 - (asw.x - 48), top: 540, translate: "0 -50%" }} />
      </AbsoluteFill>
    </Section>
  );
};

const WONDERS = [
  "Great Pyramid of Giza", "Hanging Gardens of Babylon", "Temple of Artemis at Ephesus", "Statue of Zeus at Olympia",
  "Mausoleum at Halicarnassus", "Colossus of Rhodes", "Lighthouse of Alexandria",
];

// 39.5-45.7: the Seven Wonders; the others fade as the narrator says "the only one"
const Wonders: React.FC<P> = ({ t, tl }) => {
  const start = tl.cut.wonders;
  const [oldest, only, intact] = [tl.at("oldest"), tl.at("only"), tl.at("intact")];
  const open = prog(t, start, 0.4);
  const gold = prog(t, oldest);
  const dim = 1 - 0.65 * prog(t, only, 0.4);
  return (
    <Section t={t} from={start} to={tl.cut.endcard}>
      <Panel pad={48} style={{ left: 84 - 48, top: "50%", translate: `0 calc(-50% - ${0.35 * U}px)`, opacity: open }}>
        <Txt size={38} color={MUTED} style={{ marginBottom: 36 }}>Seven Wonders of the Ancient World</Txt>
        {WONDERS.map((w, i) => {
          // LaggedStart(lag_ratio=0.08) over 0.4 s: each row takes 0.27 s, starting 0.022 s after the last
          const row = fadeIn(t, start + i * 0.0216, 0.27, ...RIGHT(0.2));
          return (
            <div key={w} style={{ display: "flex", alignItems: "center", gap: 0.3 * U, height: 0.7 * U, ...row, opacity: row.opacity * (i === 0 ? 1 : dim) }}>
              <Txt size={46} bold={i === 0} color={i === 0 ? mix(PAPER, SAND, gold) : PAPER}>{w}</Txt>
              {i === 0 && (
                <div style={{ display: "flex", gap: 0.15 * U }}>
                  <Chip style={fadeIn(t, oldest, 0.25, 0, 0, 0.8)}>Oldest</Chip>
                  <Chip style={fadeIn(t, intact, 0.25, 0, 0, 0.8)}>Largely intact</Chip>
                </div>
              )}
            </div>
          );
        })}
      </Panel>
      <Panel pad={17} style={{ right: 36, bottom: 36, opacity: open }}>
        <Txt size={24} color={MUTED}>The Pyramids of Egypt as imagined in 1572, by Philip Galle after Maerten van Heemskerck</Txt>
      </Panel>
    </Section>
  );
};

const mix = (a: string, b: string, p: number) => {
  const c = (h: string, i: number) => parseInt(h.slice(1 + 2 * i, 3 + 2 * i), 16);
  return `rgb(${[0, 1, 2].map((i) => Math.round(c(a, i) + (c(b, i) - c(a, i)) * p)).join(",")})`;
};

const STATS: [string, string][] = [["3,700+", "years as the world's tallest"], ["2.3 million", "stone blocks"], ["4,500+", "years old"]];

// 45.7-50.1: the three numbers again, and the question
const EndCard: React.FC<P> = ({ t, tl }) => {
  const start = tl.cut.endcard;
  return (
    <Section t={t} from={start} to={tl.cut.credits} out={0.3}>
      {/* overlay.py scales both panels to fit 14.4 and 14.8 units (1728 and 1776 px); at full size they run ~1990 and 1880 px */}
      <Panel pad={54} style={{ left: "50%", top: 360, translate: "-50% -50%", scale: "0.87", display: "flex", gap: 1.1 * U, alignItems: "flex-end", opacity: prog(t, start, 0.6) }}>
        {STATS.map(([big, small], i) => (
          // LaggedStart(lag_ratio=0.25) over 0.6 s: each column takes 0.4 s, 0.1 s after the last
          <div key={big} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, ...fadeIn(t, start + i * 0.1, 0.4, ...UP(0.2)) }}>
            <Txt size={84} bold color={SAND}>{big}</Txt>
            <Txt size={36} color={MUTED}>{small}</Txt>
          </div>
        ))}
      </Panel>
      <Panel pad={42} style={{ left: "50%", top: 840, translate: "-50% -50%", scale: "0.945", ...withShift(fadeIn(t, start, 0.6, ...UP(0.15))) }}>
        <Txt size={60} bold>Which ancient wonder should we visit next?</Txt>
      </Panel>
    </Section>
  );
};

// The panel already uses `translate` to centre itself, so its shift goes into `transform` instead.
const withShift = (s: ReturnType<typeof fadeIn>) => ({ opacity: s.opacity, transform: `translate(${s.translate.replace(" ", ", ")})` });

// The credits for every file the video uses
const Credits: React.FC<P & { lines: string[] }> = ({ t, tl, lines }) => (
  <Section t={t} from={tl.cut.credits} to={tl.total + 1}>
    <AbsoluteFill style={{ backgroundColor: INK, justifyContent: "center", alignItems: "center", opacity: prog(t, tl.cut.credits, 0.3) }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <Txt size={40} bold style={{ marginBottom: 23 }}>Footage, pictures and sound</Txt>
        {[...lines, "Voiceover: Gemini TTS (voice Charon)  ·  Facts: Wikipedia and Smarthistory"].map((l) => (
          <Txt key={l} size={25} color={MUTED} style={{ whiteSpace: "pre" }}>{l}</Txt>
        ))}
      </div>
    </AbsoluteFill>
  </Section>
);

export const Overlays: React.FC<P & { lines: string[] }> = (p) => (
  <>
    <Hook {...p} />
    <Title {...p} />
    <Film {...p} />
    <Blocks {...p} />
    <Height {...p} />
    <Casing {...p} />
    <Today {...p} />
    <Aswan {...p} />
    <Wonders {...p} />
    <EndCard {...p} />
    <Credits {...p} />
  </>
);

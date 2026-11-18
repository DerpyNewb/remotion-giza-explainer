import React, { useLayoutEffect, useRef, useState } from "react";
import { INK, MUTED, PAPER, SAND } from "./timeline";

// Positions follow overlay.py, where 1 Manim unit = 120 px and its font sizes run 1.5x smaller than CSS px.
export const U = 120;
export const fs = (manimSize: number) => manimSize * 1.5;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
// Manim's `smooth`, the rate function of every animation in overlay.py.
const sig = (x: number) => 1 / (1 + Math.exp(-x));
export const smooth = (x: number) => clamp01((sig(10 * (clamp01(x) - 0.5)) - sig(-5)) / (sig(5) - sig(-5)));

/** 0 before `start`, 1 after `start + dur`, eased between. Times in seconds. */
export const prog = (t: number, start: number, dur = 0.25) =>
  dur <= 0 ? (t >= start ? 1 : 0) : smooth((t - start) / dur);

/** Manim's FadeIn(shift=...): moves by (dx, dy) px into place while fading in. */
export const fadeIn = (t: number, start: number, dur = 0.25, dx = 0, dy = 0, scaleFrom = 1) => {
  const p = prog(t, start, dur);
  return {
    opacity: p,
    translate: `${(1 - p) * -dx}px ${(1 - p) * -dy}px`,
    scale: String(scaleFrom + (1 - scaleFrom) * p),
  };
};
export const UP = (units: number) => [0, -units * U] as const; // screen y runs down
export const DOWN = (units: number) => [0, units * U] as const;
export const RIGHT = (units: number) => [units * U, 0] as const;

export const font: React.CSSProperties = {
  fontFamily: "Bahnschrift, 'DIN Alternate', Arial, sans-serif", // DIN figures keep the counters steady
  lineHeight: 1,
  whiteSpace: "nowrap",
};

export const Txt: React.FC<{
  size: number;
  color?: string;
  bold?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ size, color = PAPER, bold = false, style, children }) => (
  <div
    style={{
      ...font,
      fontSize: fs(size),
      color,
      fontWeight: bold ? 700 : 400,
      width: "fit-content",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Sand: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: SAND }}>{children}</span>
);

/** A dark rounded box, so text reads over bright stone and sky. */
export const boxStyle = (opacity = 0.84): React.CSSProperties => ({
  backgroundColor: `rgba(23, 20, 15, ${opacity})`, // INK
  borderRadius: 10,
});

/**
 * A stack of lines on a box that grows to fit the lines shown so far, pinned top-left like overlay.py's fit().
 * steps: [time, n] means from `time` the box eases over `dur` to fit the first n lines. The lines handle their
 * own fade-ins; every line keeps its final place from the start, so nothing shifts as the box grows.
 */
export const GrowPanel: React.FC<{
  t: number;
  steps: [number, number, number?][];
  pad: number;
  gap: number;
  appear?: number; // when the box fades in; omit to show it from the first step without a fade
  style: React.CSSProperties;
  children: React.ReactNode;
}> = ({ t, steps, pad, gap, appear, style, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [sizes, setSizes] = useState<{ w: number; h: number }[]>([]);
  useLayoutEffect(() => {
    // offsetWidth and offsetTop ignore the Studio's preview scaling, unlike getBoundingClientRect.
    const rows = Array.from(ref.current!.children) as HTMLElement[];
    setSizes(
      rows.map((_, n) => ({
        w: Math.max(...rows.slice(0, n + 1).map((r) => r.offsetWidth)),
        h: rows[n].offsetTop + rows[n].offsetHeight - rows[0].offsetTop,
      })),
    );
  }, []);
  let w = 0;
  let h = 0;
  steps.forEach(([time, n, dur = 0.25], i) => {
    const s = sizes[n - 1] ?? { w: 0, h: 0 };
    if (i === 0) {
      w = s.w;
      h = s.h;
    } else {
      const p = prog(t, time, dur);
      w += (s.w - w) * p;
      h += (s.h - h) * p;
    }
  });
  const boxOpacity = appear === undefined ? (t >= steps[0][0] ? 1 : 0) : prog(t, appear);
  return (
    <div style={{ position: "absolute", padding: pad, ...style }}>
      <div
        style={{
          ...boxStyle(),
          position: "absolute",
          left: 0,
          top: 0,
          width: w + 2 * pad,
          height: h + 2 * pad,
          opacity: boxOpacity,
        }}
      />
      <div ref={ref} style={{ position: "relative", display: "flex", flexDirection: "column", gap }}>
        {children}
      </div>
    </div>
  );
};

/** A counter: the number in sand, then the suffix, holding the space its final text needs. */
export const Counter: React.FC<{
  value: string;
  final: string;
  suffix: string;
  size: number;
  align?: "left" | "center" | "right";
  visible?: boolean;
  style?: React.CSSProperties;
}> = ({ value, final, suffix, size, align = "left", visible = true, style }) => (
  <div style={{ position: "relative", width: "fit-content", ...style }}>
    <Txt size={size} bold style={{ visibility: "hidden" }}>
      {final}
      {suffix}
    </Txt>
    <Txt
      size={size}
      bold
      style={{
        position: "absolute",
        top: 0,
        [align === "right" ? "right" : "left"]: align === "center" ? "50%" : 0,
        translate: align === "center" ? "-50% 0" : undefined,
        opacity: visible ? 1 : 0,
      }}
    >
      <Sand>{value}</Sand>
      {suffix}
    </Txt>
  </div>
);

export const hundreds = (v: number) => (Math.round(v / 100) * 100).toLocaleString("en-US");

/** A sand label with dark type, for the one row the narrator singles out. */
export const Chip: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <Txt
    size={32}
    color={INK}
    bold
    style={{ backgroundColor: SAND, borderRadius: 10, padding: "12px 19px", ...style }}
  >
    {children}
  </Txt>
);

/** A panel that hugs its content. */
export const Panel: React.FC<{ pad: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  pad,
  style,
  children,
}) => (
  // max-content: a panel centred with left: 50% would otherwise shrink to the half frame beside it
  <div style={{ ...boxStyle(), position: "absolute", padding: pad, width: "max-content", ...style }}>
    {children}
  </div>
);

export { INK, MUTED, PAPER, SAND };

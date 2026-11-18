import React, { useMemo } from "react";
import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Overlays } from "./overlays";
import { INK, MUSIC, type Shot, type Word, makeTimeline } from "./timeline";

export type GizaProps = { words: Word[]; credits: string[] };

const ZOOM = 0.08; // a push ends 8% closer, as in build.py
const db = (d: number) => 10 ** (d / 20);
// The music sits 10 dB under the voice (adv.py's -26 and -16 LUFS targets, measured -15.3 and -19 here),
// and ducks a further 8 dB while the narrator speaks, like build.py's sidechain compressor.
const MUSIC_GAIN = db(-13.7);
const DUCK = db(-8);
const MUSIC_FADE = 1.5;

const Push: React.FC<{ file: string; setting: number; frames: number }> = ({ file, setting, frames }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ scale: String(interpolate(frame, [0, frames - 1], [1, 1 + ZOOM])) }}>
      {/* object-position y = setting puts the 16:9 window at (ih - oh) * setting, as build.py's crop does */}
      <Img
        src={staticFile(`found/${file}`)}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `50% ${setting * 100}%` }}
      />
    </AbsoluteFill>
  );
};

const ShotView: React.FC<{ shot: Shot; fps: number }> = ({ shot, fps }) => {
  const frames = Math.round(shot.to * fps) - Math.round(shot.from * fps);
  const src = shot.file ? staticFile(`found/${shot.file}`) : "";
  switch (shot.kind) {
    case "clip":
      return <Video src={src} trimBefore={Math.round(shot.setting * fps)} muted objectFit="cover" />;
    case "pillar": // the whole film (1420x1080), centred on ink; objectFit="contain" didn't pillarbox it
      return (
        <AbsoluteFill style={{ backgroundColor: INK, alignItems: "center" }}>
          <Video src={src} trimBefore={Math.round(shot.setting * fps)} muted style={{ width: 1420, height: 1080 }} />
        </AbsoluteFill>
      );
    case "push":
      return <Push file={shot.file!} setting={shot.setting} frames={frames} />;
    case "ink":
      return <AbsoluteFill style={{ backgroundColor: INK }} />;
  }
};

/** The graphics read time in seconds, so they keep overlay.py's timings word for word. */
const Graphics: React.FC<{ tl: ReturnType<typeof makeTimeline>; lines: string[] }> = ({ tl, lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return <Overlays t={frame / fps} tl={tl} lines={lines} />;
};

export const Giza: React.FC<GizaProps> = ({ words, credits }) => {
  const { fps } = useVideoConfig();
  const tl = useMemo(() => makeTimeline(words), [words]);

  // Stretches where the narrator speaks: words closer than 0.6 s (the compressor's release) run together.
  const speech = useMemo(() => {
    const spans: [number, number][] = [];
    for (const w of words) {
      const last = spans[spans.length - 1];
      if (last && w.start - last[1] < 0.6) last[1] = w.end;
      else spans.push([w.start, w.end]);
    }
    return spans;
  }, [words]);
  const musicVolume = (f: number) => {
    const t = f / fps;
    // 1 inside speech, easing back to 0 over 0.6 s after it ends
    const duck = Math.max(0, ...speech.map(([a, b]) => (t < a - 0.015 ? 0 : t <= b ? 1 : 1 - (t - b) / 0.6)));
    const fade = Math.min(1, Math.max(0, (tl.total - t) / MUSIC_FADE));
    return MUSIC_GAIN * (1 - (1 - DUCK) * duck) * fade;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {tl.shots.map((shot) => (
        <Sequence
          key={shot.from}
          name={shot.file ?? "credits"}
          from={Math.round(shot.from * fps)}
          durationInFrames={Math.round(shot.to * fps) - Math.round(shot.from * fps)}
        >
          <ShotView shot={shot} fps={fps} />
        </Sequence>
      ))}
      <Graphics tl={tl} lines={credits} />
      <Audio src={staticFile("vo/vo.wav")} />
      <Audio src={staticFile(`found/${MUSIC}`)} volume={musicVolume} />
      {tl.sfx.map((s) => (
        <Sequence key={`${s.file}-${s.t}`} from={Math.round(s.t * fps)} layout="none" name={s.file}>
          <Audio src={staticFile(`found/${s.file}`)} volume={db(s.db)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

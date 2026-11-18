// The cut, ported from ads/giza-pyramid-history/timeline.py. Times are seconds on the voiceover, which starts at 0.
// Every cut sits just before the phrase it illustrates, found by the narrator's words in words.json.

export const FPS = 30;
export const INK = "#17140f";
export const PAPER = "#f5efe2";
export const MUTED = "#bdb3a1";
export const SAND = "#e2a54b"; // the one accent: the colour of the limestone in late sun

export type Word = { w: string; start: number; end: number };
export type ShotKind = "clip" | "pillar" | "push" | "ink";
export type Shot = {
  from: number;
  to: number;
  file: string | null;
  kind: ShotKind;
  setting: number;
};

const LEAD = 0.12; // a cut lands this far ahead of the word that opens its phrase
const HOLD = 2.5; // the end card stays this long after the last word
const CREDITS = 3.0; // then the credits run this long

export const MUSIC = "openverse-f4a47abd.mp3"; // "Cinematic Documentary Ambient", UNIVERSFIELD, CC BY 4.0
const POP = "openverse-8b182e58.mp3";
const DING = "openverse-c78d2cd0.mp3";
const WHOOSH = "openverse-b7ae7822.mp3";
// The Manim mix raised the voice 3 dB to -16 LUFS; here it plays as recorded, so every effect sits 3 dB lower
// to keep the same balance. The whole mix is normalised to -14 LUFS after the render.
const SFX_DB: Record<string, number> = { [POP]: -9, [DING]: -19, [WHOOSH]: -17 };

// Whisper splits numbers ("3" ",700", "146" ".6"), so punctuation goes and each part is its own word.
const norm = (w: string) => w.toLowerCase().replace(/[^\w$%]/g, "");
const onFrame = (t: number) => Math.round(t * FPS) / FPS;

export const makeTimeline = (words: Word[]) => {
  const find = (word: string, n: number, key: "start" | "end") => {
    const hits = words.filter((w) => norm(w.w) === norm(word));
    if (hits.length < n) {
      throw new Error(`"${word}" is said ${hits.length} times in words.json, not ${n}`);
    }
    return hits[n - 1][key];
  };
  const at = (word: string, n = 1) => find(word, n, "start");
  const end = (word: string, n = 1) => find(word, n, "end");
  const before = (word: string, n = 1) => onFrame(at(word, n) - LEAD);

  // "its" is said three times: "of its smooth", "Its granite", "It's the oldest".
  const cut = {
    taller: before("nobody"),
    title: before("the"),
    film: before("finished"),
    blocks: before("workers"),
    tonnes: before("about"),
    height: before("when"),
    casing: before("over"),
    today: before("and"),
    aswan: before("its", 2),
    wonders: before("its", 3),
    endcard: before("which"),
    credits: onFrame(words[words.length - 1].end + HOLD),
  };
  const total = cut.credits + CREDITS;

  // [cut, file in found/, how it moves, setting]. clip: in-point in s. pillar: a 4:3 clip, in-point in s, on ink.
  // push: slow zoom in; the setting is where the 16:9 window sits on a taller photo (0 top, 1 bottom).
  const starts: [number, string | null, ShotKind, number][] = [
    [0, "pixabay-223565.mp4", "clip", 0], // sunrise behind the Great Pyramid, time-lapse
    [cut.taller, "commons-108812049.jpg", "push", 0.15], // looking up a corner of the Great Pyramid
    [cut.title, "pixabay-262458.mp4", "clip", 0], // Giza today: Menkaure, Khafre and Khufu on the right
    [cut.film, "commons-63768813.webm", "pillar", 0.5], // the Sphinx and a pyramid, Lumiere film of 1897
    [cut.blocks, "commons-145531332.jpg", "push", 0.55], // the stepped blocks up close
    [cut.tonnes, "commons-108812063.jpg", "push", 0.6], // people at the base, for scale
    [cut.height, "commons-108812050.jpg", "push", 0.2], // the whole face against the sky
    [cut.casing, "commons-38318317.jpg", "push", 0.05], // Khafre's pyramid, casing still near its top
    [cut.today, "commons-282496.jpg", "push", 0.35], // the Great Pyramid as it stands today
    [cut.aswan, "commons-42272907.jpg", "push", 0.45], // the granite quarry at Aswan
    [cut.wonders, "commons-82045019.jpg", "push", 0.3], // Heemskerck's Pyramids of Egypt, 1572
    [cut.endcard, "pixabay-223565.mp4", "clip", 20], // the same sunrise, later
    [cut.credits, null, "ink", 0], // credits
  ];
  const shots: Shot[] = starts.map(([from, file, kind, setting], i) => ({
    from,
    to: i + 1 < starts.length ? starts[i + 1][0] : total,
    file,
    kind,
    setting,
  }));

  // A pop when a label lands, a ding when a counter or measurement lands, a whoosh on big moves.
  const sfx = [
    ...["nobody", "hufu", ["years", 2], "about", "casing", "aswan", "oldest", "intact"].map((w) =>
      Array.isArray(w) ? at(w[0] as string, w[1] as number) : at(w),
    ).map((t) => ({ t, file: POP })),
    ...[end("million"), end("6", 2), end("5")].map((t) => ({ t, file: DING })), // 2.3 million, 146.6, 138.5
    ...[at("3"), at("900"), cut.endcard].map((t) => ({ t, file: WHOOSH })),
  ].map((s) => ({ ...s, db: SFX_DB[s.file] }));

  const usedFiles = [
    ...new Set([...shots.flatMap((s) => (s.file ? [s.file] : [])), MUSIC, POP, DING, WHOOSH]),
  ].sort();

  return { at, end, cut, total, shots, sfx, usedFiles, words };
};

export type Timeline = ReturnType<typeof makeTimeline>;

type Credit = { title: string; author: string; license: string };

// One line per file, as in overlay.py's credits(): titles cut at a word, Pixabay's tag lists replaced.
export const creditLines = (files: string[], records: Credit[]) => {
  const lines: string[] = [];
  files.forEach((name, i) => {
    const r = records[i];
    let title = r.title.length < 48 ? r.title : r.title.slice(0, 45).replace(/ \S*$/, "") + "...";
    if (name.startsWith("pixabay-")) {
      title = `Pixabay video ${name.split("-")[1].split(".")[0]}`;
    }
    const author = r.author.split(" from ")[0]; // Flickr imports read "Name from City, Country"
    const line = `${title}  ·  ${author}  ·  ${r.license}`;
    if (!lines.includes(line)) lines.push(line);
  });
  return lines;
};

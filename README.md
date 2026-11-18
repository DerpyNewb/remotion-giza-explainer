# The Great Pyramid in numbers, built in Remotion

A 53-second narrated history explainer, made with [Remotion](https://www.remotion.dev/) from openly licensed
footage and photos, with no AI video. The same video was first made with Manim and FFmpeg. Both versions are on the
[Programmatic Video Editing](https://derpynewb.github.io/programmatic-video-editing/#giza) page, which also shows the
script marked at every cut.

Every cut and every graphic is timed to the narrator's words. Whisper word timings (`words.json`) drive the edit:
a cut lands 0.12 seconds before the word that opens its phrase, a counter finishes as the narrator says its number,
and a label appears on the word it names. Change the script, record it again, and the cuts and graphics move with
the new timings.

## What's in it

- `src/timeline.ts` turns the word timings into the cut list, the shots and the sound-effect cues.
- `src/overlays.tsx` draws the graphics: counters, panels that grow line by line, the pyramid drawn to scale, the
  route from Aswan to Giza and the Seven Wonders list.
- `src/Giza.tsx` lays out the shots (video clips, slow push-ins on photos, an 1897 film on a dark background), the
  voiceover, the music, which ducks while the narrator speaks, and the sound effects.
- `src/Root.tsx` reads `words.json` and each file's licence record when the composition loads, so the length, the
  cuts and the end credits come from the data.

One cue, from `overlays.tsx`: the "Oldest" label lands as the narrator says "oldest".

```tsx
<Chip style={fadeIn(t, oldest, 0.25, 0, 0, 0.8)}>Oldest</Chip>
```

## Running it

The media isn't in this repo: the Pixabay license doesn't allow redistributing clips on their own. The credits at
the end of the video list every file and its source. Put the files in one folder laid out like this:

```text
words.json            the narrator's word timings from Whisper
vo/vo.wav             the voiceover
found/<file>          each clip, photo and sound effect
found/<file>.json     its licence record: {"title", "author", "license"}
```

Then point `GIZA_MEDIA_DIR` at it, or copy it into `public/`:

```powershell
npm i
$env:GIZA_MEDIA_DIR = "D:/path/to/media"
npm run dev                  # Remotion Studio, the live preview
npx remotion render GizaPyramid out/giza-raw.mp4 --image-format=png --crf=18 --x264-preset=slow
ffmpeg -i out/giza-raw.mp4 -c:v copy -af "loudnorm=I=-14:TP=-2:LRA=11,aresample=48000" -c:a aac -b:a 192k -movflags +faststart out/giza.mp4
```

Remotion doesn't normalise loudness, so the last step sets the mix to -14 LUFS. It measures -15.0 LUFS, as the
Manim version's -14.9 did, because the -2 dB true-peak limit holds it back.

## Notes

- Render from PNG frames. Remotion's default JPEG frames carry compression noise that doubled the file size at
  the same CRF (139 MB instead of 77 MB).
- `<Video objectFit="contain">` from `@remotion/media` didn't pillarbox the 4:3 film, so the film gets a box of its
  own size instead.
- Panels measure their lines with `offsetWidth` and `offsetTop`, which ignore the Studio's preview scaling.

The code was written with Claude Code. It's MIT-licensed. Remotion itself is free for individuals and companies of
up to three people; larger companies need a [company license](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).

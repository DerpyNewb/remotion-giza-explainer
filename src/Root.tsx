import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { Giza, type GizaProps } from "./Giza";
import { FPS, type Word, creditLines, makeTimeline } from "./timeline";

// The video's length, cut points and credits all come from the files: the narrator's word timings and the
// licence record that tools/footage.py saved beside each piece of footage.
const calculateMetadata: CalculateMetadataFunction<GizaProps> = async () => {
  const words: Word[] = await (await fetch(staticFile("words.json"))).json();
  const tl = makeTimeline(words);
  const records = await Promise.all(
    tl.usedFiles.map(async (f) => (await fetch(staticFile(`found/${f}.json`))).json()),
  );
  return {
    durationInFrames: Math.round(tl.total * FPS),
    props: { words, credits: creditLines(tl.usedFiles, records) },
  };
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="GizaPyramid"
    component={Giza}
    durationInFrames={1}
    fps={FPS}
    width={1920}
    height={1080}
    defaultProps={{ words: [], credits: [] }}
    calculateMetadata={calculateMetadata}
  />
);

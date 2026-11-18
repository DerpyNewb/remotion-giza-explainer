/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
// The footage, voiceover and word timings aren't in this repo (see README). Point GIZA_MEDIA_DIR at the folder
// that holds them, or put them in public/.
Config.setPublicDir(process.env.GIZA_MEDIA_DIR || "public");

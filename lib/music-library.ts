import { promises as fs } from "fs";
import path from "path";

export type MusicFile = {
  index: number;
  name: string;
  label: string;
  extension: string;
  absolutePath: string;
};

const ALLOWED_EXT = new Set([".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"]);
const ONLY_TRACK_PATTERN = /dead[\s_-]*blonde/i;

function toLabel(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return base.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

export async function listMusicFiles(): Promise<MusicFile[]> {
  const musicDir = path.join(process.cwd(), "public", "music");
  const entries = await fs.readdir(musicDir, { withFileTypes: true });
  const names = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => ALLOWED_EXT.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));

  const onlyDeadBlonde = names.filter((name) => ONLY_TRACK_PATTERN.test(name));
  const finalNames = onlyDeadBlonde.length > 0 ? onlyDeadBlonde : names;

  return finalNames.map((name, index) => ({
      index,
      name,
      label: toLabel(name),
      extension: path.extname(name).toLowerCase(),
      absolutePath: path.join(musicDir, name),
    }));
}

export function getAudioContentType(ext: string): string {
  switch (ext) {
    case ".mp3":
      return "audio/mpeg";
    case ".wav":
      return "audio/wav";
    case ".ogg":
      return "audio/ogg";
    case ".m4a":
      return "audio/mp4";
    case ".aac":
      return "audio/aac";
    case ".flac":
      return "audio/flac";
    default:
      return "application/octet-stream";
  }
}

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const revalidate = 60;

type Track = {
  id: string;
  label: string;
  src: string;
};

const ALLOWED_EXT = new Set([".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"]);

function toLabel(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return base.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

export async function GET() {
  const musicDir = path.join(process.cwd(), "public", "music");

  try {
    const entries = await fs.readdir(musicDir, { withFileTypes: true });

    const tracks: Track[] = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => ALLOWED_EXT.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }))
      .map((name) => ({
        id: name,
        label: toLabel(name),
        src: encodeURI(`/music/${name}`),
      }));

    return NextResponse.json({ tracks });
  } catch {
    return NextResponse.json({ tracks: [] });
  }
}

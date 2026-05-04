import { NextResponse } from "next/server";
import { listMusicFiles } from "@/lib/music-library";

export const runtime = "nodejs";
export const revalidate = 60;

type Track = {
  id: string;
  label: string;
  src: string;
};

export async function GET() {
  try {
    const files = await listMusicFiles();

    const tracks: Track[] = files.map((file) => ({
      id: String(file.index),
      label: file.label,
      src: `/api/music/stream/${file.index}`,
    }));

    return NextResponse.json({ tracks });
  } catch {
    return NextResponse.json({ tracks: [] });
  }
}

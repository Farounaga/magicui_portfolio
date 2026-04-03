import { NextRequest, NextResponse } from "next/server";
import { listMusicFiles } from "@/lib/music-library";

export const runtime = "nodejs";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const index = Number.parseInt(id, 10);

    if (!Number.isFinite(index) || index < 0) {
      return NextResponse.json({ error: "invalid_track_id" }, { status: 400 });
    }

    const files = await listMusicFiles();
    const track = files[index];

    if (!track) {
      return NextResponse.json({ error: "track_not_found" }, { status: 404 });
    }

    const encodedName = encodeURIComponent(track.name);
    const target = new URL(`/music/${encodedName}`, request.url);
    return NextResponse.redirect(target, 307);
  } catch {
    return NextResponse.json({ error: "stream_failed" }, { status: 500 });
  }
}

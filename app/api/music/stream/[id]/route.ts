import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";
import { getAudioContentType, listMusicFiles } from "@/lib/music-library";

export const runtime = "nodejs";

function parseRange(rangeHeader: string | null, size: number) {
  if (!rangeHeader) {
    return null;
  }

  const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/);
  if (!match) {
    return null;
  }

  const [, rawStart, rawEnd] = match;
  const start = rawStart ? Number.parseInt(rawStart, 10) : 0;
  const end = rawEnd ? Number.parseInt(rawEnd, 10) : size - 1;

  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || start >= size) {
    return null;
  }

  return {
    start,
    end: Math.min(end, size - 1),
  };
}

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

    const fileStat = await stat(track.absolutePath);
    const range = parseRange(request.headers.get("range"), fileStat.size);
    const contentType = getAudioContentType(track.extension);

    if (range) {
      const stream = createReadStream(track.absolutePath, { start: range.start, end: range.end });
      const contentLength = range.end - range.start + 1;

      return new NextResponse(Readable.toWeb(stream) as BodyInit, {
        status: 206,
        headers: {
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Length": String(contentLength),
          "Content-Range": `bytes ${range.start}-${range.end}/${fileStat.size}`,
          "Content-Type": contentType,
        },
      });
    }

    const stream = createReadStream(track.absolutePath);
    return new NextResponse(Readable.toWeb(stream) as BodyInit, {
      headers: {
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(fileStat.size),
        "Content-Type": contentType,
      },
    });
  } catch {
    return NextResponse.json({ error: "stream_failed" }, { status: 500 });
  }
}

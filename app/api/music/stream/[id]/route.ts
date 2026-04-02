import { NextRequest, NextResponse } from "next/server";
import { createReadStream, promises as fs } from "fs";
import { Readable } from "stream";
import { getAudioContentType, listMusicFiles } from "@/lib/music-library";

export const runtime = "nodejs";

function parseRangeHeader(rangeHeader: string | null, size: number): { start: number; end: number } | null {
  if (!rangeHeader || !rangeHeader.startsWith("bytes=")) {
    return null;
  }

  const [rawStart, rawEnd] = rangeHeader.replace("bytes=", "").split("-");
  const start = rawStart ? Number.parseInt(rawStart, 10) : 0;
  const end = rawEnd ? Number.parseInt(rawEnd, 10) : size - 1;

  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || end >= size) {
    return null;
  }

  return { start, end };
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

    const stats = await fs.stat(track.absolutePath);
    const size = stats.size;
    const contentType = getAudioContentType(track.extension);
    const parsedRange = parseRangeHeader(request.headers.get("range"), size);

    if (parsedRange) {
      const { start, end } = parsedRange;
      const chunkSize = end - start + 1;
      const nodeStream = createReadStream(track.absolutePath, { start, end });
      const webStream = Readable.toWeb(nodeStream) as ReadableStream;

      return new NextResponse(webStream, {
        status: 206,
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(chunkSize),
          "Content-Range": `bytes ${start}-${end}/${size}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    const nodeStream = createReadStream(track.absolutePath);
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(size),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "stream_failed" }, { status: 500 });
  }
}

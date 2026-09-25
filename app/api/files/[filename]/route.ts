import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Serves uploaded ticket photos (app/api/upload/route.ts) from disk on every request.
//
// This has to be a Route Handler, not a plain file under public/ — Next.js's standalone
// server (the Dockerfile's `runner` stage, what actually runs in production) only serves
// files from public/ that existed when the server started. A file written later by the
// upload route (including anything landing on a Coolify Persistent Volume) 404s forever,
// even though it's really sitting right there on disk — confirmed by reproducing the exact
// standalone runtime locally: an existing build-time asset served fine, a file written after
// server start did not. Route Handlers don't have that limitation; they run per-request.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;

  // Reject anything but a plain filename — no path traversal via "..", no nested paths.
  if (!filename || filename.includes("/") || filename.includes("..")) {
    return NextResponse.json({ message: "ไม่พบไฟล์" }, { status: 400 });
  }

  const contentType = MIME_TYPES[path.extname(filename).toLowerCase()];
  if (!contentType) {
    return NextResponse.json({ message: "ไม่พบไฟล์" }, { status: 404 });
  }

  try {
    const data = await readFile(path.join(UPLOAD_DIR, filename));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        // Filenames are timestamp+uuid, so the same name is never reused for different
        // content — safe to cache aggressively.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[api/files][GET] ERROR", { filename, error });
    return NextResponse.json({ message: "ไม่พบไฟล์" }, { status: 404 });
  }
}

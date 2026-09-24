import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { auth } from "@/auth";

// Saved under public/uploads so Next.js's standalone server serves them directly as static
// files (no separate Route Handler needed for reads) — in production this directory is a
// Coolify Persistent Volume mount, so files survive redeploys instead of living only in the
// container's throwaway filesystem.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: NextRequest) {
  console.log("[api/upload][POST] START");

  const session = await auth();
  if (!session?.user?.id) {
    console.error("[api/upload][POST] ERROR", { reason: "not authenticated" });
    return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("[api/upload][POST] ERROR", { reason: "invalid form data", error });
    return NextResponse.json({ success: false, message: "ข้อมูลคำขอไม่ถูกต้อง" }, { status: 400 });
  }

  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ success: false, message: "ไม่พบไฟล์ที่แนบ" }, { status: 400 });
  }

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      console.error("[api/upload][POST] ERROR", { reason: "unsupported file type", type: file.type });
      return NextResponse.json(
        { success: false, message: `รองรับเฉพาะไฟล์รูปภาพ (jpg, png, webp, gif) — "${file.name}" ไม่ใช่รูปภาพที่รองรับ` },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      console.error("[api/upload][POST] ERROR", { reason: "file too large", name: file.name, size: file.size });
      return NextResponse.json(
        { success: false, message: `ไฟล์ "${file.name}" มีขนาดเกิน 5MB` },
        { status: 400 }
      );
    }
  }

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });

    const uploaded = await Promise.all(
      files.map(async (file) => {
        const ext = path.extname(file.name).toLowerCase();
        const safeName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
        const bytes = Buffer.from(await file.arrayBuffer());
        await writeFile(path.join(UPLOAD_DIR, safeName), bytes);
        return { name: file.name, url: `/uploads/${safeName}` };
      })
    );

    console.log("[api/upload][POST] END", { count: uploaded.length, by: session.user.id });
    return NextResponse.json({ success: true, images: uploaded });
  } catch (error) {
    console.error("[api/upload][POST] ERROR", { reason: "write failed", error });
    return NextResponse.json({ success: false, message: "อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" }, { status: 500 });
  }
}

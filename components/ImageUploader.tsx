"use client";

import { useRef, useState } from "react";
import { Loader2, UploadCloud, X } from "lucide-react";
import { TicketImage } from "@/lib/types";

interface ImageUploaderProps {
  images: TicketImage[];
  onChange: (images: TicketImage[]) => void;
  maxImages?: number;
  // Optional — lets the parent form disable its submit button while an upload is still in
  // flight, so a ticket can never be created/completed referencing a not-yet-saved image.
  onUploadingChange?: (uploading: boolean) => void;
}

export default function ImageUploader({ images, onChange, maxImages, onUploadingChange }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [uploadingCount, setUploadingCount] = useState(0);
  const reachedMax = maxImages !== undefined && images.length >= maxImages;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const incoming = Array.from(files);

    const allowedCount = maxImages !== undefined ? Math.max(0, maxImages - images.length) : incoming.length;
    const toUpload = incoming.slice(0, allowedCount);
    if (incoming.length > allowedCount) {
      setError(`แนบรูปภาพได้สูงสุด ${maxImages} รูป`);
    } else {
      setError("");
    }
    if (toUpload.length === 0) return;

    setUploadingCount((c) => c + toUpload.length);
    onUploadingChange?.(true);
    try {
      const formData = new FormData();
      for (const file of toUpload) formData.append("files", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message ?? "อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        return;
      }

      const uploaded: TicketImage[] = data.images;
      onChange([...images, ...uploaded]);
    } catch (err) {
      console.error("[ImageUploader][handleFiles] ERROR", { error: err });
      setError("อัปโหลดรูปภาพไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่อีกครั้ง");
    } finally {
      setUploadingCount((c) => Math.max(0, c - toUpload.length));
      onUploadingChange?.(false);
    }
  }

  function removeImage(name: string) {
    setError("");
    onChange(images.filter((img) => img.name !== name));
  }

  const isUploading = uploadingCount > 0;

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = "";
        }}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={reachedMax || isUploading}
        className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition hover:border-[var(--brand-primary)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-[var(--gridline)]"
        style={{ borderColor: "var(--gridline)" }}
      >
        {isUploading ? (
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--brand-primary)" }} aria-hidden />
        ) : (
          <UploadCloud className="h-6 w-6" style={{ color: "var(--text-muted)" }} aria-hidden />
        )}
        <span className="text-sm font-medium text-[var(--text-secondary)]">
          {isUploading
            ? `กำลังอัปโหลด ${uploadingCount} รูป...`
            : reachedMax
              ? "แนบรูปภาพครบตามจำนวนแล้ว"
              : "คลิกเพื่อเลือกรูปภาพ"}
        </span>
        <span className="text-xs text-[var(--text-muted)]">
          {maxImages !== undefined
            ? `แนบได้สูงสุด ${maxImages} รูป (${images.length}/${maxImages})`
            : "รองรับไฟล์ภาพหลายไฟล์"}
        </span>
      </button>

      {error && (
        <p className="animate-fade-in mt-2 text-sm" style={{ color: "var(--status-critical)" }}>
          {error}
        </p>
      )}

      {images.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {images.map((img) => (
            <div
              key={img.name}
              className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border"
              style={{ borderColor: "var(--border-hairline)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(img.name)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                aria-label={`ลบรูป ${img.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

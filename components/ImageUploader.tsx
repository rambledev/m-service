"use client";

import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { TicketImage } from "@/lib/types";

interface ImageUploaderProps {
  images: TicketImage[];
  onChange: (images: TicketImage[]) => void;
  maxImages?: number;
}

export default function ImageUploader({ images, onChange, maxImages }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const reachedMax = maxImages !== undefined && images.length >= maxImages;

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const incoming: TicketImage[] = Array.from(files).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    const combined = [...images, ...incoming];

    if (maxImages !== undefined && combined.length > maxImages) {
      setError(`แนบรูปภาพได้สูงสุด ${maxImages} รูป`);
      onChange(combined.slice(0, maxImages));
    } else {
      setError("");
      onChange(combined);
    }
  }

  function removeImage(name: string) {
    setError("");
    onChange(images.filter((img) => img.name !== name));
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={reachedMax}
        className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition hover:border-[var(--brand-primary)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-[var(--gridline)]"
        style={{ borderColor: "var(--gridline)" }}
      >
        <UploadCloud className="h-6 w-6" style={{ color: "var(--text-muted)" }} aria-hidden />
        <span className="text-sm font-medium text-[var(--text-secondary)]">
          {reachedMax ? "แนบรูปภาพครบตามจำนวนแล้ว" : "คลิกเพื่อเลือกรูปภาพ"}
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

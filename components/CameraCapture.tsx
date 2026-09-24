"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Camera, RefreshCw, X } from "lucide-react";
import Button from "@/components/Button";

// Live in-browser camera capture via getUserMedia — deliberately NOT the
// `<input capture>` shortcut, which hands off to the OS camera app and re-prompts every time.
// getUserMedia asks for camera permission through the browser's normal, one-time-per-origin
// permission prompt: once the person allows it, the browser remembers that choice for this
// site and never asks again (that memory is the browser's, not something this app manages).
export default function CameraCapture({
  onCapture,
  onClose,
}: {
  onCapture: (file: File) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      setReady(false);
      setError("");
      stopStream();

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("อุปกรณ์หรือเบราว์เซอร์นี้ไม่รองรับการใช้กล้อง");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setReady(true);
      } catch (err) {
        console.error("[CameraCapture][startCamera] ERROR", { error: err });
        if (cancelled) return;
        if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")) {
          setError("ไม่ได้รับอนุญาตให้ใช้กล้อง กรุณาอนุญาตการใช้กล้องในเบราว์เซอร์แล้วลองใหม่อีกครั้ง");
        } else if (err instanceof DOMException && err.name === "NotFoundError") {
          setError("ไม่พบกล้องบนอุปกรณ์นี้");
        } else {
          setError("ไม่สามารถเปิดกล้องได้ กรุณาลองใหม่อีกครั้ง");
        }
      }
    }

    function stopStream() {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    void startCamera();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [facingMode]);

  function handleClose() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onClose();
  }

  function handleCapture() {
    const video = videoRef.current;
    if (!video || !ready) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
        handleClose();
      },
      "image/jpeg",
      0.9
    );
  }

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between p-4">
        <button
          type="button"
          onClick={handleClose}
          aria-label="ปิดกล้อง"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
        {ready && (
          <button
            type="button"
            onClick={() => setFacingMode((m) => (m === "environment" ? "user" : "environment"))}
            aria-label="สลับกล้อง"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <RefreshCw className="h-5 w-5" aria-hidden />
          </button>
        )}
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {error ? (
          <div className="flex max-w-sm flex-col items-center gap-2 px-6 text-center text-white">
            <AlertCircle className="h-8 w-8 text-red-400" aria-hidden />
            <p className="text-sm">{error}</p>
            <Button variant="secondary" onClick={handleClose} className="mt-3">
              ปิด
            </Button>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-contain" />
        )}
      </div>

      {ready && !error && (
        <div className="flex items-center justify-center p-6">
          <button
            type="button"
            onClick={handleCapture}
            aria-label="ถ่ายภาพ"
            className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 transition hover:bg-white/30 active:scale-95"
          >
            <Camera className="h-7 w-7 text-white" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

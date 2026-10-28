"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { AlertCircle, Lock } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.87.92 7.53 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.92-2.14 15.89-5.82l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function LoginInner() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (status !== "authenticated") return;
    // Home page already knows how to route a signed-in user to their role's dashboard.
    router.replace("/");
  }, [status, router]);

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{ background: "linear-gradient(160deg, #fdfcfb 0%, #f7f5fb 50%, #f6faf7 100%)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage: "radial-gradient(circle, rgba(106,90,140,0.35) 1.4px, transparent 1.4px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-[26rem] w-[26rem] rounded-full blur-3xl"
        style={{ backgroundColor: "#6a5a8c", opacity: 0.18 }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 top-10 h-[22rem] w-[22rem] rounded-full blur-3xl"
        style={{ backgroundColor: "#b3455f", opacity: 0.14 }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[-7rem] left-1/3 h-[26rem] w-[26rem] rounded-full blur-3xl"
        style={{ backgroundColor: "#357a51", opacity: 0.16 }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[-6rem] right-[-5rem] h-[22rem] w-[22rem] rounded-full blur-3xl"
        style={{ backgroundColor: "#b05d28", opacity: 0.14 }}
        aria-hidden
      />

      <div className="relative z-10 flex items-center gap-3 px-6 pt-6 lg:px-12 lg:pt-10">
        <Image
          src="/logo_rmu.png"
          alt="ตราสัญลักษณ์มหาวิทยาลัยราชภัฏมหาสารคาม"
          width={40}
          height={40}
          priority
          className="shrink-0 object-contain"
        />
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">มหาวิทยาลัยราชภัฏมหาสารคาม</p>
          <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
            Rajabhat Maha Sarakham University
          </p>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center gap-10 px-6 py-10 lg:flex-row lg:items-center lg:gap-0 lg:px-12">
        <div className="flex flex-col items-center text-center lg:flex-1 lg:items-start lg:text-left">
          <div className="mb-6 drop-shadow-sm">
            <BrandLogo size={110} />
          </div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--brand-primary)]">ระบบแจ้งซ่อม</p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--text-primary)] lg:text-4xl">
            แจ้งซ่อม ติดตามงาน จบในที่เดียว
          </h1>
          <div className="mt-4 h-1 w-14 rounded-full bg-[var(--brand-primary)]" />
          <p className="mt-4 max-w-sm text-sm text-[var(--text-secondary)]">
            ฝ่ายงานอาคารและสถานที่ มหาวิทยาลัยราชภัฏมหาสารคาม
          </p>
          <p className="mt-1 max-w-sm text-xs text-[var(--text-muted)]">
            แจ้งปัญหา มอบหมายช่าง และติดตามสถานะงานซ่อมบำรุง แบบ real-time
          </p>
        </div>

        <div className="flex justify-center lg:flex-1">
          <div
            className="animate-fade-in w-full max-w-sm rounded-2xl border bg-white p-8 shadow-xl"
            style={{ borderColor: "var(--border-hairline)" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-primary-soft)]">
                <Lock className="h-5 w-5 text-[var(--brand-primary)]" aria-hidden />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)]">เข้าสู่ระบบ</h2>
                <p className="text-xs text-[var(--text-muted)]">สำหรับผู้ใช้งานที่ได้รับสิทธิ์</p>
              </div>
            </div>

            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              disabled={status === "loading"}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
              style={{ backgroundColor: "var(--brand-primary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--brand-primary-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--brand-primary)")}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white">
                <GoogleIcon className="h-3.5 w-3.5" />
              </span>
              เข้าสู่ระบบด้วยบัญชี Google
            </button>

            {error && (
              <div
                className="animate-fade-in mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-left text-sm"
                style={{
                  borderColor: "var(--status-critical)",
                  backgroundColor: "var(--status-critical-soft)",
                  color: "var(--status-critical)",
                }}
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>
                  บัญชีนี้ยังไม่ได้รับสิทธิ์ให้เข้าใช้งานระบบ m-service
                  กรุณาติดต่อผู้ดูแลระบบหากคิดว่าควรมีสิทธิ์เข้าใช้งาน
                </span>
              </div>
            )}

            <ul
              className="mt-6 space-y-2 border-t pt-4 text-xs text-[var(--text-muted)]"
              style={{ borderColor: "var(--border-hairline)" }}
            >
              <li className="flex gap-2">
                <span aria-hidden>•</span>
                <span>ใช้บัญชี Google ที่ผู้ดูแลระบบอนุญาตให้ใช้งาน</span>
              </li>
              <li className="flex gap-2">
                <span aria-hidden>•</span>
                <span>ระบบจะพาไปยังหน้าที่เหมาะกับสิทธิ์ของคุณโดยอัตโนมัติ</span>
              </li>
              <li className="flex gap-2">
                <span aria-hidden>•</span>
                <span>หากเข้าใช้งานไม่ได้ กรุณาติดต่อผู้ดูแลระบบ</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <p className="relative z-10 px-6 pb-6 text-center text-xs text-[var(--text-muted)] lg:px-12 lg:pb-8 lg:text-left">
        © 2569 มหาวิทยาลัยราชภัฏมหาสารคาม · ระบบแจ้งซ่อม ฝ่ายงานอาคารและสถานที่
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

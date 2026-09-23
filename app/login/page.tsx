"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { AlertCircle } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden>
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
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in srgb, var(--brand-primary) 8%, transparent), var(--page-plane) 60%)",
      }}
    >
      <div className="animate-fade-in flex flex-col items-center text-center">
        <div className="mb-4">
          <BrandLogo size={64} />
        </div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">m-service</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          ระบบแจ้งซ่อมภายในมหาวิทยาลัย
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          disabled={status === "loading"}
          className="mt-10 flex items-center gap-3 rounded-xl border bg-[var(--surface-2)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
          style={{ borderColor: "var(--border-hairline)" }}
        >
          <GoogleIcon />
          เข้าสู่ระบบด้วย Google
        </button>

        {error && (
          <div
            className="animate-fade-in mt-4 flex max-w-sm items-start gap-2 rounded-xl border px-4 py-3 text-left text-sm"
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
      </div>

      <p className="mt-10 text-xs text-[var(--text-muted)]">
        เข้าถึงได้เฉพาะบัญชีที่ได้รับอนุญาตล่วงหน้าเท่านั้น
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

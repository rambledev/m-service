import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-thai-sans",
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "m-service | ระบบแจ้งซ่อมภายในมหาวิทยาลัย",
  description: "ระบบแจ้งซ่อมภายในมหาวิทยาลัย (Demo Prototype)",
  icons: { icon: "/logo-service.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${notoSansThai.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <AppProvider>{children}</AppProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

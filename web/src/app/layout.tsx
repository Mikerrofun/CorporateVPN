import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Corporate VPN",
  description: "Корпоративный VPN-сервис",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body className={inter.className}>
        <div className="relative min-h-screen overflow-x-hidden bg-bg text-slate-100">
          {/* Ambient Background Glows */}
          <div className="pointer-events-none absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[130px]" />
          <div className="pointer-events-none absolute -right-48 top-1/3 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[130px]" />
          
          <div className="relative z-10 flex min-h-screen flex-col">
            <Providers>{children}</Providers>
          </div>
        </div>
      </body>
    </html>
  );
}

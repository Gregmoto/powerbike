import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: { default: "Powerbike – Inspiration inom MC-världen", template: "%s | Powerbike" },
  description: "Nyheter, tester, utrustning och events från MC-världen. Powerbike är din källa för motorcykelinspiration.",
  openGraph: {
    siteName: "Powerbike",
    type: "website",
    locale: "sv_SE",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = false; // Layout hanterar admin separat via src/app/admin/layout.tsx

  return (
    <html lang="sv" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-white">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}

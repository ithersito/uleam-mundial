import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GYPS 🎰 – Gana Y Pasa el Semestre",
  description: "GYPS – Sistema de Predicciones del Mundial de Fútbol 2026. ¡Haz tu jugada!",
  icons: {
    icon: "/logo-gyps.png",
    apple: "/logo-gyps.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-casino-dark text-foreground scanlines casino-grid-bg">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Termômetro de Arrecadação - Alargando Fronteiras",
  description: "Acompanhe em tempo real nosso progresso para a meta de R$ 1.200.000,00!",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head />
      <body
        className={`${inter.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Termômetro de Arrecadação - Alargando Fronteiras",
  description: "Acompanhe em tempo real nosso progresso para a meta de R$ 1.200.000,00!",
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
        <Header />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}

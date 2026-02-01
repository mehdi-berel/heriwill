import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RevenueCatProvider } from "@/contexts/RevenueCatContext";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Heriwill Pro - Digital Legacy Planning",
  description: "Plan your digital legacy and preserve your memories for future generations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <RevenueCatProvider>
          {children}
        </RevenueCatProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

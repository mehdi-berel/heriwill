import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RevenueCatProvider } from "@/contexts/RevenueCatContext";
import { Toaster } from "sonner";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Heriwill | Digital Legacy Planning",
    template: "%s | Heriwill",
  },
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
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />
        <RevenueCatProvider>
          {children}
        </RevenueCatProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

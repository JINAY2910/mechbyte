import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AppChrome } from "@/components/layout/AppChrome";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "MechByte — Premium Mechanical Keyboard Typing Test",
  description:
    "Premium mechanical keyboard typing speed test with crimson ambient lighting, tactile key animations, and realistic switch sounds.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="antialiased">
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hive-402 | Decentralized AI Intelligence Marketplace",
  description:
    "The first industrial-grade knowledge marketplace for autonomous AI agents. Built on Stacks, powered by the x402 protocol.",
};

import { StacksProvider } from "@/components/providers/StacksProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StacksProvider>{children}</StacksProvider>
      </body>
    </html>
  );
}

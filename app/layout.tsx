import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RefCapture from "@/components/RefCapture";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.SITE_URL || "https://jobfinderai.com";

const TITLE = "JobFinder AI — We Match Your CV to the Highest-Paying Jobs";
const DESCRIPTION =
  "Build your CV once. We match it against live postings from real job board APIs to find the roles that fit your skills and pay the most, then help you land and track every application.";

export const metadata: Metadata = {
  // Lets the file-based OG images (and any relative metadata URLs) resolve to
  // absolute URLs so social crawlers can fetch them.
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "JobFinder AI",
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="grain-overlay" />
        <RefCapture />
        {children}
      </body>
    </html>
  );
}

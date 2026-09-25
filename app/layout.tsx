import type { Metadata } from "next";

import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://arjun902.github.io/arjun-neupane-academic-hub"
).replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl}/`),
  title: {
    default: "Arjun Neupane | Teaching, Research & Academic Resources",
    template: "%s | Arjun Neupane",
  },
  description:
    "Course resources and information about the teaching, research, and workshops of Arjun Neupane in Kathmandu.",
  keywords: [
    "Arjun Neupane",
    "BCA course resources",
    "BSc CSIT course resources",
    "BE Computer Engineering course resources",
    "computer engineering education",
    "Kathmandu",
  ],
  openGraph: {
    title: "Arjun Neupane | Academic Hub",
    description:
      "Course resources and information about the teaching and research of Arjun Neupane.",
    images: [`${siteUrl}/assets/arjun-neupane-profile.webp`],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isProduction = process.env.NODE_ENV === "production";
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {isProduction ? (
          <meta
            httpEquiv="Content-Security-Policy"
            content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests"
          />
        ) : null}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body suppressHydrationWarning>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

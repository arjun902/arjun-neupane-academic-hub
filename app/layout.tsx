import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://arjunneupane.edu.np"),
  title: {
    default: "Er. Arjun Neupane | Academic Resource Hub",
    template: "%s | Er. Arjun Neupane"
  },
  description:
    "Academic portfolio and student resource hub for BCA, CSIT and BE students by Er. Arjun Neupane, Computer Engineer, Lecturer, Researcher and Academic Mentor in Kathmandu, Nepal.",
  keywords: [
    "BCA Notes Nepal",
    "CSIT Notes Nepal",
    "BE Computer Engineering Notes",
    "Computer Networking Notes",
    "Java Programming Notes",
    "C Programming Lab Report",
    "BCA Project Ideas",
    "Internship Report Format",
    "Er Arjun Neupane LinkedIn",
    "Kathmandu Model College",
    "National College of Computer Studies",
    "Kathmandu Business Campus",
    "Ambition Academy"
  ],
  openGraph: {
    title: "Er. Arjun Neupane | Academic Resource Hub",
    description: "Structured learning resources, academic mentoring, and professional profile of Er. Arjun Neupane.",
    images: ["/assets/arjun-neupane-profile.png"],
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const bodyStyle = {
    "--hero-image": `url("${basePath}/assets/academic-tech-hero.png")`
  } as CSSProperties;

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning style={bodyStyle}>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

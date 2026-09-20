import type { Metadata } from "next";
import { SecureGradingPortal } from "@/components/grading-portal";

export const metadata: Metadata = {
  title: "Grading Portal",
  description: "Account access for assessment results and teacher feedback.",
  robots: { index: false, follow: false }
};

export default function GradingPage() {
  return <SecureGradingPortal />;
}

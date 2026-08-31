import type { Metadata } from "next";
import { SecureStudentDashboard } from "@/components/student-dashboard";

export const metadata: Metadata = {
  title: "Student Dashboard",
  description: "Account access for course files, assessments, assignment submissions and notices.",
  robots: { index: false, follow: false }
};

export default function StudentPage() {
  return <SecureStudentDashboard />;
}

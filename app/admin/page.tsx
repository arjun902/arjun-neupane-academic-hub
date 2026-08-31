import type { Metadata } from "next";
import { SecureAdminDashboard } from "@/components/admin-dashboard";

export const metadata: Metadata = {
  title: "Staff Dashboard",
  description: "Account access for teaching and academic administration.",
  robots: { index: false, follow: false }
};

export default function AdminPage() {
  return <SecureAdminDashboard />;
}
